import connectMongo from "@/libs/mongoose";
import BookingEvent from "@/models/BookingEvent";
import User from "@/models/User";
import Rsvp from "@/models/Rsvp";

// GET — Public event data by slug (no auth required)
export async function GET(req, { params }) {
    try {
        const { slug } = await params;
        await connectMongo();

        const event = await BookingEvent.findOne({ slug, status: { $ne: "draft" } });

        if (!event) {
            return Response.json({ error: "Event not found" }, { status: 404 });
        }

        const host = await User.findById(event.createdBy);

        // Count confirmed RSVPs
        const rsvpCount = await Rsvp.countDocuments({
            eventId: event._id,
            status: "confirmed",
        });

        // Count maybe RSVPs
        const maybeCount = await Rsvp.countDocuments({
            eventId: event._id,
            status: "maybe",
        });

        // Get attendee first names for "who's going"
        const attendees = await Rsvp.find({
            eventId: event._id,
            status: { $in: ["confirmed", "maybe"] },
        })
            .select("participantName")
            .lean();

        const attendeeNames = attendees.map((r) => r.participantName);

        // Build public response — strip exact GPS coordinates
        const publicEvent = {
            id: event._id.toString(),
            title: event.title,
            slug: event.slug,
            status: event.status,
            dateTime: event.dateTime,
            durationMinutes: event.durationMinutes,
            activityType: event.activityType,
            activityTypeOther: event.activityTypeOther,
            groupSize: event.groupSize,
            description: event.description,
            difficulty: event.difficulty,
            whatToBring: event.whatToBring,
            weatherPolicy: event.weatherPolicy,
            price: event.price,
            currency: event.currency || "USD",
            priceLink: event.priceLink,
            coverPhotoUrl: event.coverPhotoUrl,
            accessibilityNotes: event.accessibilityNotes,
            cancelledReason: event.cancelledReason,
            // Approximate location only — no exact pin before RSVP
            hasLocation: !!(event.meetingPoint?.lat && event.meetingPoint?.lng),
            approximateLocation: event.meetingPoint?.lat
                ? {
                    // Round to ~1km precision for pre-RSVP
                    lat: Math.round(event.meetingPoint.lat * 100) / 100,
                    lng: Math.round(event.meetingPoint.lng * 100) / 100,
                }
                : null,
            host: host
                ? {
                    name: host.name,
                    photoUrl: host.photoUrl,
                    bio: host.bio,
                    username: host.username,
                }
                : null,
            rsvpCount,
            maybeCount,
            attendeeNames,
        };

        return Response.json(publicEvent);
    } catch (error) {
        console.error("GET /api/events/[slug]/public error:", error);
        return Response.json({ error: "Failed to fetch event" }, { status: 500 });
    }
}
