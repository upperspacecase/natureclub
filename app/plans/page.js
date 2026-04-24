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

  const myEvents = await BookingEvent.find({ createdBy: user._id })
    .sort({ dateTime: -1 })
    .lean();

  const drafts = myEvents.filter((e) => e.status === "draft");
  const hostingRaw = myEvents.filter(
    (e) =>
      e.status === "published" && e.dateTime && new Date(e.dateTime) >= now
  );
  const hostedPastRaw = myEvents.filter(
    (e) =>
      e.status !== "draft" && e.dateTime && new Date(e.dateTime) < now
  );

  const rsvps = await Rsvp.find({
    participantUserId: user._id,
    status: "confirmed",
  })
    .select("eventId")
    .lean();
  const rsvpEventIds = rsvps.map((r) => r.eventId);

  const attendingEvents = rsvpEventIds.length
    ? await BookingEvent.find({
        _id: { $in: rsvpEventIds },
        createdBy: { $ne: user._id },
      }).lean()
    : [];

  const attendingUpcomingRaw = attendingEvents
    .filter((e) => e.dateTime && new Date(e.dateTime) >= now)
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
  const attendingPastRaw = attendingEvents
    .filter((e) => e.dateTime && new Date(e.dateTime) < now)
    .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

  const hostIds = [
    ...new Set(attendingEvents.map((e) => String(e.createdBy))),
  ];
  const hosts = hostIds.length
    ? await User.find({ _id: { $in: hostIds } })
        .select("name photoUrl username")
        .lean()
    : [];
  const hostMap = new Map(hosts.map((h) => [String(h._id), h]));

  const allIds = [
    ...myEvents.map((e) => e._id),
    ...attendingEvents.map((e) => e._id),
  ];
  const attMap = await fetchAttendanceMap(allIds);

  const adapt = (raw, host, ownFlag = false) => {
    const d = toDesignEvent(raw, {
      host: host || null,
      attendance: attMap.get(String(raw._id)),
    });
    d.relative = relative(raw.dateTime);
    d.isOwner = ownFlag;
    return d;
  };

  const upcoming = [
    ...hostingRaw.map((e) => adapt(e, user, true)),
    ...attendingUpcomingRaw.map((e) =>
      adapt(e, hostMap.get(String(e.createdBy)))
    ),
  ].sort((a, b) => (a.dateTimeMs || 0) - (b.dateTimeMs || 0));

  const hosting = hostingRaw.map((e) => adapt(e, user, true));
  const draftsOut = drafts.map((e) => adapt(e, user, true));
  const past = [
    ...hostedPastRaw.map((e) => adapt(e, user, true)),
    ...attendingPastRaw.map((e) =>
      adapt(e, hostMap.get(String(e.createdBy)))
    ),
  ].sort((a, b) => (b.dateTimeMs || 0) - (a.dateTimeMs || 0));

  return (
    <PlansClient
      upcoming={upcoming}
      hosting={hosting}
      drafts={draftsOut}
      past={past}
    />
  );
}
