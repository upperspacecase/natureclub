import { redirect } from "next/navigation";
import { getAuthUser } from "@/libs/auth";
import connectMongo from "@/libs/mongoose";
import BookingEvent from "@/models/BookingEvent";
import Rsvp from "@/models/Rsvp";
import { getUserJourneyData } from "@/libs/user-stats";
import { countSavedForUser } from "@/libs/nc-saved-events";
import ProfileClient from "./ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getAuthUser();
  if (!user) redirect("/signin?returnUrl=/profile");

  await connectMongo();

  const { stats, hostedEvents } = await getUserJourneyData(user._id);
  const hostingCount = hostedEvents.filter(
    (e) => e.status === "published" && e.dateTime && new Date(e.dateTime) >= new Date()
  ).length;
  const draftCount = hostedEvents.filter((e) => e.status === "draft").length;
  const hostedPastCount = hostedEvents.filter(
    (e) => e.dateTime && new Date(e.dateTime) < new Date() && e.status !== "draft"
  ).length;

  const savedCount = await countSavedForUser(user._id);

  // Daily activity for the past year (attended + hosted), keyed by the
  // event's calendar day in the event timezone
  const now = new Date();
  const since = new Date(now.getTime() - 365 * 86400000);
  const confirmed = await Rsvp.find({
    participantUserId: user._id,
    status: "confirmed",
  })
    .select("eventId")
    .lean();
  const attendedDates = confirmed.length
    ? await BookingEvent.find({
        _id: { $in: confirmed.map((r) => r.eventId) },
        dateTime: { $gte: since, $lte: now },
      })
        .select("dateTime")
        .lean()
    : [];
  const hostedDates = hostedEvents.filter(
    (e) =>
      e.status !== "draft" &&
      e.dateTime &&
      new Date(e.dateTime) >= since &&
      new Date(e.dateTime) <= now
  );
  const dayKey = (d) =>
    new Date(d).toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const activity = {};
  for (const e of [...attendedDates, ...hostedDates]) {
    const k = dayKey(e.dateTime);
    activity[k] = (activity[k] || 0) + 1;
  }

  return (
    <ProfileClient
      activity={activity}
      user={{
        name: user.name,
        username: user.username,
        photoUrl: user.photoUrl,
        createdAt: user.createdAt?.toISOString?.() || null,
      }}
      stats={{
        eventCount: stats?.eventCount || 0,
        totalHours: stats?.totalHours || 0,
        hostedCount: hostedPastCount,
      }}
      memberCounts={{
        hosting: hostingCount,
        draft: draftCount,
        saved: savedCount,
      }}
    />
  );
}
