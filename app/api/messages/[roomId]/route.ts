import { NextRequest, NextResponse } from "next/server"
import prisma from "../../../../packages/db/client"

export async function GET(request: NextRequest, context: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await context.params

  const messages = await prisma.message.findMany({
    where: { roomId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(messages)
}
