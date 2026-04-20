import Rsvp from "@/models/Rsvp";
import User from "@/models/User";
import { formatPrice as intlFormatPrice } from "@/libs/formatPrice";

const ACTIVITY_LABELS = {
  "nature-walk": "Nature Walk",
  hike: "Hike",
  "bird-walk": "Bird Walk",
  "forest-bathing": "Forest Bathing",
  foraging: "Foraging",
  "outdoor-yoga": "Outdoor Yoga",
  meditation: "Meditation",
  other: "Other",
};

export function humanizeActivity(activityType, activityTypeOther) {
  if (activityType === "other" && activityTypeOther) return activityTypeOther;
  return ACTIVITY_LABELS[activityType] || "Event";
}

export function formatDate(dateTime) {
  if (!dateTime) return { date: "TBA", time: "" };
  const d = new Date(dateTime);
  const date = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const [weekday, rest] = date.split(", ");
  const time = d
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    .replace(" ", " ");
  return {
    date: `${weekday} · ${rest}`,
    time,
    month: d.toLocaleDateString("en-US", { month: "short" }),
    day: d.getDate(),
    weekday,
  };
}

export function formatDuration(min) {
  if (!min) return "";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

export function formatPrice(price, currency = "USD") {
  return intlFormatPrice(price, currency);
}

export function haversineMiles(a, b) {
  if (
    a?.lat == null ||
    a?.lng == null ||
    b?.lat == null ||
    b?.lng == null
  )
    return null;
  const R = 3958.8;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function formatDistance(mi) {
  if (mi == null) return null;
  if (mi < 10) return `${mi.toFixed(1)} mi`;
  return `${Math.round(mi)} mi`;
}

/**
 * Bulk-fetch attendee photos for a set of events.
 * Returns Map<eventId, { count, avatars: string[] }>.
 */
export async function fetchAttendanceMap(eventIds) {
  if (!eventIds?.length) return new Map();
  const rsvps = await Rsvp.find({
    eventId: { $in: eventIds },
    status: "confirmed",
  })
    .select("eventId participantUserId")
    .lean();

  const userIds = [...new Set(rsvps.map((r) => String(r.participantUserId)))];
  const users = await User.find({ _id: { $in: userIds } })
    .select("photoUrl")
    .lean();
  const userPhoto = new Map(users.map((u) => [String(u._id), u.photoUrl || ""]));

  const map = new Map();
  for (const r of rsvps) {
    const key = String(r.eventId);
    if (!map.has(key)) map.set(key, { count: 0, avatars: [] });
    const entry = map.get(key);
    entry.count += 1;
    const photo = userPhoto.get(String(r.participantUserId));
    if (photo && photo.trim() !== "" && entry.avatars.length < 5) {
      entry.avatars.push(photo);
    }
  }
  return map;
}

/**
 * Adapt a lean BookingEvent document → the shape the design screens expect.
 */
export function toDesignEvent(event, ctx = {}) {
  const { host = null, attendance = null, viewer = null } = ctx;
  const { date, time, month, day, weekday } = formatDate(event.dateTime);
  const distanceMi =
    viewer && event.meetingPoint?.lat && event.meetingPoint?.lng
      ? haversineMiles(viewer, {
          lat: event.meetingPoint.lat,
          lng: event.meetingPoint.lng,
        })
      : null;

  const locationStr =
    event.meetingPoint?.description || "Meeting point revealed after RSVP";

  return {
    id: event.slug || String(event._id),
    _id: String(event._id),
    slug: event.slug,
    dateTimeMs: event.dateTime ? new Date(event.dateTime).getTime() : null,
    img: event.coverPhotoUrl || "",
    title: event.title || "Untitled",
    date,
    time,
    month,
    day,
    weekday,
    host: host?.name || host?.username || "",
    hostAvatar: host?.photoUrl || "",
    hostUsername: host?.username || "",
    location: locationStr,
    distance: formatDistance(distanceMi),
    duration: formatDuration(event.durationMinutes),
    durationMinutes: event.durationMinutes || 0,
    price: formatPrice(event.price, event.currency),
    type: humanizeActivity(event.activityType, event.activityTypeOther),
    attending: attendance?.count ?? 0,
    capacity: event.groupSize || 0,
    attendees: attendance?.avatars ?? [],
    bring: event.whatToBring || [],
    about: event.description || "",
    status: event.status,
    isPublic: event.isPublic !== false,
  };
}
