import connectMongo from "@/libs/mongoose";
import BookingEvent from "@/models/BookingEvent";
import Rsvp from "@/models/Rsvp";
import { getAuthUser } from "@/libs/auth";
import {
    notify,
    rainCheckOn,
    rainCheckReschedule,
    rainCheckCancel,
    eventUrl,
} from "@/libs/notifications";

// POST — Rain check: on, reschedule, or cancel
export async function POST(req, { params }) {
    try {
        const user = await getAuthUser();
        if (!user) {
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

        const event = await BookingEvent.findOne({
            _id: id,
            createdBy: user._id,
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

        const url = event.slug ? eventUrl(event.slug) : "";

        switch (action) {
            case "on":
                // Notify all attendees: "We're ON"
                for (const a of attendees) {
                    try {
                        const msg = rainCheckOn({
                            email: a.participantEmail,
                            eventTitle: event.title,
                            eventDate: event.dateTime,
                            note,
                        });
                        await notify(msg);
                    } catch (err) {
                        console.error(`Failed to notify ${a.participantEmail}:`, err);
                    }
                }
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

                // Notify all attendees about reschedule
                for (const a of attendees) {
                    try {
                        const msg = rainCheckReschedule({
                            email: a.participantEmail,
                            eventTitle: event.title,
                            newDate: event.dateTime,
                            eventUrl: url,
                        });
                        await notify(msg);
                    } catch (err) {
                        console.error(`Failed to notify ${a.participantEmail}:`, err);
                    }
                }
                return Response.json({
                    message: `Rescheduled to ${event.dateTime.toISOString()}. ${attendees.length} attendees notified.`,
                    dateTime: event.dateTime.toISOString(),
                    attendeeCount: attendees.length,
                });

            case "cancel":
                event.status = "cancelled";
                event.cancelledReason = reason || "";
                await event.save();

                // Notify all attendees about cancellation
                for (const a of attendees) {
                    try {
                        const msg = rainCheckCancel({
                            email: a.participantEmail,
                            eventTitle: event.title,
                            eventDate: event.dateTime,
                            reason,
                        });
                        await notify(msg);
                    } catch (err) {
                        console.error(`Failed to notify ${a.participantEmail}:`, err);
                    }
                }
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
