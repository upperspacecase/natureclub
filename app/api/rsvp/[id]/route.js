import connectMongo from "@/libs/mongoose";
import Rsvp from "@/models/Rsvp";

// DELETE — Cancel an RSVP (verified by phone token in query)
export async function DELETE(req, { params }) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const phone = searchParams.get("phone");

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
            // TODO: Wire notify() for waitlist-spot-opened template
        }

        return Response.json({ message: "RSVP cancelled" });
    } catch (error) {
        console.error("DELETE /api/rsvp/[id] error:", error);
        return Response.json({ error: "Failed to cancel" }, { status: 500 });
    }
}
