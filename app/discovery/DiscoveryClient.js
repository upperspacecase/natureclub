"use client";

import React from "react";
import { useRouter } from "next/navigation";
import PhoneFrame from "@/components/nc-design/PhoneFrame";
import Discover from "@/components/nc-design/screens/Discover";
import { useNCNav } from "@/components/nc-design/useNav";

function haversineMiles(a, b) {
  if (a?.lat == null || a?.lng == null || b?.lat == null || b?.lng == null) return null;
  const R = 3958.8;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function formatDistance(mi) {
  if (mi == null) return null;
  if (mi < 10) return `${mi.toFixed(1)} mi`;
  return `${Math.round(mi)} mi`;
}

export default function DiscoveryClient({ initialEvents = [], isAuthed }) {
  const router = useRouter();
  const { go, openEvent } = useNCNav();
  const [viewer, setViewer] = React.useState(null);
  const [locationLabel, setLocationLabel] = React.useState(null);
  const [savedMap, setSavedMap] = React.useState(() =>
    Object.fromEntries(initialEvents.map((e) => [e._id || e.id, !!e.saved]))
  );

  React.useEffect(() => {
    if (!viewer) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${viewer.lng},${viewer.lat}.json?types=place,neighborhood,locality&limit=1&access_token=${token}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        const place = data?.features?.[0]?.text;
        if (!cancelled && place) setLocationLabel(place);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [viewer]);

  async function handleShare(ev) {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/e/${ev.slug || ev.id}`;
    const data = {
      title: ev.title,
      text: `${ev.title} · ${ev.date}${ev.time ? ` · ${ev.time}` : ""}`,
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {}
    }
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
      } catch {}
    }
  }

  async function toggleSave(ev) {
    const key = ev._id || ev.id;
    const next = !savedMap[key];
    setSavedMap((m) => ({ ...m, [key]: next }));
    try {
      const res = await fetch("/api/event-like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: ev._id || ev.id }),
      });
      if (res.status === 401 || !isAuthed) {
        router.push("/signin?returnUrl=/discovery");
        return;
      }
      if (!res.ok) throw new Error("save failed");
    } catch {
      setSavedMap((m) => ({ ...m, [key]: !next }));
    }
  }

  React.useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setViewer({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => {},
      { maximumAge: 10 * 60 * 1000, timeout: 8000 }
    );
  }, []);

  const events = React.useMemo(() => {
    return initialEvents.map((e) => {
      let out = { ...e, saved: !!savedMap[e._id || e.id] };
      if (viewer && e.lat != null && e.lng != null) {
        const mi = haversineMiles(viewer, { lat: e.lat, lng: e.lng });
        out.distance = formatDistance(mi);
      }
      return out;
    });
  }, [initialEvents, viewer, savedMap]);

  return (
    <PhoneFrame>
      <Discover
        events={events}
        userLocation={{
          label: locationLabel || (viewer ? "Near you" : "Nearby"),
        }}
        onOpenEvent={openEvent}
        onNav={go}
        onToggleSave={toggleSave}
        onShare={handleShare}
      />
    </PhoneFrame>
  );
}
