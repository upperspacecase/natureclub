import connectMongo from "@/libs/mongoose";
import BookingEvent from "@/models/BookingEvent";
import Rsvp from "@/models/Rsvp";
import { notify, duplicateNotify, eventUrl } from "@/libs/notifications";
import { getAuthUser } from "@/libs/auth";

// POST — Duplicate an event ("Run this again")
export async function POST(req, { params }) {
    try {
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

        // Notify previous attendees if requested
        if (body.notifyPrevious && body.newDateTime) {
            const prevRsvps = await Rsvp.find({
                eventId: sourceEvent._id,
                status: "confirmed",
            }).lean();

            const url = newEvent.slug ? eventUrl(newEvent.slug) : "";

            for (const rsvp of prevRsvps) {
                try {
                    const msg = duplicateNotify({
                        phone: rsvp.participantPhone,
                        hostName: user.name || "Your host",
                        eventTitle: sourceEvent.title,
                        newDate: body.newDateTime,
                        eventUrl: url,
                    });
                    await notify(msg);
                } catch (err) {
                    console.error(`Failed to notify ${rsvp.participantPhone}:`, err);
                }
            }
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
