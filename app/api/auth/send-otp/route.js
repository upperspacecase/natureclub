import { NextResponse } from "next/server";
import { sendOtp } from "@/libs/twilio";

export async function POST(req) {
    try {
        const { phone } = await req.json();

        if (!phone) {
            return NextResponse.json(
                { error: "Phone number is required" },
                { status: 400 }
            );
        }

        // Validate E.164 format
        const clean = phone.replace(/[\s\-()]/g, "");
        if (!/^\+\d{7,15}$/.test(clean)) {
            return NextResponse.json(
                { error: "Please enter a valid phone number with country code (e.g. +1...)" },
                { status: 400 }
            );
        }

        await sendOtp(clean);

        return NextResponse.json({ ok: true, phone: clean });
    } catch (error) {
        console.error("POST /api/auth/send-otp error:", error);

        // Twilio rate-limit / bad number errors
        if (error.code === 60203) {
            return NextResponse.json(
                { error: "Too many attempts. Please wait a few minutes." },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { error: "Failed to send verification code" },
            { status: 500 }
        );
    }
}
