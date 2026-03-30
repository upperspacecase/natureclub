import connectMongo from "@/libs/mongoose";
import Rsvp from "@/models/Rsvp";
import BookingEvent from "@/models/BookingEvent";
import { getAuthUser } from "@/libs/auth";

// GET -- Return events the authenticated user has RSVP'd to
export async function GET() {
    try {
        const user = await getAuthUser();
        if (!user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectMongo();

        // Find all non-cancelled RSVPs for this user
        const rsvps = await Rsvp.find({
            participantUserId: user._id,
            status: { $ne: "cancelled" },
        }).lean();

        if (rsvps.length === 0) {
            return Response.json({ events: [] });
        }

        // Fetch the associated events
        const eventIds = rsvps.map((r) => r.eventId);
        const events = await BookingEvent.find({
            _id: { $in: eventIds },
            status: { $ne: "draft" },
        })
            .sort({ dateTime: 1 })
            .lean();

        // Merge RSVP status onto each event
        const rsvpMap = {};
        for (const r of rsvps) {
            rsvpMap[r.eventId.toString()] = r.status;
        }

        const result = events.map((e) => ({
            id: e._id.toString(),
            title: e.title,
            slug: e.slug,
            dateTime: e.dateTime,
            durationMinutes: e.durationMinutes,
            activityType: e.activityType,
            coverPhotoUrl: e.coverPhotoUrl || "",
            meetingPoint: e.meetingPoint,
            groupSize: e.groupSize,
            status: e.status,
            rsvpStatus: rsvpMap[e._id.toString()] || "unknown",
        }));

        return Response.json({ events: result });
    } catch (error) {
        console.error("GET /api/rsvp/my-events error:", error);
        return Response.json({ error: "Failed to fetch" }, { status: 500 });
    }
}
