import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import connectMongo from "@/libs/mongoose";
import BookingEvent from "@/models/BookingEvent";
import Facilitator from "@/models/Facilitator";
import { slugify } from "@/libs/slugify";

// POST — Create a new draft event
export async function POST(req) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectMongo();

        // Find or create facilitator
        let facilitator = await Facilitator.findOne({ clerkUserId: userId });
        if (!facilitator) {
            const { currentUser } = await import("@clerk/nextjs/server");
            const user = await currentUser();
            facilitator = await Facilitator.create({
                clerkUserId: userId,
                name: user.firstName
                    ? `${user.firstName} ${user.lastName || ""}`.trim()
                    : "Facilitator",
                email: user.emailAddresses?.[0]?.emailAddress || "",
            });
        }

        const event = await BookingEvent.create({
            facilitatorId: facilitator._id,
            status: "draft",
        });

        return Response.json({ id: event._id.toString() }, { status: 201 });
    } catch (error) {
        console.error("POST /api/events error:", error);
        return Response.json({ error: "Failed to create event" }, { status: 500 });
    }
}
