import { NextResponse } from "next/server";
import { adminAuth } from "@/libs/firebase-admin";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

const SESSION_EXPIRY = 14 * 24 * 60 * 60 * 1000; // 14 days (Firebase max)

export async function POST(req) {
    try {
        const { idToken } = await req.json();
        if (!idToken) {
            return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
        }

        // Verify the Firebase ID token
        const decoded = await adminAuth.verifyIdToken(idToken);
        const { uid, email, name, picture } = decoded;

        // Create a Firebase session cookie
        const sessionCookie = await adminAuth.createSessionCookie(idToken, {
            expiresIn: SESSION_EXPIRY,
        });

        // Find or create user in MongoDB
        await connectMongo();
        let user = await User.findOne({
            $or: [{ firebaseUid: uid }, ...(email ? [{ email }] : [])],
        });

        if (!user) {
            user = await User.create({
                email,
                firebaseUid: uid,
                name: name || "",
                photoUrl: picture || "",
            });
        } else if (!user.firebaseUid) {
            user.firebaseUid = uid;
            if (email && !user.email) user.email = email;
            if (picture && !user.photoUrl) user.photoUrl = picture;
            if (name && !user.name) user.name = name;
            await user.save();
        }

        // Set the session cookie
        const response = NextResponse.json({ user: user.toJSON() });
        response.cookies.set("nc_session", sessionCookie, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 14 * 24 * 60 * 60, // 14 days in seconds
        });

        return response;
    } catch (err) {
        console.error("Google auth error:", err.code, err.message, err.errorInfo || "");
        return NextResponse.json(
            { error: err.message || "Authentication failed", code: err.code || "unknown" },
            { status: 401 }
        );
    }
}
