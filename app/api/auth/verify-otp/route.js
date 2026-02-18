import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyOtp } from "@/libs/twilio";
import { signSessionToken, SESSION_COOKIE } from "@/libs/jwt";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

export async function POST(req) {
    try {
        const { phone, code } = await req.json();

        if (!phone || !code) {
            return NextResponse.json(
                { error: "Phone and code are required" },
                { status: 400 }
            );
        }

        const clean = phone.replace(/[\s\-()]/g, "");

        // Verify the OTP code with Twilio
        const valid = await verifyOtp(clean, code);
        if (!valid) {
            return NextResponse.json(
                { error: "Invalid or expired code. Please try again." },
                { status: 401 }
            );
        }

        // Find or create user
        await connectMongo();
        let user = await User.findOne({ phone: clean });

        if (!user) {
            user = await User.create({ phone: clean });
        }

        // Sign session JWT
        const token = signSessionToken({
            phone: clean,
            userId: user._id.toString(),
        });

        // Set httpOnly session cookie
        const cookieStore = await cookies();
        cookieStore.set(SESSION_COOKIE.name, token, SESSION_COOKIE.options);

        return NextResponse.json({
            user: user.toJSON(),
        });
    } catch (error) {
        console.error("POST /api/auth/verify-otp error:", error);
        return NextResponse.json(
            { error: "Verification failed" },
            { status: 500 }
        );
    }
}
