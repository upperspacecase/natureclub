import { getAuthUser } from "@/libs/auth";
import connectMongo from "@/libs/mongoose";
import BookingEvent from "@/models/BookingEvent";
import Event from "@/models/Event";
import { getUserJourneyData, serializeEvents } from "@/libs/user-stats";
import DiscoveryClient from "./DiscoveryClient";

export const dynamic = "force-dynamic";

export default async function DiscoveryPage() {
  await connectMongo();

  // User stats (if signed in)
  const user = await getAuthUser();
  let stats = null;
  if (user) {
    const journey = await getUserJourneyData(user._id);
    stats = journey.stats;
  }

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
  let cardNum = 1;

  // Events first, then spots to fill
  while (ei < serializedEvents.length || si < serializedSpots.length) {
    if (ei < serializedEvents.length) {
      const e = serializedEvents[ei];
      feedCards.push({
        id: e._id,
        number: String(cardNum).padStart(2, "0"),
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
      cardNum++;
      ei++;
    }
    if (si < serializedSpots.length) {
      const s = serializedSpots[si];
      feedCards.push({
        id: s._id,
        number: String(cardNum).padStart(2, "0"),
        category: s.category || "SPOT",
        title: s.title,
        subtitle: s.region,
        image: s.image || "",
        href: null,
      });
      cardNum++;
      si++;
    }
  }

  return <DiscoveryClient stats={stats} feedCards={feedCards} />;
}
