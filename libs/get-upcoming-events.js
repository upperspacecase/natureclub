import connectMongo from "@/libs/mongoose";
import BookingEvent from "@/models/BookingEvent";
import Rsvp from "@/models/Rsvp";
import { searchPhoto } from "@/libs/unsplash";

function buildImageQuery(event) {
  const parts = [];
  if (event.title) parts.push(event.title);
  if (event.activityType && event.activityType !== "other") {
    parts.push(event.activityType.replace(/-/g, " "));
  }
  if (!parts.length) parts.push("nature outdoor");
  return parts.join(" ");
}

export default async function getUpcomingEvents() {
  await connectMongo();

  const now = new Date();

  const events = await BookingEvent.find({
    status: "published",
    isPublic: { $ne: false },
    dateTime: { $gte: now },
    "meetingPoint.lat": { $exists: true, $ne: null },
    "meetingPoint.lng": { $exists: true, $ne: null },
  })
    .sort({ dateTime: 1 })
    .select(
      "title slug dateTime durationMinutes activityType activityTypeOther coverPhotoUrl meetingPoint groupSize"
    )
    .lean();

  const enriched = await Promise.all(
    events.map(async (event) => {
      const confirmedCount = await Rsvp.countDocuments({
        eventId: event._id,
        status: "confirmed",
      });

      let coverUrl = event.coverPhotoUrl || "";
      if (!coverUrl && process.env.UNSPLASH_ACCESS_KEY) {
        try {
          const query = buildImageQuery(event);
          const photo = await searchPhoto(query);
          if (photo?.url) {
            coverUrl = photo.url;
            await BookingEvent.updateOne(
              { _id: event._id },
              { $set: { coverPhotoUrl: coverUrl } }
            );
          }
        } catch (err) {
          console.error(
            "Unsplash fallback failed for",
            event.title,
            err.message
          );
        }
      }

      return {
        _id: event._id.toString(),
        title: event.title,
        slug: event.slug,
        dateTime: event.dateTime,
        durationMinutes: event.durationMinutes,
        activityType:
          event.activityType === "other"
            ? event.activityTypeOther || "Other"
            : event.activityType || "",
        coverPhotoUrl: coverUrl,
        meetingPoint: {
          lat: event.meetingPoint.lat,
          lng: event.meetingPoint.lng,
          description: event.meetingPoint.description || "",
        },
        groupSize: event.groupSize || 10,
        spotsLeft: Math.max((event.groupSize || 10) - confirmedCount, 0),
      };
    })
  );

  return enriched;
}
