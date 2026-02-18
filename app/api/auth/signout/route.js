import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/libs/jwt";

export async function POST() {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE.name, "", {
        ...SESSION_COOKIE.options,
        maxAge: 0, // expire immediately
    });

    return NextResponse.json({ ok: true });
}
