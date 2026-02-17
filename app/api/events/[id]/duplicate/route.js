import connectMongo from "@/libs/mongoose";
import BookingEvent from "@/models/BookingEvent";
import Rsvp from "@/models/Rsvp";
import { notify } from "@/libs/notifications";
import { getAuthUser } from "@/libs/auth";

// POST — Duplicate an event ("Run this again")
export async function POST(req, { params }) {
    try {
        // TWILIO-AUTH: getAuthUser() currently returns a dev stub
        const user = await getAuthUser();
        if (!user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json().catch(() => ({}));

        await connectMongo();

        const sourceEvent = await BookingEvent.findOne({
            _id: id,
            createdBy: user._id,
        });

        if (!sourceEvent) {
            return Response.json({ error: "Event not found" }, { status: 404 });
        }

        // Create copy — strip date, slug, status; link back to source
        const newEvent = await BookingEvent.create({
            createdBy: user._id,
            title: sourceEvent.title,
            status: "draft",
            dateTime: null,
            durationMinutes: sourceEvent.durationMinutes,
            meetingPoint: sourceEvent.meetingPoint,
            activityType: sourceEvent.activityType,
            activityTypeOther: sourceEvent.activityTypeOther,
            groupSize: sourceEvent.groupSize,
            description: sourceEvent.description,
            difficulty: sourceEvent.difficulty,
            whatToBring: [...sourceEvent.whatToBring],
            weatherPolicy: sourceEvent.weatherPolicy,
            price: sourceEvent.price,
            priceLink: sourceEvent.priceLink,
            coverPhotoUrl: sourceEvent.coverPhotoUrl,
            accessibilityNotes: sourceEvent.accessibilityNotes,
            sourceEventId: sourceEvent._id,
        });

        // If notifyPrevious flag is set and event gets published later,
        // we store the source so the publish flow can trigger notifications.
        if (body.notifyPrevious && body.newDateTime) {
            const prevRsvps = await Rsvp.find({
                eventId: sourceEvent._id,
                status: "confirmed",
            }).lean();
            // TWILIO-AUTH: Wire SMS/WhatsApp notifications here
        }

        return Response.json({
            id: newEvent._id.toString(),
            message: "Event duplicated as draft",
        });
    } catch (error) {
        console.error("POST /api/events/[id]/duplicate error:", error);
        return Response.json({ error: "Failed to duplicate" }, { status: 500 });
    }
}
