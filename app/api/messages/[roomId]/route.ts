import { NextResponse } from "next/server";
import prisma from "../../../../packages/db/client.ts";

export async function GET(_: Request, { params }: { params: { roomId: string } }) {
    const messages = await prisma.message.findMany({
        where: { roomId: params.roomId },
        include: { user: true },
        orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(messages);
}
