// TWILIO-AUTH: Replace stub with real session-based auth
// When Twilio is wired, this will:
// 1. Read JWT from httpOnly cookie
// 2. Decode to get { phone, userId }
// 3. Look up User by phone
// For now, returns a stub dev user so everything works without login.

import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

/**
 * Get the authenticated user for the current request.
 * TWILIO-AUTH: Currently returns a dev stub. Replace with JWT session lookup.
 */
export async function getAuthUser() {
    // TWILIO-AUTH: Uncomment when Twilio is wired:
    // const token = cookies().get("nc_session")?.value;
    // if (!token) return null;
    // const payload = verifyJwt(token);
    // if (!payload) return null;
    // await connectMongo();
    // return User.findOne({ phone: payload.phone });

    // Stub: return first user with hostingOn, or create a dev user
    await connectMongo();
    let user = await User.findOne({ hostingOn: true });
    if (!user) {
        user = await User.create({
            phone: "+1dev0000000",
            name: "Dev User",
            hostingOn: true,
        });
    }
    return user;
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
