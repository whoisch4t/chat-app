import { NextResponse } from "next/server";
import prisma from "../../../../packages/db/client.ts";

export async function GET() {
    const since = new Date(Date.now() - 2 * 60 * 1000);
    const users = await prisma.user.findMany({
        where: { lastSeen: { gte: since } },
        select: { id: true, name: true, email: true },
    });
    return NextResponse.json(users);
}