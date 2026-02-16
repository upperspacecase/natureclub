import { auth, currentUser } from "@clerk/nextjs/server";
import connectMongo from "@/libs/mongoose";
import Facilitator from "@/models/Facilitator";
import { isReservedUsername } from "@/libs/reserved-usernames";

// GET — Get the current facilitator's profile
export async function GET(req) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectMongo();
        let facilitator = await Facilitator.findOne({ clerkUserId: userId });

        if (!facilitator) {
            const user = await currentUser();
            facilitator = await Facilitator.create({
                clerkUserId: userId,
                name: user.firstName
                    ? `${user.firstName} ${user.lastName || ""}`.trim()
                    : "Facilitator",
                email: user.emailAddresses?.[0]?.emailAddress || "",
            });
        }

        return Response.json(facilitator.toJSON());
    } catch (error) {
        console.error("GET /api/facilitator error:", error);
        return Response.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
}

// PATCH — Update facilitator profile
export async function PATCH(req) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        await connectMongo();

        const facilitator = await Facilitator.findOne({ clerkUserId: userId });
        if (!facilitator) {
            return Response.json({ error: "Profile not found" }, { status: 404 });
        }

        // Handle username change
        if (body.username !== undefined) {
            const cleanUsername = body.username.toLowerCase().trim().replace(/[^a-z0-9\-_]/g, "");

            if (cleanUsername && cleanUsername !== facilitator.username) {
                if (isReservedUsername(cleanUsername)) {
                    return Response.json(
                        { error: "This username is not available" },
                        { status: 400 }
                    );
                }

                const existing = await Facilitator.findOne({
                    username: cleanUsername,
                    _id: { $ne: facilitator._id },
                });

                if (existing) {
                    return Response.json(
                        { error: "This username is already taken" },
                        { status: 400 }
                    );
                }

                facilitator.username = cleanUsername;
            }
        }

        // Update other fields
        const allowedFields = ["name", "bio", "phone", "photoUrl"];
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                facilitator[field] = body[field];
            }
        }

        await facilitator.save();
        return Response.json(facilitator.toJSON());
    } catch (error) {
        console.error("PATCH /api/facilitator error:", error);
        return Response.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
