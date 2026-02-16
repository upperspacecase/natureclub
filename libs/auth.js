import { auth, currentUser } from "@clerk/nextjs/server";
import connectMongo from "@/libs/mongoose";
import Facilitator from "@/models/Facilitator";

/**
 * Get the authenticated facilitator for the current request.
 * Creates a Facilitator record on first sign-in (lazy bootstrapping).
 * Returns null if not authenticated.
 */
export async function getAuthFacilitator() {
    const { userId } = await auth();
    if (!userId) return null;

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

    return facilitator;
}

/**
 * Require auth — returns facilitator or throws 401.
 * Use in API route handlers.
 */
export async function requireFacilitator() {
    const facilitator = await getAuthFacilitator();
    if (!facilitator) {
        throw new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }
    return facilitator;
}
