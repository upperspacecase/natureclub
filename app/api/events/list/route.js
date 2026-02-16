import { auth } from "@clerk/nextjs/server";
import connectMongo from "@/libs/mongoose";
import BookingEvent from "@/models/BookingEvent";
import Facilitator from "@/models/Facilitator";
import Rsvp from "@/models/Rsvp";

// GET — List all events for the authenticated facilitator
export async function GET(req) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectMongo();

        const facilitator = await Facilitator.findOne({ clerkUserId: userId });
        if (!facilitator) {
            return Response.json({ events: [] });
        }

        const events = await BookingEvent.find({ facilitatorId: facilitator._id })
            .sort({ createdAt: -1 })
            .lean();

        // Attach RSVP counts
        const eventsWithCounts = await Promise.all(
            events.map(async (event) => {
                const rsvpCount = await Rsvp.countDocuments({
                    eventId: event._id,
                    status: "confirmed",
                });
                return {
                    ...event,
                    id: event._id.toString(),
                    rsvpCount,
                };
            })
        );

        return Response.json({ events: eventsWithCounts });
    } catch (error) {
        console.error("GET /api/events/list error:", error);
        return Response.json({ error: "Failed to list events" }, { status: 500 });
    }
}
