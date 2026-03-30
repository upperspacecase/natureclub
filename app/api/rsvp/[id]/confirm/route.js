import connectMongo from "@/libs/mongoose";
import Rsvp from "@/models/Rsvp";
import BookingEvent from "@/models/BookingEvent";
import { getAuthUser } from "@/libs/auth";

// POST -- Confirm a waitlist promotion (requires authentication)
export async function POST(req, { params }) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        await connectMongo();

        const rsvp = await Rsvp.findById(id);
        if (!rsvp || !rsvp.participantUserId.equals(user._id)) {
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
