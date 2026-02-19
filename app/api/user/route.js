import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { isReservedUsername } from "@/libs/reserved-usernames";
import { getAuthUser } from "@/libs/auth";

// GET — Get the current user's profile
export async function GET(_req) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        return Response.json(user.toJSON());
    } catch (error) {
        console.error("GET /api/user error:", error);
        return Response.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
}

// PATCH — Update user profile
export async function PATCH(req) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        await connectMongo();

        // Handle username change
        if (body.username !== undefined) {
            const cleanUsername = body.username.toLowerCase().trim().replace(/[^a-z0-9\-_]/g, "");

            if (cleanUsername && cleanUsername !== user.username) {
                if (isReservedUsername(cleanUsername)) {
                    return Response.json(
                        { error: "This username is not available" },
                        { status: 400 }
                    );
                }

                const existing = await User.findOne({
                    username: cleanUsername,
                    _id: { $ne: user._id },
                });

                if (existing) {
                    return Response.json(
                        { error: "This username is already taken" },
                        { status: 400 }
                    );
                }

                user.username = cleanUsername;
            }
        }

        // Update other fields
        const allowedFields = ["name", "bio", "phone", "photoUrl"];
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                user[field] = body[field];
            }
        }

        await user.save();
        return Response.json(user.toJSON());
    } catch (error) {
        console.error("PATCH /api/user error:", error);
        return Response.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
