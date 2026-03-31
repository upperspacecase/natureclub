import connectMongo from "@/libs/mongoose";
import Rsvp from "@/models/Rsvp";
import BookingEvent from "@/models/BookingEvent";

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

  const checkDate = new Date(now);
  if (!weekSet.has(getISOWeek(now))) {
    checkDate.setDate(checkDate.getDate() - 7);
  }

  let streak = 0;
  for (let i = 0; i < 52; i++) {
    if (weekSet.has(getISOWeek(checkDate))) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 7);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Fetch a user's journey data: stats, upcoming events, and past events.
 * Queries Rsvp + BookingEvent collections.
 */
export async function getUserJourneyData(userId) {
  await connectMongo();

  const rsvps = await Rsvp.find({
    participantUserId: userId,
    status: "confirmed",
  }).lean();

  const eventIds = rsvps.map((r) => r.eventId);

  const events =
    eventIds.length > 0
      ? await BookingEvent.find({ _id: { $in: eventIds } })
          .select("title slug coverPhotoUrl dateTime durationMinutes status")
          .lean()
      : [];

  const now = new Date();

  const upcomingEvents = events
    .filter(
      (e) =>
        e.dateTime && new Date(e.dateTime) > now && e.status === "published"
    )
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

  const pastEvents = events
    .filter((e) => e.dateTime && new Date(e.dateTime) <= now)
    .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

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

  // Events the user is hosting
  const hostedEvents = await BookingEvent.find({
    createdBy: userId,
    status: { $in: ["published", "draft"] },
  })
    .select("title slug coverPhotoUrl dateTime durationMinutes status")
    .sort({ dateTime: 1 })
    .lean();

  return { stats, upcomingEvents, pastEvents, hostedEvents };
}

/** Serialize Mongoose lean docs for client components */
export function serializeEvents(docs) {
  return docs.map((d) => ({
    ...d,
    _id: String(d._id),
    dateTime: d.dateTime ? new Date(d.dateTime).toISOString() : null,
  }));
}
