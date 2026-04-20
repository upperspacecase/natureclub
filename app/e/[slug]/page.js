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

export async function generateMetadata({ params }) {
  const { slug } = await params;
  await connectMongo();
  const event = await BookingEvent.findOne({ slug, status: "published" });
  if (!event) return getSEOTags({ title: "Event not found" });
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
  await connectMongo();

  const event = await BookingEvent.findOne({
    slug,
    status: { $ne: "draft" },
  }).lean();
  if (!event) notFound();

  const host = event.createdBy
    ? await User.findById(event.createdBy).select("name username photoUrl").lean()
    : null;

  const attendanceMap = await fetchAttendanceMap([event._id]);
  const viewer = await getAuthUser();

  let initialRsvp = false;
  let initialSaved = false;
  if (viewer) {
    const [existing, like] = await Promise.all([
      Rsvp.findOne({
        eventId: event._id,
        participantUserId: viewer._id,
        status: "confirmed",
      }).lean(),
      EventLike.findOne({ eventId: event._id, userId: viewer._id }).lean(),
    ]);
    initialRsvp = !!existing;
    initialSaved = !!like;
  }

  const designEvent = toDesignEvent(event, {
    host,
    attendance: attendanceMap.get(String(event._id)),
  });

  let weather = null;
  if (event.dateTime && event.meetingPoint?.lat) {
    const raw = await getWeatherForDate(
      event.meetingPoint.lat,
      event.meetingPoint.lng,
      event.dateTime.toISOString()
    );
    if (raw) {
      weather = {
        summary: raw.description,
        tempF: raw.tempHigh,
        note: raw.precipChance > 30 ? `${raw.precipChance}% chance of rain.` : null,
      };
    }
  }

  return (
    <EventDetailClient
      event={designEvent}
      weather={weather}
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
      canRsvp={!!viewer && event.status === "published"}
    />
  );
}
