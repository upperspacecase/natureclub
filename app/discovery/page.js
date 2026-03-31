import connectMongo from "@/libs/mongoose";
import BookingEvent from "@/models/BookingEvent";
import Event from "@/models/Event";
import { serializeEvents } from "@/libs/user-stats";
import DiscoveryClient from "./DiscoveryClient";

export const dynamic = "force-dynamic";

export default async function DiscoveryPage() {
  await connectMongo();

  // Upcoming published events for the discovery feed
  const now = new Date();
  const upcomingEvents = await BookingEvent.find({
    status: "published",
    isPublic: { $ne: false },
    dateTime: { $gte: now },
  })
    .sort({ dateTime: 1 })
    .limit(20)
    .select("title slug coverPhotoUrl dateTime activityType meetingPoint")
    .lean();

  // Spots from the Event collection
  const spots = await Event.find({ type: "spot" })
    .limit(20)
    .select("eventId title image categoryTag description region location")
    .lean();

  const serializedEvents = serializeEvents(upcomingEvents);

  const serializedSpots = spots.map((s) => ({
    _id: String(s._id),
    eventId: s.eventId,
    title: s.title,
    image: s.image,
    category: (s.categoryTag || "").toUpperCase(),
    description: s.description || "",
    region: s.region || "",
    lat: s.location?.lat ?? null,
    lng: s.location?.lng ?? null,
  }));

  // Interleave events and spots for the feed
  const feedCards = [];
  let ei = 0;
  let si = 0;

  while (ei < serializedEvents.length || si < serializedSpots.length) {
    if (ei < serializedEvents.length) {
      const e = serializedEvents[ei];
      feedCards.push({
        id: e._id,
        category: (e.activityType || "EVENT").toUpperCase().replace(/-/g, " "),
        title: e.title || "Untitled",
        subtitle: e.dateTime
          ? new Date(e.dateTime).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })
          : "",
        image: e.coverPhotoUrl || "",
        href: e.slug ? `/e/${e.slug}` : null,
      });
      ei++;
    }
    if (si < serializedSpots.length) {
      const s = serializedSpots[si];
      feedCards.push({
        id: s._id,
        category: s.category || "SPOT",
        title: s.title,
        subtitle: s.region,
        image: s.image || "",
        href: null,
      });
      si++;
    }
  }

  return <DiscoveryClient feedCards={feedCards} />;
}
