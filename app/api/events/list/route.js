import connectMongo from "@/libs/mongoose";
import BookingEvent from "@/models/BookingEvent";
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

        const counts = await Rsvp.aggregate([
            {
                $match: {
                    eventId: { $in: events.map((e) => e._id) },
                    status: "confirmed",
                },
            },
            { $group: { _id: "$eventId", n: { $sum: 1 } } },
        ]);
        const countMap = new Map(counts.map((c) => [String(c._id), c.n]));

        const eventsWithCounts = events.map((event) => ({
            ...event,
            coverPhotoUrl: event.coverPhotoUrl || "",
            id: event._id.toString(),
            rsvpCount: countMap.get(String(event._id)) || 0,
        }));

        return Response.json({ events: eventsWithCounts });
    } catch (error) {
        console.error("GET /api/events/list error:", error);
        return Response.json({ error: "Failed to list events" }, { status: 500 });
    }
}

