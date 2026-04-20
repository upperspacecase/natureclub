import { redirect } from "next/navigation";
import { getAuthUser } from "@/libs/auth";
import { getUserJourneyData } from "@/libs/user-stats";
import connectMongo from "@/libs/mongoose";
import BookingEvent from "@/models/BookingEvent";
import User from "@/models/User";
import {
  toDesignEvent,
  fetchAttendanceMap,
} from "@/libs/nc-design-event";
import { fetchSavedDesignEvents } from "@/libs/nc-saved-events";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getAuthUser();
  if (!user) redirect("/signin?returnUrl=/home");

  await connectMongo();

  const { stats, upcomingEvents, pastEvents, hostedEvents } =
    await getUserJourneyData(user._id);

  // Next upcoming event (RSVP'ed)
  let nextEvent = null;
  if (upcomingEvents[0]) {
    const raw = await BookingEvent.findById(upcomingEvents[0]._id).lean();
    if (raw) {
      const host = raw.createdBy ? await User.findById(raw.createdBy).lean() : null;
      const attMap = await fetchAttendanceMap([raw._id]);
      nextEvent = toDesignEvent(raw, {
        host,
        attendance: attMap.get(String(raw._id)),
      });
      nextEvent.dateTimeISO = raw.dateTime?.toISOString() || null;
    }
  }

  // "This week near you" — published events not the user's own next event
  const now = new Date();
  const nearbyRaw = await BookingEvent.find({
    status: "published",
    isPublic: { $ne: false },
    dateTime: { $gte: now },
    ...(nextEvent ? { _id: { $ne: nextEvent._id } } : {}),
  })
    .sort({ dateTime: 1 })
    .limit(8)
    .lean();

  const nearbyHostIds = [...new Set(nearbyRaw.map((e) => String(e.createdBy)))];
  const nearbyHosts = nearbyHostIds.length
    ? await User.find({ _id: { $in: nearbyHostIds } })
        .select("name username photoUrl")
        .lean()
    : [];
  const hostMap = new Map(nearbyHosts.map((h) => [String(h._id), h]));
  const nearbyIds = nearbyRaw.map((e) => e._id);
  const nearbyAtt = await fetchAttendanceMap(nearbyIds);

  const nearbyEvents = nearbyRaw.map((e) =>
    toDesignEvent(e, {
      host: hostMap.get(String(e.createdBy)) || null,
      attendance: nearbyAtt.get(String(e._id)),
    })
  );

  const statsOut = {
    eventCount: stats?.eventCount || 0,
    totalHours: stats?.totalHours || 0,
    streakWeeks: stats?.streakWeeks || 0,
  };

  const savedEvents = await fetchSavedDesignEvents(user._id, { limit: 4 });

  return (
    <HomeClient
      user={{ name: user.name, photoUrl: user.photoUrl, username: user.username }}
      stats={statsOut}
      nextEvent={nextEvent}
      nearbyEvents={nearbyEvents}
      savedEvents={savedEvents}
    />
  );
}
