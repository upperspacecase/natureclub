import connectMongo from "@/libs/mongoose";
import BookingEvent from "@/models/BookingEvent";
import Rsvp from "@/models/Rsvp";

// GET — Public endpoint: list published, public, upcoming events with coordinates
export async function GET() {
    try {
        await connectMongo();

        const now = new Date();

        const events = await BookingEvent.find({
            status: "published",
            isPublic: { $ne: false },
            dateTime: { $gte: now },
            "meetingPoint.lat": { $exists: true, $ne: null },
            "meetingPoint.lng": { $exists: true, $ne: null },
        })
            .sort({ dateTime: 1 })
            .select(
                "title slug dateTime durationMinutes activityType activityTypeOther coverPhotoUrl meetingPoint groupSize"
            )
            .lean();

        const enriched = await Promise.all(
            events.map(async (event) => {
                const confirmedCount = await Rsvp.countDocuments({
                    eventId: event._id,
                    status: "confirmed",
                });

                return {
                    id: event._id.toString(),
                    title: event.title,
                    slug: event.slug,
                    dateTime: event.dateTime,
                    durationMinutes: event.durationMinutes,
                    activityType:
                        event.activityType === "other"
                            ? event.activityTypeOther || "Other"
                            : event.activityType || "",
                    coverPhotoUrl: event.coverPhotoUrl || "",
                    meetingPoint: {
                        lat: event.meetingPoint.lat,
                        lng: event.meetingPoint.lng,
                        description: event.meetingPoint.description || "",
                    },
                    groupSize: event.groupSize || 10,
                    spotsLeft: Math.max(
                        (event.groupSize || 10) - confirmedCount,
                        0
                    ),
                };
            })
        );

        return Response.json({ events: enriched });
    } catch (error) {
        console.error("GET /api/events/explore error:", error);
        return Response.json(
            { error: "Failed to load events" },
            { status: 500 }
        );
    }
}
