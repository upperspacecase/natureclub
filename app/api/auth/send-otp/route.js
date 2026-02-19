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

        // Twilio-specific error codes
        const code = error.code || error.status;

        // Invalid phone number
        if (code === 21211 || code === 21614 || code === 60200) {
            return NextResponse.json(
                { error: "That doesn't look like a valid phone number. Please check and try again." },
                { status: 400 }
            );
        }

        // Rate-limit / too many attempts
        if (code === 60203) {
            return NextResponse.json(
                { error: "Too many attempts. Please wait a few minutes." },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { error: "Failed to send verification code. Please try again." },
            { status: 500 }
        );
    }
}
