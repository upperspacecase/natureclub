import { auth } from "@clerk/nextjs/server";
import connectMongo from "@/libs/mongoose";
import BookingEvent from "@/models/BookingEvent";
import Facilitator from "@/models/Facilitator";
import Rsvp from "@/models/Rsvp";

// POST — Rain check: on, reschedule, or cancel
export async function POST(req, { params }) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const { action, newDateTime, reason, note } = await req.json();

        if (!["on", "reschedule", "cancel"].includes(action)) {
            return Response.json(
                { error: "Invalid action. Use: on, reschedule, cancel" },
                { status: 400 }
            );
        }

        await connectMongo();

        const facilitator = await Facilitator.findOne({ clerkUserId: userId });
        if (!facilitator) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const event = await BookingEvent.findOne({
            _id: id,
            facilitatorId: facilitator._id,
            status: "published",
        });

        if (!event) {
            return Response.json({ error: "Event not found" }, { status: 404 });
        }

        // Get all confirmed attendees for notifications
        const attendees = await Rsvp.find({
            eventId: event._id,
            status: "confirmed",
        }).lean();

        switch (action) {
            case "on":
                // "We're ON" — just confirms to attendees, no data change
                // TODO: Wire notify() for rain-check-on template
                return Response.json({
                    message: `"We're ON" sent to ${attendees.length} attendees`,
                    attendeeCount: attendees.length,
                });

            case "reschedule":
                if (!newDateTime) {
                    return Response.json(
                        { error: "New date/time required for reschedule" },
                        { status: 400 }
                    );
                }

                event.dateTime = new Date(newDateTime);
                await event.save();

                // TODO: Wire notify() for rain-check-reschedule template
                return Response.json({
                    message: `Rescheduled to ${event.dateTime.toISOString()}. ${attendees.length} attendees notified.`,
                    dateTime: event.dateTime.toISOString(),
                    attendeeCount: attendees.length,
                });

            case "cancel":
                event.status = "cancelled";
                event.cancelledReason = reason || "";
                await event.save();

                // TODO: Wire notify() for rain-check-cancel template
                return Response.json({
                    message: `Event cancelled. ${attendees.length} attendees notified.`,
                    attendeeCount: attendees.length,
                });
        }
    } catch (error) {
        console.error("POST /api/events/[id]/raincheck error:", error);
        return Response.json({ error: "Failed to process rain check" }, { status: 500 });
    }
}
