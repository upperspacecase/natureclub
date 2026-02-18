import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;
const EXPIRY = "30d"; // 30-day sessions

/**
 * Sign a session token containing { phone, userId }.
 */
export function signSessionToken({ phone, userId }) {
    if (!SECRET) {
        throw new Error("JWT_SECRET must be set");
    }
    return jwt.sign({ phone, userId }, SECRET, { expiresIn: EXPIRY });
}

/**
 * Verify and decode a session token.
 * @returns {{ phone: string, userId: string } | null}
 */
export function verifySessionToken(token) {
    if (!SECRET) {
        throw new Error("JWT_SECRET must be set");
    }
    try {
        return jwt.verify(token, SECRET);
    } catch {
        return null;
    }
}

/**
 * Cookie options for the nc_session cookie.
 */
export const SESSION_COOKIE = {
    name: "nc_session",
    options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    },
};
