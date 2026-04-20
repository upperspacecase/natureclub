import EventLike from "@/models/EventLike";
import BookingEvent from "@/models/BookingEvent";
import User from "@/models/User";
import { toDesignEvent, fetchAttendanceMap } from "@/libs/nc-design-event";

/** Fetch a user's saved events (by userId) as DesignEvents. */
export async function fetchSavedDesignEvents(userId, { limit = 10 } = {}) {
  if (!userId) return [];

  const likes = await EventLike.find({ userId }).select("eventId").lean();
  const ids = likes.map((l) => l.eventId);
  if (!ids.length) return [];

  const events = await BookingEvent.find({
    _id: { $in: ids },
    status: "published",
  })
    .limit(limit)
    .lean();
  if (!events.length) return [];

  const hostIds = [...new Set(events.map((e) => String(e.createdBy)))];
  const hosts = hostIds.length
    ? await User.find({ _id: { $in: hostIds } }).select("name photoUrl").lean()
    : [];
  const hostMap = new Map(hosts.map((h) => [String(h._id), h]));
  const attMap = await fetchAttendanceMap(events.map((e) => e._id));

  return events.map((e) =>
    toDesignEvent(e, {
      host: hostMap.get(String(e.createdBy)) || null,
      attendance: attMap.get(String(e._id)),
    })
  );
}

/** Count of saved events for a user. */
export async function countSavedForUser(userId) {
  if (!userId) return 0;
  return EventLike.countDocuments({ userId });
}

/** Check whether a given user has saved a specific event. */
export async function isSavedByUser(userId, eventId) {
  if (!userId || !eventId) return false;
  const hit = await EventLike.findOne({ userId, eventId }).select("_id").lean();
  return !!hit;
}
