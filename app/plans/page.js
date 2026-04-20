import { redirect } from "next/navigation";
import { getAuthUser } from "@/libs/auth";
import connectMongo from "@/libs/mongoose";
import BookingEvent from "@/models/BookingEvent";
import Rsvp from "@/models/Rsvp";
import User from "@/models/User";
import { toDesignEvent, fetchAttendanceMap } from "@/libs/nc-design-event";
import PlansClient from "./PlansClient";

export const dynamic = "force-dynamic";

function relative(dateTime) {
  if (!dateTime) return "";
  const ms = new Date(dateTime).getTime() - Date.now();
  const days = Math.round(ms / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  if (days < 7) return `in ${days} days`;
  const w = Math.floor(days / 7);
  return `in ${w} week${w === 1 ? "" : "s"}`;
}

export default async function PlansPage() {
  const user = await getAuthUser();
  if (!user) redirect("/signin?returnUrl=/plans");

  await connectMongo();
  const now = new Date();

  const rsvps = await Rsvp.find({
    participantUserId: user._id,
    status: "confirmed",
  })
    .select("eventId")
    .lean();
  const eventIds = rsvps.map((r) => r.eventId);

  if (!eventIds.length) {
    return <PlansClient upcoming={[]} past={[]} />;
  }

  const events = await BookingEvent.find({ _id: { $in: eventIds } }).lean();
  const hostIds = [...new Set(events.map((e) => String(e.createdBy)))];
  const hosts = hostIds.length
    ? await User.find({ _id: { $in: hostIds } }).select("name photoUrl").lean()
    : [];
  const hostMap = new Map(hosts.map((h) => [String(h._id), h]));
  const attMap = await fetchAttendanceMap(events.map((e) => e._id));

  const upcomingRaw = events
    .filter((e) => e.dateTime && new Date(e.dateTime) >= now)
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
  const pastRaw = events
    .filter((e) => e.dateTime && new Date(e.dateTime) < now)
    .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

  const adapt = (raw) => {
    const d = toDesignEvent(raw, {
      host: hostMap.get(String(raw.createdBy)) || null,
      attendance: attMap.get(String(raw._id)),
    });
    d.relative = relative(raw.dateTime);
    return d;
  };

  return (
    <PlansClient
      upcoming={upcomingRaw.map(adapt)}
      past={pastRaw.map(adapt)}
    />
  );
}
