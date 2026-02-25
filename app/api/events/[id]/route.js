import connectMongo from "@/libs/mongoose";
import BookingEvent from "@/models/BookingEvent";
import { slugify } from "@/libs/slugify";
import { getAuthUser } from "@/libs/auth";

// GET — Fetch a single event (owner only)
export async function GET(req, { params }) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await connectMongo();

        const event = await BookingEvent.findOne({
            _id: id,
            createdBy: user._id,
        });

        if (!event) {
            return Response.json({ error: "Event not found" }, { status: 404 });
        }

        return Response.json(event.toJSON());
    } catch (error) {
        console.error("GET /api/events/[id] error:", error);
        return Response.json({ error: "Failed to fetch event" }, { status: 500 });
    }
}

// PATCH — Update event fields (auto-save)
export async function PATCH(req, { params }) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        await connectMongo();

        const event = await BookingEvent.findOne({
            _id: id,
            createdBy: user._id,
        });

        if (!event) {
            return Response.json({ error: "Event not found" }, { status: 404 });
        }

        // Whitelist of updatable fields
        const allowedFields = [
            "title",
            "dateTime",
            "durationMinutes",
            "meetingPoint",
            "activityType",
            "activityTypeOther",
            "groupSize",
            "description",
            "difficulty",
            "whatToBring",
            "weatherPolicy",
            "price",
            "priceLink",
            "coverPhotoUrl",
            "accessibilityNotes",
            "isPublic",
        ];

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                event[field] = body[field];
            }
        }

        // Handle publish: generate slug if transitioning to published
        if (body.status === "published" && event.status !== "published") {
            if (!event.title || event.title.trim().length === 0) {
                return Response.json(
                    { error: "Title is required to publish" },
                    { status: 400 }
                );
            }
            event.status = "published";
            if (!event.slug) {
                event.slug = slugify(event.title);
            }
        }

        // Handle cancel
        if (body.status === "cancelled") {
            event.status = "cancelled";
            if (body.cancelledReason) {
                event.cancelledReason = body.cancelledReason;
            }
        }

        await event.save();

        return Response.json(event.toJSON());
    } catch (error) {
        console.error("PATCH /api/events/[id] error:", error);
        return Response.json({ error: "Failed to update event" }, { status: 500 });
    }
}

// DELETE — Permanently delete an event and its RSVPs
export async function DELETE(req, { params }) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await connectMongo();

        const event = await BookingEvent.findOne({
            _id: id,
            createdBy: user._id,
        });

        if (!event) {
            return Response.json({ error: "Event not found" }, { status: 404 });
        }

        // Delete all RSVPs for this event
        const { default: Rsvp } = await import("@/models/Rsvp");
        await Rsvp.deleteMany({ eventId: event._id });

        // Delete the event
        await BookingEvent.deleteOne({ _id: event._id });

        return Response.json({ message: "Event deleted" });
    } catch (error) {
        console.error("DELETE /api/events/[id] error:", error);
        return Response.json({ error: "Failed to delete event" }, { status: 500 });
    }
}
