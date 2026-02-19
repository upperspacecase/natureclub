import connectMongo from "@/libs/mongoose";
import BookingEvent from "@/models/BookingEvent";
// User model registered via BookingEvent population if needed
import Rsvp from "@/models/Rsvp";
import { getAuthUser } from "@/libs/auth";

// GET — List all events for the authenticated user
export async function GET(_req) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectMongo();

        const events = await BookingEvent.find({ createdBy: user._id })
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
