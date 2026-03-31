import { redirect } from "next/navigation";
import { getAuthUser } from "@/libs/auth";
import connectMongo from "@/libs/mongoose";
import Rsvp from "@/models/Rsvp";
import BookingEvent from "@/models/BookingEvent";
import UserHome from "@/components/home/DashboardHome";

export const dynamic = "force-dynamic";

function getISOWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const yearStart = new Date(d.getFullYear(), 0, 4);
  const weekNum = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getFullYear()}-W${weekNum}`;
}

function calculateStreak(eventDates) {
  if (eventDates.length === 0) return 0;

  const weekSet = new Set(eventDates.map((d) => getISOWeek(d)));

  const now = new Date();
  let currentWeek = getISOWeek(now);
  let streak = 0;

  // If no event this week, start checking from last week
  if (!weekSet.has(currentWeek)) {
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);
    currentWeek = getISOWeek(lastWeek);
  }

  // Walk backwards counting consecutive weeks
  const checkDate = new Date(now);
  if (!weekSet.has(getISOWeek(now))) {
    checkDate.setDate(checkDate.getDate() - 7);
  }

  for (let i = 0; i < 52; i++) {
    const week = getISOWeek(checkDate);
    if (weekSet.has(week)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 7);
    } else {
      break;
    }
  }

  return streak;
}

export default async function Home() {
  const user = await getAuthUser();
  if (!user) redirect("/signin");

  await connectMongo();

  // Fetch all confirmed RSVPs for this user
  const rsvps = await Rsvp.find({
    participantUserId: user._id,
    status: "confirmed",
  }).lean();

  const eventIds = rsvps.map((r) => r.eventId);

  // Fetch the associated events
  const events =
    eventIds.length > 0
      ? await BookingEvent.find({
          _id: { $in: eventIds },
        })
          .select("title slug coverPhotoUrl dateTime durationMinutes status")
          .lean()
      : [];

  const now = new Date();

  const upcomingEvents = events
    .filter((e) => e.dateTime && new Date(e.dateTime) > now && e.status === "published")
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

  const pastEvents = events
    .filter((e) => e.dateTime && new Date(e.dateTime) <= now)
    .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

  // Calculate stats from past events
  const totalMinutes = pastEvents.reduce(
    (sum, e) => sum + (e.durationMinutes || 90),
    0
  );
  const totalHours = Math.round(totalMinutes / 60);
  const streakWeeks = calculateStreak(
    pastEvents.map((e) => e.dateTime).filter(Boolean)
  );

  const stats = {
    eventCount: pastEvents.length,
    totalHours,
    streakWeeks,
  };

  // Serialize for client component (ObjectId → string, Date → ISO string)
  const serialize = (docs) =>
    docs.map((d) => ({
      ...d,
      _id: String(d._id),
      dateTime: d.dateTime ? new Date(d.dateTime).toISOString() : null,
    }));

  return (
    <UserHome
      user={{ name: user.name, username: user.username, photoUrl: user.photoUrl }}
      stats={stats}
      upcomingEvents={serialize(upcomingEvents)}
      pastEvents={serialize(pastEvents)}
    />
  );
}
