import connectMongo from "@/libs/mongoose";
import BookingEvent from "@/models/BookingEvent";
import Rsvp from "@/models/Rsvp";
import User from "@/models/User";
import { getAuthUser } from "@/libs/auth";
import {
    notify,
    rsvpConfirmedParticipant,
    rsvpConfirmedHost,
    waitlistJoined,
    eventUrl as buildEventUrl,
} from "@/libs/notifications";

// POST -- Create RSVP or join waitlist (requires authentication)
export async function POST(req) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return Response.json({ error: "Sign in to RSVP" }, { status: 401 });
        }

        const { eventId, status: requestedStatus } = await req.json();

        if (!eventId) {
            return Response.json({ error: "Event ID is required" }, { status: 400 });
        }

        await connectMongo();

        const event = await BookingEvent.findById(eventId);
        if (!event || event.status !== "published") {
            return Response.json(
                { error: "Event not found or not accepting RSVPs" },
                { status: 404 }
            );
        }

        // Handle "Can't Go" -- cancel any existing RSVP
        if (requestedStatus === "cancelled") {
            await Rsvp.updateMany(
                { eventId: event._id, participantUserId: user._id, status: { $ne: "cancelled" } },
                { $set: { status: "cancelled" } }
            );
            return Response.json({ message: "RSVP cancelled" }, { status: 200 });
        }

        // Check for existing RSVP (deduplication by userId)
        const existingRsvp = await Rsvp.findOne({
            eventId: event._id,
            participantUserId: user._id,
            status: { $ne: "cancelled" },
        });

        if (existingRsvp) {
            if (requestedStatus && requestedStatus !== existingRsvp.status) {
                existingRsvp.status = requestedStatus;
                existingRsvp.participantName = user.name || existingRsvp.participantName;
                await existingRsvp.save();
                return Response.json({
                    rsvp: existingRsvp.toJSON(),
                    meetingPoint: requestedStatus === "confirmed" ? event.meetingPoint : null,
                }, { status: 200 });
            }
            return Response.json(
                {
                    error: "You're already signed up!",
                    status: existingRsvp.status,
                    rsvp: existingRsvp.toJSON(),
                    meetingPoint: existingRsvp.status === "confirmed" ? event.meetingPoint : null,
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

        // Determine RSVP status
        const wantedStatus = requestedStatus || "confirmed";

        if (wantedStatus === "maybe") {
            const rsvp = await Rsvp.create({
                eventId: event._id,
                participantUserId: user._id,
                participantEmail: user.email || "",
                participantName: user.name || "Guest",
                status: "maybe",
            });
            return Response.json({ rsvp: rsvp.toJSON() }, { status: 201 });
        }

        // Check group cap -> waitlist
        const confirmedCount = await Rsvp.countDocuments({
            eventId: event._id,
            status: "confirmed",
        });

        const isFull = event.groupSize && confirmedCount >= event.groupSize;

        let rsvp;

        if (isFull) {
            const waitlistCount = await Rsvp.countDocuments({
                eventId: event._id,
                status: "waitlisted",
            });

            rsvp = await Rsvp.create({
                eventId: event._id,
                participantUserId: user._id,
                participantEmail: user.email || "",
                participantName: user.name || "Guest",
                status: "waitlisted",
                waitlistPosition: waitlistCount + 1,
            });
        } else {
            rsvp = await Rsvp.create({
                eventId: event._id,
                participantUserId: user._id,
                participantEmail: user.email || "",
                participantName: user.name || "Guest",
                status: "confirmed",
            });
        }

        // Send notifications (non-blocking)
        try {
            const url = event.slug ? buildEventUrl(event.slug) : "";

            if (rsvp.status === "confirmed" && user.email) {
                const participantMsg = rsvpConfirmedParticipant({
                    email: user.email,
                    eventTitle: event.title,
                    eventDate: event.dateTime,
                    eventUrl: url,
                });
                await notify(participantMsg);

                const host = await User.findById(event.createdBy);
                if (host?.email) {
                    const confirmedNow = confirmedCount + 1;
                    const hostMsg = rsvpConfirmedHost({
                        hostEmail: host.email,
                        participantName: user.name || "Someone",
                        eventTitle: event.title,
                        rsvpCount: confirmedNow,
                        groupSize: event.groupSize,
                    });
                    await notify(hostMsg);
                }
            } else if (rsvp.status === "waitlisted" && user.email) {
                const waitlistMsg = waitlistJoined({
                    email: user.email,
                    eventTitle: event.title,
                    position: rsvp.waitlistPosition,
                });
                await notify(waitlistMsg);
            }
        } catch (notifyErr) {
            console.error("RSVP notification error (non-fatal):", notifyErr);
        }

        const response = {
            rsvp: rsvp.toJSON(),
            meetingPoint: rsvp.status === "confirmed" ? event.meetingPoint : null,
        };

        return Response.json(response, { status: 201 });
    } catch (error) {
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

// GET -- Check RSVP status by userId for a given event
export async function GET(req) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return Response.json({ found: false });
        }

        const { searchParams } = new URL(req.url);
        const eventId = searchParams.get("eventId");

        if (!eventId) {
            return Response.json({ error: "eventId is required" }, { status: 400 });
        }

        await connectMongo();

        const rsvp = await Rsvp.findOne({
            eventId,
            participantUserId: user._id,
            status: { $ne: "cancelled" },
        });

        if (!rsvp) {
            return Response.json({ found: false });
        }

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
