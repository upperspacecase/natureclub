import connectMongo from "@/libs/mongoose";
import BookingEvent from "@/models/BookingEvent";
import Rsvp from "@/models/Rsvp";

// POST — Create RSVP or join waitlist
export async function POST(req) {
    try {
        const { eventId, participantName, participantPhone } = await req.json();

        if (!eventId || !participantName || !participantPhone) {
            return Response.json(
                { error: "Event ID, name, and phone are required" },
                { status: 400 }
            );
        }

        // Basic phone validation (E.164-ish)
        const cleanPhone = participantPhone.replace(/[\s\-()]/g, "");
        if (!/^\+?\d{7,15}$/.test(cleanPhone)) {
            return Response.json(
                { error: "Please enter a valid phone number" },
                { status: 400 }
            );
        }

        const trimmedName = participantName.trim().slice(0, 50);
        if (trimmedName.length === 0) {
            return Response.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        await connectMongo();

        const event = await BookingEvent.findById(eventId);
        if (!event || event.status !== "published") {
            return Response.json(
                { error: "Event not found or not accepting RSVPs" },
                { status: 404 }
            );
        }

        // Check for existing RSVP (deduplication)
        const existingRsvp = await Rsvp.findOne({
            eventId: event._id,
            participantPhone: cleanPhone,
            status: { $ne: "cancelled" },
        });

        if (existingRsvp) {
            return Response.json(
                {
                    error: "You're already signed up!",
                    status: existingRsvp.status,
                    rsvp: existingRsvp.toJSON(),
                },
                { status: 409 }
            );
        }

        // Check if event is past
        if (event.dateTime && new Date(event.dateTime) < new Date()) {
            return Response.json(
                { error: "This event has already passed" },
                { status: 400 }
            );
        }

        // Check group cap → waitlist
        const confirmedCount = await Rsvp.countDocuments({
            eventId: event._id,
            status: "confirmed",
        });

        const isFull = event.groupSize && confirmedCount >= event.groupSize;

        let rsvp;

        if (isFull) {
            // Add to waitlist
            const waitlistCount = await Rsvp.countDocuments({
                eventId: event._id,
                status: "waitlisted",
            });

            rsvp = await Rsvp.create({
                eventId: event._id,
                participantName: trimmedName,
                participantPhone: cleanPhone,
                status: "waitlisted",
                waitlistPosition: waitlistCount + 1,
            });
        } else {
            // Confirm RSVP
            rsvp = await Rsvp.create({
                eventId: event._id,
                participantName: trimmedName,
                participantPhone: cleanPhone,
                status: "confirmed",
            });
        }

        // Return the exact meeting point now that they're RSVP'd
        const response = {
            rsvp: rsvp.toJSON(),
            // Reveal exact location post-RSVP
            meetingPoint: rsvp.status === "confirmed" ? event.meetingPoint : null,
        };

        return Response.json(response, { status: 201 });
    } catch (error) {
        // Handle duplicate key error (race condition on compound index)
        if (error.code === 11000) {
            return Response.json(
                { error: "You're already signed up!" },
                { status: 409 }
            );
        }
        console.error("POST /api/rsvp error:", error);
        return Response.json({ error: "Failed to RSVP" }, { status: 500 });
    }
}

// GET — Check RSVP status by phone number for a given event
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const eventId = searchParams.get("eventId");
        const phone = searchParams.get("phone");

        if (!eventId || !phone) {
            return Response.json(
                { error: "eventId and phone are required" },
                { status: 400 }
            );
        }

        const cleanPhone = phone.replace(/[\s\-()]/g, "");

        await connectMongo();

        const rsvp = await Rsvp.findOne({
            eventId,
            participantPhone: cleanPhone,
            status: { $ne: "cancelled" },
        });

        if (!rsvp) {
            return Response.json({ found: false });
        }

        // If confirmed, also return exact meeting point
        let meetingPoint = null;
        if (rsvp.status === "confirmed") {
            const event = await BookingEvent.findById(eventId).select("meetingPoint");
            meetingPoint = event?.meetingPoint || null;
        }

        return Response.json({
            found: true,
            rsvp: rsvp.toJSON(),
            meetingPoint,
        });
    } catch (error) {
        console.error("GET /api/rsvp error:", error);
        return Response.json({ error: "Failed to check RSVP" }, { status: 500 });
    }
}
