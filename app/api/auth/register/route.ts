import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../packages/db/client";
import argon2 from "argon2";
import { SignJWT } from "jose";

export async function POST(req: NextRequest) {
    try {
        const { email, password, name } = await req.json();
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }
        const hash = await argon2.hash(password);
        const user = await prisma.user.create({
            data: { email, password: hash, name },
        });
        const token = await new SignJWT({ sub: user.id })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("7d")
            .sign(new TextEncoder().encode(process.env.JWT_SECRET!));
        const res = NextResponse.json({ user });
        res.cookies.set("auth", token, { httpOnly: true });
        return res;
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Register failed" }, { status: 500 });
    }
}
