import { cache } from "react";
import { notFound } from "next/navigation";
import connectMongo from "@/libs/mongoose";
import BookingEvent from "@/models/BookingEvent";
import User from "@/models/User";
import Rsvp from "@/models/Rsvp";
import { getAuthUser } from "@/libs/auth";
import { getSEOTags } from "@/libs/seo";
import { getWeatherForDate } from "@/libs/weather";
import EventLike from "@/models/EventLike";
import { toDesignEvent, fetchAttendanceMap } from "@/libs/nc-design-event";
import EventDetailClient from "./EventDetailClient";

export const dynamic = "force-dynamic";

// generateMetadata and the page both need the event; cache() collapses that
// into a single query per request.
const getEvent = cache(async (slug) => {
  await connectMongo();
  return BookingEvent.findOne({ slug, status: { $ne: "draft" } }).lean();
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event || event.status !== "published")
    return getSEOTags({ title: "Event not found" });
  return getSEOTags({
    title: event.title,
    description: event.description?.slice(0, 160) || "Join us.",
    openGraph: {
      title: event.title,
      description: event.description?.slice(0, 160) || "",
      images: event.coverPhotoUrl ? [{ url: event.coverPhotoUrl }] : [],
    },
  });
}

export default async function EventPage({ params }) {
  const { slug } = await params;

  const event = await getEvent(slug);
  if (!event) notFound();

  // Everything below depends only on the event, so it all goes out at once
  // instead of six sequential round trips.
  const [host, attendanceMap, viewer, weather] = await Promise.all([
    event.createdBy
      ? User.findById(event.createdBy).select("name username photoUrl").lean()
      : null,
    fetchAttendanceMap([event._id]),
    getAuthUser(),
    event.dateTime && event.meetingPoint?.lat
      ? getWeatherForDate(
          event.meetingPoint.lat,
          event.meetingPoint.lng,
          event.dateTime.toISOString()
        )
      : null,
  ]);

  let initialRsvp = false;
  let initialSaved = false;
  if (viewer) {
    const [existing, like] = await Promise.all([
      Rsvp.findOne({
        eventId: event._id,
        participantUserId: viewer._id,
        status: "confirmed",
      })
        .select("_id")
        .lean(),
      EventLike.findOne({ eventId: event._id, userId: viewer._id })
        .select("_id")
        .lean(),
    ]);
    initialRsvp = !!existing;
    initialSaved = !!like;
  }

  const designEvent = toDesignEvent(event, {
    host,
    attendance: attendanceMap.get(String(event._id)),
  });

  const isPast = event.dateTime ? new Date(event.dateTime) < new Date() : false;
  const notice =
    event.status === "cancelled"
      ? { kind: "cancelled", reason: event.cancelledReason || "" }
      : isPast
        ? { kind: "past" }
        : null;

  return (
    <EventDetailClient
      event={designEvent}
      weather={
        weather
          ? {
              summary: weather.description,
              tempF: weather.tempHigh,
              note:
                weather.precipChance > 30
                  ? `${weather.precipChance}% chance of rain.`
                  : null,
            }
          : null
      }
      notice={notice}
      eventId={String(event._id)}
      startIso={event.dateTime?.toISOString() || null}
      endIso={
        event.dateTime
          ? new Date(
              event.dateTime.getTime() + (event.durationMinutes || 90) * 60000
            ).toISOString()
          : null
      }
      hostUsername={host?.username || null}
      initialRsvp={initialRsvp}
      initialSaved={initialSaved}
      canRsvp={!!viewer && event.status === "published" && !isPast}
    />
  );
}
