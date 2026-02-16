import { auth } from "@clerk/nextjs/server";
import connectMongo from "@/libs/mongoose";
import BookingEvent from "@/models/BookingEvent";
import Facilitator from "@/models/Facilitator";
import Rsvp from "@/models/Rsvp";
import { notify } from "@/libs/notifications";

// POST — Duplicate an event ("Run this again")
export async function POST(req, { params }) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json().catch(() => ({}));

        await connectMongo();

        const facilitator = await Facilitator.findOne({ clerkUserId: userId });
        if (!facilitator) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const sourceEvent = await BookingEvent.findOne({
            _id: id,
            facilitatorId: facilitator._id,
        });

        if (!sourceEvent) {
            return Response.json({ error: "Event not found" }, { status: 404 });
        }

        // Create copy — strip date, slug, status; link back to source
        const newEvent = await BookingEvent.create({
            facilitatorId: facilitator._id,
            title: sourceEvent.title,
            status: "draft",
            dateTime: null, // Clear — facilitator picks new date
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
        // For now, if explicitly requested, notify previous attendees immediately.
        if (body.notifyPrevious && body.newDateTime) {
            const prevRsvps = await Rsvp.find({
                eventId: sourceEvent._id,
                status: "confirmed",
            }).lean();

            // This would send emails — only if we have email addresses
            // For phone-only participants, this is a placeholder for SMS
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
