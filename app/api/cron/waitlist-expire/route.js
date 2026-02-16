import connectMongo from "@/libs/mongoose";
import Rsvp from "@/models/Rsvp";

// POST — Cron job: auto-expire unconfirmed waitlist promotions
// Should be called by Vercel Cron every 15 minutes
export async function POST(req) {
    try {
        // Verify cron secret
        const authHeader = req.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectMongo();

        // Find expired promotions (status = confirmed, waitlistExpiresAt < now)
        const expired = await Rsvp.find({
            status: "confirmed",
            waitlistExpiresAt: { $lt: new Date() },
            waitlistPromotedAt: { $exists: true, $ne: null },
        });

        let promoted = 0;

        for (const rsvp of expired) {
            rsvp.status = "cancelled";
            await rsvp.save();

            // Promote next waitlisted person
            const next = await Rsvp.findOne({
                eventId: rsvp.eventId,
                status: "waitlisted",
            }).sort({ waitlistPosition: 1 });

            if (next) {
                next.status = "confirmed";
                next.waitlistPromotedAt = new Date();
                next.waitlistExpiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
                await next.save();
                promoted++;
                // TODO: Wire notify() for waitlist-spot-opened template
            }
        }

        return Response.json({
            expired: expired.length,
            promoted,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("CRON waitlist-expire error:", error);
        return Response.json({ error: "Cron failed" }, { status: 500 });
    }
}
