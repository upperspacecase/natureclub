"use client";

import { useRouter } from "next/navigation";
import PhoneFrame from "@/components/nc-design/PhoneFrame";
import EventDetail from "@/components/nc-design/screens/EventDetail";
import { useNCNav } from "@/components/nc-design/useNav";
import {
  buildGoogleCalendarUrl,
  buildIcs,
  downloadIcsFile,
} from "@/libs/nc-calendar";

export default function EventDetailClient({
  event,
  weather,
  eventId,
  startIso,
  endIso,
  hostUsername,
  initialRsvp,
  initialSaved,
  canRsvp,
}) {
  const router = useRouter();
  const { back } = useNCNav();
  const slug = event.slug || event.id;

  async function handleRsvp() {
    const res = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, status: "confirmed" }),
    });
    if (res.status === 401) {
      router.push(`/signin?returnUrl=/e/${slug}`);
      throw new Error("Sign in to RSVP");
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "RSVP failed");
    }
  }

  async function handleCancel() {
    const res = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, status: "cancelled" }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Cancel failed");
    }
  }

  async function handleToggleSave() {
    const res = await fetch("/api/event-like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId }),
    });
    if (res.status === 401) {
      router.push(`/signin?returnUrl=/e/${slug}`);
      throw new Error("Sign in to save");
    }
    if (!res.ok) throw new Error("Save failed");
  }

  function shareUrl() {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/e/${slug}`;
  }

  async function handleShare() {
    const url = shareUrl();
    const data = {
      title: event.title,
      text: `${event.title} · ${event.date}${event.time ? ` · ${event.time}` : ""}`,
      url,
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {
        // user cancelled or share not available; fall through
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
      } catch {}
    }
  }

  async function handleDownloadStoryCard() {
    const url = `/api/events/${eventId}/story-card`;
    window.open(url, "_blank");
  }

  function googleCalUrl() {
    if (!startIso || !endIso) return null;
    return buildGoogleCalendarUrl({
      title: event.title,
      startIso,
      endIso,
      description: event.about,
      location: event.location,
    });
  }

  function handleAddToGoogleCal() {
    const url = googleCalUrl();
    if (url) window.open(url, "_blank");
  }

  function handleDownloadIcs() {
    if (!startIso || !endIso) return;
    const ics = buildIcs({
      title: event.title,
      startIso,
      endIso,
      description: event.about,
      location: event.location,
      url: shareUrl(),
      uid: `nc-${eventId}@natureclub`,
    });
    downloadIcsFile(`${(event.slug || "event")}.ics`, ics);
  }

  function handleOpenHost() {
    if (hostUsername) router.push(`/profile/${hostUsername}`);
  }

  return (
    <PhoneFrame>
      <EventDetail
        event={event}
        weather={weather}
        initialRsvp={initialRsvp}
        initialSaved={initialSaved}
        canRsvp={canRsvp}
        onBack={back}
        onRsvp={handleRsvp}
        onCancelRsvp={handleCancel}
        onToggleSave={handleToggleSave}
        onShare={handleShare}
        onDownloadStoryCard={handleDownloadStoryCard}
        onAddToGoogleCal={handleAddToGoogleCal}
        onDownloadIcs={handleDownloadIcs}
        onOpenHost={hostUsername ? handleOpenHost : null}
      />
    </PhoneFrame>
  );
}
