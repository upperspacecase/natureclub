import connectMongo from "@/libs/mongoose";
import BookingEvent from "@/models/BookingEvent";
import Rsvp from "@/models/Rsvp";

// Covers are assigned at write time (publish/import/backfill script) — the
// read path must never call external APIs or write to the DB.
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

  const counts = await Rsvp.aggregate([
    {
      $match: {
        eventId: { $in: events.map((e) => e._id) },
        status: "confirmed",
      },
    },
    { $group: { _id: "$eventId", n: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.n]));

  return events.map((event) => {
    const confirmedCount = countMap.get(String(event._id)) || 0;
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
      coverPhotoUrl: event.coverPhotoUrl || "",
      meetingPoint: {
        lat: event.meetingPoint.lat,
        lng: event.meetingPoint.lng,
        description: event.meetingPoint.description || "",
      },
      groupSize: event.groupSize || 10,
      spotsLeft: Math.max((event.groupSize || 10) - confirmedCount, 0),
    };
  });
}
