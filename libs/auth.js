import { cookies } from "next/headers";
import { verifySessionToken } from "@/libs/jwt";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

/**
 * Get the authenticated user for the current request.
 * Reads the nc_session JWT cookie, verifies it, and looks up the User.
 */
export async function getAuthUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("nc_session")?.value;
    if (!token) return null;

    const payload = verifySessionToken(token);
    if (!payload?.phone) return null;

    await connectMongo();
    return User.findOne({ phone: payload.phone });
}

/**
 * Require auth — returns user or throws 401 Response.
 * Use in API route handlers.
 */
export async function requireAuthUser() {
    const user = await getAuthUser();
    if (!user) {
        throw new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }
    return user;
}
