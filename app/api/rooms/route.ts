import { NextResponse } from "next/server";
import prisma from "../../../packages/db/client";

export async function GET() {
    const rooms = await prisma.room.findMany({
        orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(rooms);
}
