import connectMongo from "@/libs/mongoose";
import BookingEvent from "@/models/BookingEvent";
import User from "@/models/User";
import EventLike from "@/models/EventLike";
import { getAuthUser } from "@/libs/auth";
import { toDesignEvent, fetchAttendanceMap } from "@/libs/nc-design-event";
import DiscoveryClient from "./DiscoveryClient";

export const dynamic = "force-dynamic";

export default async function DiscoveryPage() {
  await connectMongo();

  const now = new Date();
  const rawEvents = await BookingEvent.find({
    status: "published",
    isPublic: { $ne: false },
    dateTime: { $gte: now },
  })
    .sort({ dateTime: 1 })
    .limit(20)
    .lean();

  const hostIds = [...new Set(rawEvents.map((e) => String(e.createdBy)))];
  const hosts = hostIds.length
    ? await User.find({ _id: { $in: hostIds } })
        .select("name username photoUrl")
        .lean()
    : [];
  const hostMap = new Map(hosts.map((h) => [String(h._id), h]));

  const attMap = await fetchAttendanceMap(rawEvents.map((e) => e._id));

  const viewer = await getAuthUser();
  const likedIds = viewer
    ? new Set(
        (
          await EventLike.find({ userId: viewer._id })
            .select("eventId")
            .lean()
        ).map((l) => String(l.eventId))
      )
    : new Set();

  const events = rawEvents.map((e) => {
    const d = toDesignEvent(e, {
      host: hostMap.get(String(e.createdBy)) || null,
      attendance: attMap.get(String(e._id)),
    });
    d.lat = e.meetingPoint?.lat ?? null;
    d.lng = e.meetingPoint?.lng ?? null;
    d.saved = likedIds.has(String(e._id));
    return d;
  });

  return <DiscoveryClient initialEvents={events} isAuthed={!!viewer} />;
}
