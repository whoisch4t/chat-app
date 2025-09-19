import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../packages/db/client.ts";
import argon2 from "argon2";
import { SignJWT } from "jose";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
        const valid = await argon2.verify(user.password, password);
        if (!valid) return NextResponse.json({ error: "Invalid password" }, { status: 401 });
        const token = await new SignJWT({ sub: user.id })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("7d")
            .sign(new TextEncoder().encode(process.env.JWT_SECRET!));
        const res = NextResponse.json({ user });
        res.cookies.set("auth", token, { httpOnly: true });
        return res;
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }
}
