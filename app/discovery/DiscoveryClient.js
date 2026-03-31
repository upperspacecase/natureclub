"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import NavMenu from "@/components/home/NavMenu";
import LocationBar from "@/components/discovery/LocationBar";
import TravelTimeLabel from "@/components/discovery/TravelTimeLabel";
import useUserLocation from "@/hooks/useUserLocation";
import useTravelTimes from "@/hooks/useTravelTimes";

const ExploreMap = dynamic(() => import("@/components/ExploreMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-black">
      <span className="text-white/30">Loading map…</span>
    </div>
  ),
});

const TIME_FILTERS = [
  { id: "all", label: "All Time" },
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "week", label: "Next Week" },
];

const ACTIVITY_FILTERS = [
  { id: "all", label: "All" },
  { id: "nature-walk", label: "Nature Walk" },
  { id: "hike", label: "Hike" },
  { id: "bird-walk", label: "Bird Walk" },
  { id: "forest-bathing", label: "Forest Bathing" },
  { id: "foraging", label: "Foraging" },
  { id: "outdoor-yoga", label: "Outdoor Yoga" },
  { id: "meditation", label: "Meditation" },
  { id: "beach", label: "Beach" },
  { id: "waterfall", label: "Waterfall" },
  { id: "viewpoint", label: "Viewpoint" },
  { id: "trail", label: "Trail" },
  { id: "lake", label: "Lake" },
  { id: "hot-spring", label: "Hot Spring" },
  { id: "rice-terrace", label: "Rice Terrace" },
];

function isToday(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isTomorrow(dateStr) {
  const d = new Date(dateStr);
  const tom = new Date();
  tom.setDate(tom.getDate() + 1);
  return (
    d.getFullYear() === tom.getFullYear() &&
    d.getMonth() === tom.getMonth() &&
    d.getDate() === tom.getDate()
  );
}

function isNextWeek(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const weekFromNow = new Date();
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  return d >= now && d <= weekFromNow;
}

export default function DiscoveryClient({ feedCards, user }) {
  const [view, setView] = useState("feed");
  const [filterOpen, setFilterOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState("all");
  const [activityFilter, setActivityFilter] = useState("all");

  const {
    location: userLocation,
    loading: locationLoading,
    setManualLocation,
    requestGeolocation,
  } = useUserLocation();

  const filtered = useMemo(() => {
    return feedCards.filter((card) => {
      if (timeFilter !== "all") {
        if (!card.dateTime) return false;
        if (timeFilter === "today" && !isToday(card.dateTime)) return false;
        if (timeFilter === "tomorrow" && !isTomorrow(card.dateTime))
          return false;
        if (timeFilter === "week" && !isNextWeek(card.dateTime)) return false;
      }
      if (activityFilter !== "all") {
        if (card.activityType !== activityFilter) return false;
      }
      return true;
    });
  }, [feedCards, timeFilter, activityFilter]);

  // Build map markers from filtered cards that have coordinates
  const mapEvents = useMemo(() => {
    return filtered
      .filter((c) => c.lat != null && c.lng != null)
      .map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        dateTime: c.dateTime || new Date().toISOString(),
        activityType: c.activityType,
        coverPhotoUrl: c.image,
        meetingPoint: { lat: c.lat, lng: c.lng },
        groupSize: 10,
        spotsLeft: 10,
      }));
  }, [filtered]);

  const destinations = useMemo(
    () =>
      filtered
        .filter((c) => c.lat != null && c.lng != null)
        .map((c) => ({ id: c.id, lat: c.lat, lng: c.lng })),
    [filtered]
  );

  const { travelTimes, loading: timesLoading } = useTravelTimes(
    userLocation,
    destinations
  );

  return (
    <div className="relative mx-auto h-[100dvh] w-full max-w-[430px] overflow-hidden bg-black">
      {/* ── Feed View ── */}
      {view === "feed" && (
        <div className="h-full snap-y snap-mandatory overflow-y-auto scrollbar-hide">
          {filtered.length > 0 ? (
            filtered.map((card) => (
              <section
                key={card.id}
                className="relative h-[100svh] min-h-[600px] snap-start overflow-hidden bg-black"
              >
                {card.image && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={card.image}
                      alt={card.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  </>
                )}

                <div className="absolute inset-0 z-10 flex flex-col justify-end px-6 pb-12">
                  <span className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-white/60">
                    {card.category}
                  </span>
                  {card.href ? (
                    <Link href={card.href}>
                      <h2 className="mb-3 font-serif text-4xl italic leading-tight text-white">
                        {card.title}
                      </h2>
                    </Link>
                  ) : (
                    <h2 className="mb-3 font-serif text-4xl italic leading-tight text-white">
                      {card.title}
                    </h2>
                  )}
                  {card.subtitle && (
                    <p className="text-sm uppercase tracking-wider text-white/80">
                      {card.subtitle}
                    </p>
                  )}
                  {card.lat != null && card.lng != null && userLocation && (
                    <TravelTimeLabel
                      walkMin={travelTimes.get(card.id)?.walkMin}
                      driveMin={travelTimes.get(card.id)?.driveMin}
                      loading={timesLoading}
                    />
                  )}
                </div>
              </section>
            ))
          ) : (
            <section className="relative flex h-[100svh] min-h-[600px] snap-start items-center justify-center bg-black">
              <div className="px-6 text-center">
                <h2 className="font-serif text-3xl italic text-white/60">
                  No matches
                </h2>
                <p className="mt-4 text-sm text-white/40">
                  Try adjusting your filters.
                </p>
                <button
                  onClick={() => {
                    setTimeFilter("all");
                    setActivityFilter("all");
                  }}
                  className="mt-6 text-sm font-medium uppercase tracking-wider text-white/60 underline transition hover:text-white"
                >
                  Clear Filters
                </button>
              </div>
            </section>
          )}
        </div>
      )}

      {/* ── Map View ── */}
      {view === "map" && (
        <div className="h-full w-full">
          <ExploreMap events={mapEvents} userLocation={null} />
        </div>
      )}

      {/* ── Location Bar ── */}
      <div className="absolute left-5 top-6 z-30 right-16">
        <LocationBar
          location={userLocation}
          loading={locationLoading}
          onLocationChange={setManualLocation}
          onRequestGeolocation={requestGeolocation}
        />
      </div>

      {/* ── Hamburger Menu ── */}
      <div className="absolute right-5 top-6 z-40">
        <NavMenu user={user} />
      </div>

      {/* ── Floating Action Buttons ── */}
      <div className={`absolute right-5 z-40 flex flex-col gap-4 transition-all duration-200 ${filterOpen ? "bottom-36" : "bottom-8"}`}>
        {/* Map / Feed toggle */}
        <button
          onClick={() => {
            setView(view === "feed" ? "map" : "feed");
            setFilterOpen(false);
          }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white/50 text-nc-primary-container shadow-2xl shadow-black/20 backdrop-blur-xl transition active:scale-90"
        >
          {view === "feed" ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="text-current"
            >
              <path
                d="M15 3l6 3v15l-6-3M15 3l-6 3M15 3v15m0 0l-6-3M9 6L3 3v15l6 3M9 6v15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="text-current"
            >
              <rect
                x="3"
                y="3"
                width="7"
                height="7"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <rect
                x="14"
                y="3"
                width="7"
                height="7"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <rect
                x="3"
                y="14"
                width="7"
                height="7"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <rect
                x="14"
                y="14"
                width="7"
                height="7"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          )}
        </button>
        {/* Filter */}
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className={`flex h-14 w-14 items-center justify-center rounded-full shadow-2xl shadow-black/20 backdrop-blur-xl transition active:scale-90 ${
            timeFilter !== "all" || activityFilter !== "all"
              ? "bg-white text-nc-primary-container"
              : "bg-white/50 text-nc-primary-container"
          }`}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="text-current"
          >
            <path
              d="M4 6h16M6 12h12M8 18h8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* ── Filter Panel ── */}
      {filterOpen && (
        <div className="absolute inset-x-0 bottom-0 z-50 bg-black/90 px-5 pb-8 pt-6 backdrop-blur-xl">
          {/* Close filter panel */}
          <button
            onClick={() => setFilterOpen(false)}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white/70"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          {/* Time filters */}
          <div className="hide-scrollbar mb-5 flex gap-2 overflow-x-auto">
            {TIME_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setTimeFilter(f.id)}
                className={`shrink-0 px-4 py-2 text-xs font-medium uppercase tracking-wider transition ${
                  timeFilter === f.id
                    ? "bg-white text-black"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Activity filters */}
          <div className="hide-scrollbar flex gap-2 overflow-x-auto">
            {ACTIVITY_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setActivityFilter(f.id)}
                className={`shrink-0 px-4 py-2 text-xs font-medium uppercase tracking-wider transition ${
                  activityFilter === f.id
                    ? "bg-white text-black"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
