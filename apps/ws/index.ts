import { WebSocketServer, WebSocket } from "ws";
import { createServer, IncomingMessage } from "http";
import prisma from "../../packages/db/client";
import { jwtVerify } from "jose";
import { randomUUID } from "crypto";
import url from "url";

const server = createServer();
const wss = new WebSocketServer({ server });

type Client = { userId: string; roomId: string; ws: WebSocket };
const clients: Set<Client> = new Set();

const defaultRooms = ["sohbet-1", "sohbet-2", "sohbet-3", "sohbet-4", "sohbet-5"];

async function ensureRooms() {
    for (const name of defaultRooms) {
        await prisma.room.upsert({
            where: { name },
            update: {},
            create: { id: randomUUID(), name },
        });
    }
}
ensureRooms();

wss.on("connection", async (ws: WebSocket, req: IncomingMessage) => {
    try {
        const cookies = req.headers.cookie || "";
        const token = cookies
            .split(";")
            .map((s) => s.trim())
            .find((s) => s.startsWith("auth="))
            ?.slice(5);
        if (!token) return ws.close(4401, "unauthorized");

        const { payload } = await jwtVerify(
            token!,
            new TextEncoder().encode(process.env.JWT_SECRET!)
        );
        const userId = String(payload.sub);
        const { query } = url.parse(req.url || "", true);
        const roomName = typeof query.room === "string" ? query.room : "sohbet-1";
        const room = await prisma.room.findFirstOrThrow({ where: { name: roomName } });

        await prisma.roomMember.upsert({
            where: { userId_roomId: { userId, roomId: room.id } },
            update: {},
            create: { id: randomUUID(), userId, roomId: room.id },
        });

        clients.add({ userId, roomId: room.id, ws });

        const recent = await prisma.message.findMany({
            where: { roomId: room.id },
            orderBy: { createdAt: "asc" },
            take: 50,
            include: { user: true },
        });
        ws.send(JSON.stringify({ type: "init", messages: recent }));

        const onlineUsers = Array.from(clients)
            .filter((c) => c.roomId === room.id)
            .map((c) => c.userId);

        const users = await prisma.user.findMany({
            where: { id: { in: onlineUsers } },
            select: { id: true, name: true, email: true },
        });
        ws.send(JSON.stringify({ type: "users", users }));

        ws.on("message", async (raw: WebSocket.RawData) => {
            const data = JSON.parse(String(raw));

            if (data.type === "message") {
                const msg = await prisma.message.create({
                    data: {
                        id: randomUUID(),
                        roomId: room.id,
                        userId,
                        content: data.content ?? null,
                        fileUrl: data.fileUrl ?? null,
                    },
                    include: { user: true },
                });
                const payload = JSON.stringify({ type: "message", message: msg });
                for (const c of clients) if (c.roomId === room.id) c.ws.send(payload);
            }
        });

        ws.on("close", async () => {
            for (const c of clients) if (c.ws === ws) clients.delete(c);

            const onlineUsers = Array.from(clients)
                .filter((c) => c.roomId === room.id)
                .map((c) => c.userId);

            const users = await prisma.user.findMany({
                where: { id: { in: onlineUsers } },
                select: { id: true, name: true, email: true },
            });

            const payload = JSON.stringify({ type: "users", users });
            for (const c of clients) if (c.roomId === room.id) c.ws.send(payload);
        });
    } catch (err) {
        console.error("WS error", err);
        ws.close(1011, "error");
    }
});

const PORT = process.env.WS_PORT ? Number(process.env.WS_PORT) : 4001;
server.listen(PORT, () => console.log("ws on", PORT));
