import connectMongo from "@/libs/mongoose";
import BookingEvent from "@/models/BookingEvent";
// User model registered via BookingEvent population if needed
import Rsvp from "@/models/Rsvp";
import { getAuthUser } from "@/libs/auth";
import { searchPhoto } from "@/libs/unsplash";

// GET — List all events for the authenticated user
export async function GET(_req) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectMongo();

        const events = await BookingEvent.find({ createdBy: user._id })
            .sort({ createdAt: -1 })
            .lean();

        // Attach RSVP counts + auto-fetch missing images
        const eventsWithCounts = await Promise.all(
            events.map(async (event) => {
                const rsvpCount = await Rsvp.countDocuments({
                    eventId: event._id,
                    status: "confirmed",
                });

                // Auto-fetch Unsplash image if no cover photo
                let coverPhotoUrl = event.coverPhotoUrl || "";
                if (!coverPhotoUrl && process.env.UNSPLASH_ACCESS_KEY) {
                    try {
                        const parts = [event.title];
                        if (event.activityType && event.activityType !== "other") {
                            parts.push(event.activityType.replace(/-/g, " "));
                        }
                        const photo = await searchPhoto(parts.join(" ") || "nature outdoor");
                        if (photo?.url) {
                            coverPhotoUrl = photo.url;
                            await BookingEvent.updateOne(
                                { _id: event._id },
                                { $set: { coverPhotoUrl } }
                            );
                        }
                    } catch (err) {
                        console.error("Unsplash fallback failed:", err.message);
                    }
                }

                return {
                    ...event,
                    coverPhotoUrl,
                    id: event._id.toString(),
                    rsvpCount,
                };
            })
        );

        return Response.json({ events: eventsWithCounts });
    } catch (error) {
        console.error("GET /api/events/list error:", error);
        return Response.json({ error: "Failed to list events" }, { status: 500 });
    }
}

