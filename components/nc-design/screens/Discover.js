"use client";

import React from "react";
import { AvatarStack, Caps, I, Italic, NatureClubWordmark, TabBar } from "../primitives";

const TYPE_LABELS = {
  "nature-walk": "Nature Walk",
  hike: "Hike",
  "bird-walk": "Bird Walk",
  "forest-bathing": "Forest Bathing",
  foraging: "Foraging",
  "outdoor-yoga": "Outdoor Yoga",
  meditation: "Meditation",
  other: "Other",
};

const WHEN_OPTIONS = [
  { id: "all", label: "Any time" },
  { id: "today", label: "Today" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
];

export default function Discover({
  events = [],
  userLocation,
  onOpenEvent,
  onNav,
  onToggleSave,
  onShare,
  onSetLocation,
  onUseMyLocation,
}) {
  const [mapOpen, setMapOpen] = React.useState(false);
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [locationOpen, setLocationOpen] = React.useState(false);
  const [filters, setFilters] = React.useState({
    type: "All",
    maxDistance: 50,
    when: "all",
  });

  const visible = React.useMemo(() => {
    const now = Date.now();
    const dayMs = 86400000;
    return events.filter((e) => {
      if (filters.type !== "All" && e.type !== filters.type) return false;
      if (filters.maxDistance < 50 && e.distance) {
        const mi = parseFloat(e.distance);
        if (!isNaN(mi) && mi > filters.maxDistance) return false;
      }
      if (filters.when !== "all" && e.dateTimeMs) {
        const ms = e.dateTimeMs - now;
        const limit =
          filters.when === "today" ? dayMs : filters.when === "week" ? 7 * dayMs : 30 * dayMs;
        if (ms > limit) return false;
      }
      return true;
    });
  }, [events, filters]);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#0a0a0a" }}>
      <div
        className="nc-no-scrollbar"
        style={{
          position: "absolute",
          inset: 0,
          overflowY: "auto",
          scrollSnapType: "y mandatory",
        }}
      >
        {visible.length === 0 ? (
          <EmptyState filtered={events.length > 0} onNav={onNav} />
        ) : (
          visible.map((e) => (
            <DiscoverCard
              key={e.id}
              e={e}
              onOpen={() => onOpenEvent?.(e.id)}
              onToggleSave={() => onToggleSave?.(e)}
              onShare={() => onShare?.(e)}
            />
          ))
        )}
      </div>


      <div
        style={{
          position: "absolute",
          top: 'max(16px, env(safe-area-inset-top))',
          left: 16,
          right: 16,
          zIndex: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => setLocationOpen(true)}
          style={{
            padding: "9px 14px",
            borderRadius: 999,
            background: "rgba(10,10,10,0.55)",
            backdropFilter: "blur(18px)",
            border: "0.5px solid rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            gap: 7,
            color: "#fafaf9",
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          {I.pin("#fafaf9")}
          {userLocation?.label || "Nearby"}
          {I.chevR("rgba(255,255,255,0.5)")}
        </button>
      </div>

      {events.length > 0 && (
        <div
          style={{
            position: "absolute",
            right: 14,
            bottom: 120,
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {[
            { icon: I.map, onClick: () => setMapOpen(true) },
            { icon: I.filter, onClick: () => setFilterOpen(true) },
          ].map((f, i) => (
            <button
              key={i}
              onClick={f.onClick}
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "rgba(10,10,10,0.65)",
                backdropFilter: "blur(18px)",
                border: "0.5px solid rgba(255,255,255,0.18)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fafaf9",
              }}
            >
              {f.icon("#fafaf9")}
            </button>
          ))}
        </div>
      )}

      {locationOpen && (
        <LocationSheet
          current={userLocation?.label}
          onClose={() => setLocationOpen(false)}
          onPick={(loc) => {
            setLocationOpen(false);
            onSetLocation?.(loc);
          }}
          onUseCurrent={() => {
            setLocationOpen(false);
            onUseMyLocation?.();
          }}
        />
      )}

      <TabBar active="discover" onNav={onNav} overlay />

      {filterOpen && (
        <FilterSheet
          total={visible.length}
          filters={filters}
          onApply={(next) => {
            setFilters(next);
            setFilterOpen(false);
          }}
          onClose={() => setFilterOpen(false)}
        />
      )}
      {mapOpen && <MapSheet events={visible} onClose={() => setMapOpen(false)} onOpen={onOpenEvent} />}
    </div>
  );
}

function EmptyState({ filtered, onNav }) {
  const [email, setEmail] = React.useState("");
  const [notifyState, setNotifyState] = React.useState("idle"); // idle | sending | done | error

  async function handleNotify() {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setNotifyState("error");
      return;
    }
    setNotifyState("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, role: "member", source: "notify" }),
      });
      if (!res.ok) throw new Error();
      setNotifyState("done");
    } catch {
      setNotifyState("error");
    }
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        textAlign: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 300 }}>
        <Italic size={28} style={{ display: "block" }}>
          {filtered ? "Nothing matches." : "Nothing nearby yet."}
        </Italic>
        <p
          style={{
            marginTop: 12,
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: 13,
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.5,
          }}
        >
          {filtered
            ? "Try widening your filters."
            : "No published events right now. Be the first to lead one, or leave your email and we'll tell you when something's near you."}
        </p>
        {!filtered && (
          <>
            <button
              onClick={() => onNav?.("newEvent")}
              style={{
                marginTop: 22,
                width: "100%",
                padding: "14px 22px",
                borderRadius: 10,
                background: "#fafaf9",
                color: "#0a0a0a",
                border: "none",
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Host the first one
            </button>
            {notifyState === "done" ? (
              <p
                style={{
                  marginTop: 16,
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontSize: 13,
                  color: "#c8d9a8",
                }}
              >
                You&apos;re on the list. We&apos;ll email you when something&apos;s nearby.
              </p>
            ) : (
              <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                <input
                  type="email"
                  value={email}
                  onChange={(ev) => {
                    setEmail(ev.target.value);
                    if (notifyState === "error") setNotifyState("idle");
                  }}
                  placeholder="you@email.com"
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: "11px 14px",
                    background: "rgba(255,255,255,0.04)",
                    border:
                      notifyState === "error"
                        ? "0.5px solid rgba(233,120,100,0.5)"
                        : "0.5px solid rgba(255,255,255,0.12)",
                    borderRadius: 10,
                    color: "#fafaf9",
                    fontFamily: "var(--font-inter), Inter, sans-serif",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
                <button
                  onClick={handleNotify}
                  disabled={notifyState === "sending"}
                  style={{
                    padding: "11px 16px",
                    borderRadius: 10,
                    background: "transparent",
                    border: "0.5px solid rgba(255,255,255,0.22)",
                    color: "#fafaf9",
                    fontFamily: "var(--font-inter), Inter, sans-serif",
                    fontSize: 13,
                    cursor: notifyState === "sending" ? "wait" : "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {notifyState === "sending" ? "…" : "Notify me"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function parseMiles(dist) {
  if (!dist) return null;
  const m = String(dist).match(/([\d.]+)/);
  return m ? parseFloat(m[1]) : null;
}

function formatTravelMinutes(mi, mph) {
  if (mi == null) return null;
  const min = Math.max(1, Math.round((mi / mph) * 60));
  return min;
}

function DiscoverCard({ e, onOpen, onToggleSave, onShare }) {
  const saved = !!e.saved;
  const miles = parseMiles(e.distance);
  const walkMin = formatTravelMinutes(miles, 3);
  const bikeMin = formatTravelMinutes(miles, 12);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        scrollSnapAlign: "start",
        scrollSnapStop: "always",
        flexShrink: 0,
      }}
    >
      <button
        onClick={onOpen}
        style={{
          position: "absolute",
          inset: 0,
          border: "none",
          padding: 0,
          background: "none",
          cursor: "pointer",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={e.img || "/nc/img/1.png"}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </button>
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 'calc(max(16px, env(safe-area-inset-top)) + 56px)',
          left: 16,
          zIndex: 15,
          pointerEvents: "none",
        }}
      >
        <NatureClubWordmark height={20} />
      </div>

      <div
        style={{
          position: "absolute",
          top: 'calc(max(16px, env(safe-area-inset-top)) + 52px)',
          right: 14,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          alignItems: "center",
          zIndex: 15,
        }}
      >
        <button
          onClick={(ev) => {
            ev.stopPropagation();
            onToggleSave?.();
          }}
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: saved ? "#fafaf9" : "rgba(10,10,10,0.55)",
            backdropFilter: "blur(14px)",
            border: "0.5px solid rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          aria-label={saved ? "Unsave" : "Save"}
        >
          {saved ? I.heart("#994621", "#994621") : I.heart("#fafaf9")}
        </button>
        <button
          onClick={(ev) => {
            ev.stopPropagation();
            onShare?.();
          }}
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: "rgba(10,10,10,0.55)",
            backdropFilter: "blur(14px)",
            border: "0.5px solid rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          aria-label="Share"
        >
          {I.share("#fafaf9")}
        </button>
      </div>

      <div style={{ position: "absolute", left: 20, right: 20, bottom: 110, color: "#fafaf9" }}>
        <Italic
          size={32}
          style={{
            display: "block",
            letterSpacing: "-0.015em",
            textShadow: "0 1px 10px rgba(0,0,0,0.3)",
          }}
        >
          {e.title}
        </Italic>
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6 }}>
          {I.calendar("rgba(255,255,255,0.85)")}
          <span
            style={{
              marginLeft: 2,
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: 12,
              color: "rgba(255,255,255,0.85)",
            }}
          >
            {e.date} · {e.time}
          </span>
        </div>
        {(walkMin != null || bikeMin != null) && (
          <div
            style={{
              marginTop: 8,
              display: "flex",
              alignItems: "center",
              gap: 14,
              color: "rgba(255,255,255,0.8)",
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: 12,
            }}
          >
            {walkMin != null && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                {I.walk("rgba(255,255,255,0.85)")}
                {walkMin} min walk
              </span>
            )}
            {bikeMin != null && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                {I.bike("rgba(255,255,255,0.85)")}
                {bikeMin} min bike
              </span>
            )}
          </div>
        )}
        {(e.attendees?.length > 0 || e.capacity > 0) && (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
            {e.attendees?.length > 0 && (
              <AvatarStack imgs={e.attendees.slice(0, 4)} size={24} border="#1a1a1a" />
            )}
            <div
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: 12,
                color: "rgba(255,255,255,0.8)",
              }}
            >
              {e.attending} going
              {e.capacity > 0 && ` · ${Math.max(0, e.capacity - e.attending)} spots left`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LocationSheet({ current, onClose, onPick, onUseCurrent }) {
  const [query, setQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const debounceRef = React.useRef(null);

  React.useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?types=place,neighborhood,locality,region&limit=5&access_token=${token}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        setSuggestions(data?.features || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 55,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          background: "#141210",
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          padding: "14px 20px 34px",
          color: "#fafaf9",
        }}
      >
        <div
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            background: "rgba(255,255,255,0.2)",
            margin: "0 auto 16px",
          }}
        />
        <Italic size={22} style={{ display: "block" }}>
          Change location
        </Italic>
        {current && (
          <Caps style={{ color: "rgba(255,255,255,0.45)", display: "block", marginTop: 6 }}>
            Currently · {current}
          </Caps>
        )}

        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search city, neighborhood…"
          style={{
            width: "100%",
            marginTop: 16,
            padding: "12px 14px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.05)",
            border: "0.5px solid rgba(255,255,255,0.15)",
            color: "#fafaf9",
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: 14,
            outline: "none",
          }}
        />

        {suggestions.length > 0 && (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 2 }}>
            {suggestions.map((s) => (
              <button
                key={s.id}
                onClick={() =>
                  onPick?.({
                    lat: s.center[1],
                    lng: s.center[0],
                    label: s.text,
                    description: s.place_name,
                  })
                }
                style={{
                  padding: "12px 10px",
                  borderRadius: 8,
                  background: "transparent",
                  border: "none",
                  borderBottom: "0.5px solid rgba(255,255,255,0.06)",
                  color: "#fafaf9",
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontSize: 13,
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <div>{s.text}</div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.45)",
                    marginTop: 2,
                  }}
                >
                  {s.place_name}
                </div>
              </button>
            ))}
          </div>
        )}

        {!suggestions.length && !loading && (
          <button
            onClick={onUseCurrent}
            style={{
              width: "100%",
              marginTop: 16,
              padding: "13px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.05)",
              border: "0.5px solid rgba(255,255,255,0.15)",
              color: "#fafaf9",
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {I.pin("#fafaf9")} Use my current location
          </button>
        )}
      </div>
    </div>
  );
}

function FilterSheet({ filters, onApply, onClose, total }) {
  const types = [
    "All",
    "Nature Walk",
    "Hike",
    "Bird Walk",
    "Forest Bathing",
    "Foraging",
    "Outdoor Yoga",
    "Meditation",
  ];
  const [active, setActive] = React.useState(filters?.type || "All");
  const [dist, setDist] = React.useState(filters?.maxDistance ?? 50);
  const [when, setWhen] = React.useState(filters?.when || "all");

  return (
    <div
      onClick={onClose}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 50,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "flex-end",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          background: "#141210",
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          padding: "14px 20px 34px",
          color: "#fafaf9",
        }}
      >
        <div
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            background: "rgba(255,255,255,0.2)",
            margin: "0 auto 16px",
          }}
        />
        <Italic size={22} style={{ display: "block" }}>
          Refine your feed
        </Italic>

        <Caps style={{ color: "rgba(255,255,255,0.5)", marginTop: 22, display: "block" }}>Type</Caps>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
          {types.map((t) => {
            const on = t === active;
            return (
              <button
                key={t}
                onClick={() => setActive(t)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 999,
                  background: on ? "#fafaf9" : "transparent",
                  color: on ? "#0a0a0a" : "#fafaf9",
                  border: on ? "0.5px solid #fafaf9" : "0.5px solid rgba(255,255,255,0.2)",
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {t}
              </button>
            );
          })}
        </div>

        <Caps style={{ color: "rgba(255,255,255,0.5)", marginTop: 22, display: "block" }}>
          Within {dist} miles
        </Caps>
        <input
          type="range"
          min="1"
          max="50"
          value={dist}
          onChange={(e) => setDist(Number(e.target.value))}
          style={{ width: "100%", marginTop: 10, accentColor: "#c8d9a8" }}
        />

        <Caps style={{ color: "rgba(255,255,255,0.5)", marginTop: 22, display: "block" }}>When</Caps>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          {WHEN_OPTIONS.map((opt) => {
            const on = when === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setWhen(opt.id)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 10,
                  background: on ? "rgba(200,217,168,0.15)" : "transparent",
                  color: on ? "#c8d9a8" : "#fafaf9",
                  border: on
                    ? "0.5px solid rgba(200,217,168,0.3)"
                    : "0.5px solid rgba(255,255,255,0.15)",
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onApply({ type: active, maxDistance: dist, when })}
          style={{
            width: "100%",
            marginTop: 24,
            padding: "14px",
            borderRadius: 10,
            background: "#fafaf9",
            color: "#0a0a0a",
            border: "none",
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Apply filters
        </button>
      </div>
    </div>
  );
}

function MapSheet({ events, onClose, onOpen }) {
  const geo = events.filter((e) => e.lat != null && e.lng != null);
  const fallback = events.slice(0, 8).map((e, i) => ({
    e,
    x: 20 + ((i * 13) % 70),
    y: 20 + ((i * 21) % 60),
  }));
  let pins;
  if (geo.length >= 2) {
    const lats = geo.map((e) => e.lat);
    const lngs = geo.map((e) => e.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latRange = Math.max(0.001, maxLat - minLat);
    const lngRange = Math.max(0.001, maxLng - minLng);
    pins = geo.slice(0, 20).map((e) => ({
      e,
      x: 10 + ((e.lng - minLng) / lngRange) * 80,
      y: 10 + (1 - (e.lat - minLat) / latRange) * 80,
    }));
  } else {
    pins = fallback;
  }
  const [sel, setSel] = React.useState(events[0]);

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 55, background: "#0a0a0a" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 30% 40%, #1e2817 0%, #121510 40%, #0a0a0a 100%)",
        }}
      >
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          preserveAspectRatio="none"
        >
          {[...Array(12)].map((_, i) => (
            <path
              key={i}
              d={`M 0 ${50 + i * 40} Q 100 ${20 + i * 40}, 200 ${60 + i * 40} T 400 ${40 + i * 40}`}
              fill="none"
              stroke="rgba(200,217,168,0.06)"
              strokeWidth="1"
            />
          ))}
        </svg>

        {pins.map((p, i) => (
          <button
            key={i}
            onClick={() => setSel(p.e)}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: "translate(-50%, -50%)",
              width: sel === p.e ? 44 : 36,
              height: sel === p.e ? 44 : 36,
              borderRadius: "50%",
              background: sel === p.e ? "#fafaf9" : "rgba(250,249,246,0.85)",
              border: sel === p.e ? "2px solid #c8d9a8" : "1px solid rgba(255,255,255,0.5)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0,
              overflow: "hidden",
              transition: "all 0.2s",
            }}
          >
            {p.e.img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.e.img}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
              />
            ) : null}
          </button>
        ))}

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "#4d8bff",
            border: "3px solid #fafaf9",
            boxShadow: "0 0 0 8px rgba(77,139,255,0.2)",
          }}
        />
      </div>

      
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 'max(16px, env(safe-area-inset-top))',
          left: 16,
          zIndex: 10,
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "rgba(10,10,10,0.65)",
          backdropFilter: "blur(18px)",
          border: "0.5px solid rgba(255,255,255,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        {I.close("#fafaf9")}
      </button>

      <div
        style={{
          position: "absolute",
          top: 'max(16px, env(safe-area-inset-top))',
          left: 64,
          right: 16,
          padding: "9px 14px",
          borderRadius: 999,
          background: "rgba(10,10,10,0.65)",
          backdropFilter: "blur(18px)",
          border: "0.5px solid rgba(255,255,255,0.18)",
          color: "#fafaf9",
          fontFamily: "var(--font-inter), Inter, sans-serif",
          fontSize: 12,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {I.pin("#fafaf9")} {events.length} event{events.length === 1 ? "" : "s"} nearby
      </div>

      {sel && (
        <button
          onClick={() => onOpen?.(sel.id)}
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: 28,
            padding: 14,
            borderRadius: 14,
            background: "#fafaf9",
            border: "none",
            cursor: "pointer",
            display: "flex",
            gap: 12,
            alignItems: "center",
            textAlign: "left",
            boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sel.img || "/nc/img/1.png"}
            alt=""
            style={{ width: 64, height: 78, borderRadius: 10, objectFit: "cover" }}
          />
          <div style={{ flex: 1 }}>
            <Italic size={18} color="#0a0a0a" style={{ display: "block" }}>
              {sel.title}
            </Italic>
            <div
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: 11,
                color: "#57534e",
                marginTop: 4,
              }}
            >
              {sel.date} · {sel.time}
            </div>
            <div
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: 11,
                color: "#78716c",
                marginTop: 2,
              }}
            >
              {sel.location}
              {sel.distance ? ` · ${sel.distance}` : ""}
            </div>
          </div>
          <div style={{ color: "#0a0a0a" }}>{I.chevR("#0a0a0a")}</div>
        </button>
      )}
    </div>
  );
}
