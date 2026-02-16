import connectMongo from "@/libs/mongoose";
import Rsvp from "@/models/Rsvp";
import BookingEvent from "@/models/BookingEvent";

// POST — Confirm a waitlist promotion
export async function POST(req, { params }) {
    try {
        const { id } = await params;
        const { phone } = await req.json();

        if (!phone) {
            return Response.json(
                { error: "Phone verification required" },
                { status: 400 }
            );
        }

        const cleanPhone = phone.replace(/[\s\-()]/g, "");

        await connectMongo();

        const rsvp = await Rsvp.findById(id);
        if (!rsvp || rsvp.participantPhone !== cleanPhone) {
            return Response.json({ error: "RSVP not found" }, { status: 404 });
        }

        // Check if promotion has expired
        if (rsvp.waitlistExpiresAt && new Date() > rsvp.waitlistExpiresAt) {
            rsvp.status = "cancelled";
            await rsvp.save();

            // Promote next person
            const next = await Rsvp.findOne({
                eventId: rsvp.eventId,
                status: "waitlisted",
            }).sort({ waitlistPosition: 1 });

            if (next) {
                next.status = "confirmed";
                next.waitlistPromotedAt = new Date();
                next.waitlistExpiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
                await next.save();
            }

            return Response.json(
                { error: "This spot has expired and been offered to the next person" },
                { status: 410 }
            );
        }

        // Confirm the promotion
        rsvp.waitlistExpiresAt = null;
        rsvp.status = "confirmed";
        await rsvp.save();

        // Return meeting point
        const event = await BookingEvent.findById(rsvp.eventId).select("meetingPoint");

        return Response.json({
            message: "You're in!",
            rsvp: rsvp.toJSON(),
            meetingPoint: event?.meetingPoint || null,
        });
    } catch (error) {
        console.error("POST /api/rsvp/[id]/confirm error:", error);
        return Response.json({ error: "Failed to confirm" }, { status: 500 });
    }
}
