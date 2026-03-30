import connectMongo from "@/libs/mongoose";
import Rsvp from "@/models/Rsvp";
import { getAuthUser } from "@/libs/auth";
import { notify, spotOpened, eventUrl as buildEventUrl } from "@/libs/notifications";
import BookingEvent from "@/models/BookingEvent";

// DELETE -- Cancel an RSVP (requires authentication, must be RSVP owner)
export async function DELETE(req, { params }) {
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

        if (rsvp.status === "cancelled") {
            return Response.json({ message: "Already cancelled" });
        }

        rsvp.status = "cancelled";
        await rsvp.save();

        // Auto-promote next waitlisted person
        const nextWaitlisted = await Rsvp.findOne({
            eventId: rsvp.eventId,
            status: "waitlisted",
        }).sort({ waitlistPosition: 1 });

        if (nextWaitlisted) {
            nextWaitlisted.status = "confirmed";
            nextWaitlisted.waitlistPromotedAt = new Date();
            nextWaitlisted.waitlistExpiresAt = new Date(
                Date.now() + 2 * 60 * 60 * 1000 // 2 hours
            );
            await nextWaitlisted.save();

            // Notify promoted participant
            if (nextWaitlisted.participantEmail) {
                try {
                    const event = await BookingEvent.findById(rsvp.eventId);
                    const msg = spotOpened({
                        email: nextWaitlisted.participantEmail,
                        eventTitle: event?.title || "Event",
                        confirmUrl: event?.slug ? buildEventUrl(event.slug) : "",
                    });
                    await notify(msg);
                } catch (notifyErr) {
                    console.error("Waitlist promotion notification error:", notifyErr);
                }
            }
        }

        return Response.json({ message: "RSVP cancelled" });
    } catch (error) {
        console.error("DELETE /api/rsvp/[id] error:", error);
        return Response.json({ error: "Failed to cancel" }, { status: 500 });
    }
}
