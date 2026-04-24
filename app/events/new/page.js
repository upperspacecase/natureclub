"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PhoneFrame from "@/components/nc-design/PhoneFrame";
import NewEvent from "@/components/nc-design/screens/NewEvent";

function NewEventInner() {
  const router = useRouter();
  const search = useSearchParams();
  const existingId = search.get("id");
  const [draftId, setDraftId] = React.useState(existingId || null);
  const [initial, setInitial] = React.useState(null);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (existingId) {
          const res = await fetch(`/api/events/${existingId}`);
          if (res.status === 401) {
            router.push(`/signin?returnUrl=/events/new?id=${existingId}`);
            return;
          }
          if (!res.ok) throw new Error("Could not load draft");
          const ev = await res.json();
          if (cancelled) return;
          setDraftId(existingId);
          setInitial(eventToDraft(ev));
          return;
        }

        const res = await fetch("/api/events/create", { method: "POST" });
        if (res.status === 401) {
          router.push("/signin?returnUrl=/events/new");
          return;
        }
        if (!res.ok) throw new Error("Could not start draft");
        const { id } = await res.json();
        if (cancelled) return;
        setDraftId(id);
        setInitial({});
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [existingId, router]);

  async function handleSave({ draft, publish }) {
    if (!draftId) throw new Error("No draft id");
    const dateTime =
      draft.date && draft.time
        ? new Date(`${draft.date}T${draft.time}`).toISOString()
        : null;

    const meetingPoint = buildMeetingPoint(draft);

    const body = {
      title: draft.title,
      activityType: draft.activityType,
      durationMinutes: Number(draft.durationMinutes) || 90,
      groupSize: Number(draft.capacity) || 10,
      description: draft.about,
      price: Number(draft.price) || 0,
      currency: draft.currency || "USD",
      isPublic: !!draft.isPublic,
      dateTime,
      status: publish ? "published" : "draft",
    };
    if (meetingPoint) body.meetingPoint = meetingPoint;
    const cover = draft.coverPhotoUrl || draft.img;
    if (cover) body.coverPhotoUrl = cover;

    const res = await fetch(`/api/events/${draftId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Save failed");
    }
    router.push("/plans");
  }

  if (error) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#fafaf9",
        }}
      >
        {error}
      </div>
    );
  }

  if (!initial) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "rgba(255,255,255,0.5)",
        }}
      >
        {existingId ? "Loading draft…" : "Starting draft…"}
      </div>
    );
  }

  return (
    <PhoneFrame>
      <NewEvent
        initial={initial}
        onBack={() => router.back()}
        onSave={handleSave}
      />
    </PhoneFrame>
  );
}

function eventToDraft(ev) {
  const dt = ev.dateTime ? new Date(ev.dateTime) : null;
  return {
    title: ev.title || "",
    activityType: ev.activityType || "nature-walk",
    date: dt ? dt.toISOString().slice(0, 10) : "",
    time: dt ? dt.toISOString().slice(11, 16) : "",
    durationMinutes: ev.durationMinutes || 90,
    capacity: ev.groupSize || 10,
    price: ev.price ?? 0,
    currency: ev.currency || "USD",
    isPublic: ev.isPublic !== false,
    about: ev.description || "",
    coverPhotoUrl: ev.coverPhotoUrl || "",
    img: ev.coverPhotoUrl || "/nc/img/6.png",
    location: ev.meetingPoint?.description || "",
    lat: ev.meetingPoint?.lat ?? null,
    lng: ev.meetingPoint?.lng ?? null,
    bring: ev.whatToBring || [],
  };
}

function buildMeetingPoint(draft) {
  const description = (draft.location || "").trim();
  const hasCoords = draft.lat != null && draft.lng != null;
  if (!description && !hasCoords) return undefined;
  const mp = { description };
  if (hasCoords) {
    mp.lat = Number(draft.lat);
    mp.lng = Number(draft.lng);
  }
  return mp;
}

export default function NewEventPage() {
  return (
    <Suspense fallback={null}>
      <NewEventInner />
    </Suspense>
  );
}
