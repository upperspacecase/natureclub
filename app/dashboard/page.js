import { redirect } from "next/navigation";
import { getAuthUser } from "@/libs/auth";
import connectMongo from "@/libs/mongoose";
import BookingEvent from "@/models/BookingEvent";
import Rsvp from "@/models/Rsvp";
import User from "@/models/User";
import { toDesignEvent, fetchAttendanceMap } from "@/libs/nc-design-event";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const user = await getAuthUser();
  if (!user) redirect("/signin?returnUrl=/dashboard");

  await connectMongo();
  const now = new Date();

  // Host's own events
  const myEvents = await BookingEvent.find({ createdBy: user._id })
    .sort({ dateTime: -1 })
    .lean();

  const drafts = myEvents.filter((e) => e.status === "draft");
  const hostedUpcoming = myEvents.filter(
    (e) => e.status === "published" && e.dateTime && new Date(e.dateTime) >= now
  );
  const hostedPast = myEvents.filter(
    (e) => e.status !== "draft" && e.dateTime && new Date(e.dateTime) < now
  );

  // Events user is attending (RSVP confirmed) that aren't their own
  const rsvps = await Rsvp.find({
    participantUserId: user._id,
    status: "confirmed",
  })
    .select("eventId")
    .lean();
  const rsvpEventIds = rsvps.map((r) => r.eventId);
  const attendingRaw = rsvpEventIds.length
    ? await BookingEvent.find({
        _id: { $in: rsvpEventIds },
        createdBy: { $ne: user._id },
        dateTime: { $gte: now },
      })
        .sort({ dateTime: 1 })
        .lean()
    : [];

  const allIds = [...myEvents.map((e) => e._id), ...attendingRaw.map((e) => e._id)];
  const attMap = await fetchAttendanceMap(allIds);

  const hostIds = [...new Set(attendingRaw.map((e) => String(e.createdBy)))];
  const hosts = hostIds.length
    ? await User.find({ _id: { $in: hostIds } }).select("name photoUrl").lean()
    : [];
  const hostMap = new Map(hosts.map((h) => [String(h._id), h]));

  const adapt = (raw, host) =>
    toDesignEvent(raw, { host, attendance: attMap.get(String(raw._id)) });

  return (
    <DashboardClient
      drafts={drafts.map((e) => adapt(e, user))}
      hosted={hostedUpcoming.map((e) => adapt(e, user))}
      past={hostedPast.map((e) => adapt(e, user))}
      attending={attendingRaw.map((e) => adapt(e, hostMap.get(String(e.createdBy))))}
    />
  );
}
