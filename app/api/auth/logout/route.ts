import { NextResponse } from "next/server";

export const POST = async () => {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("auth", "", { httpOnly: true, expires: new Date(0) });
    return res;
};
