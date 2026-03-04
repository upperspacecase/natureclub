"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import DayStrip from "@/components/DayStrip";
import ExploreEventCard from "@/components/ExploreEventCard";

// Dynamically import the map to avoid SSR issues with mapbox-gl
const ExploreMap = dynamic(() => import("@/components/ExploreMap"), {
    ssr: false,
    loading: () => (
        <div className="flex h-full items-center justify-center bg-black">
            <span className="text-white/30">Loading map…</span>
        </div>
    ),
});

const toDateKey = (d) => {
    const date = new Date(d);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export default function ExplorePage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    });
    const [userLocation, setUserLocation] = useState(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    // Fetch events
    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/events/explore");
                const data = await res.json();
                setEvents(data.events || []);
            } catch (err) {
                console.error("Failed to load explore events:", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // Request geolocation
    useEffect(() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLocation({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                });
            },
            () => {
                // Denied or unavailable — use default (Ericeira)
            },
            { enableHighAccuracy: false, timeout: 8000 }
        );
    }, []);

    // Set of date keys that have events (for DayStrip dots)
    const eventDates = useMemo(() => {
        const set = new Set();
        events.forEach((e) => set.add(toDateKey(e.dateTime)));
        return set;
    }, [events]);

    // Filter events for the selected day
    const filteredEvents = useMemo(() => {
        const key = toDateKey(selectedDate);
        return events.filter((e) => toDateKey(e.dateTime) === key);
    }, [events, selectedDate]);

    const handleDateSelect = useCallback((date) => {
        setSelectedDate(date);
        setSheetOpen(false); // close sheet when switching days
    }, []);

    return (
        <div className="flex h-[100dvh] flex-col bg-black text-white">
            {/* Top bar */}
            <header className="shrink-0 border-b border-white/10 bg-black/80 backdrop-blur-md">
                <div className="flex items-center justify-between px-4 pt-3 pb-1">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-white/60 transition hover:text-white"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/logo-light.svg"
                            alt="Nature Club"
                            className="h-6 w-auto"
                        />
                    </Link>
                    <h1 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                        Explore
                    </h1>
                </div>
                <DayStrip
                    selectedDate={selectedDate}
                    onSelect={handleDateSelect}
                    eventDates={eventDates}
                />
            </header>

            {/* Map */}
            <div className="relative flex-1">
                {loading ? (
                    <div className="flex h-full items-center justify-center">
                        <span className="text-white/30">Loading events…</span>
                    </div>
                ) : (
                    <ExploreMap
                        events={filteredEvents}
                        userLocation={userLocation}
                    />
                )}

                {/* Bottom pill — show list */}
                {!loading && (
                    <button
                        onClick={() => setSheetOpen(!sheetOpen)}
                        className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/20 bg-black/80 px-5 py-2.5 text-sm font-medium text-white shadow-xl backdrop-blur-md transition hover:bg-black/90"
                    >
                        {sheetOpen
                            ? "Show map"
                            : filteredEvents.length > 0
                                ? `Show list (${filteredEvents.length})`
                                : "No events today"}
                    </button>
                )}
            </div>

            {/* Bottom sheet / list */}
            <div
                className={`shrink-0 overflow-hidden border-t border-white/10 bg-black transition-all duration-300 ease-in-out ${sheetOpen ? "max-h-[50vh]" : "max-h-0 border-t-0"
                    }`}
            >
                <div className="overflow-y-auto p-4" style={{ maxHeight: "50vh" }}>
                    {filteredEvents.length === 0 ? (
                        <div className="py-8 text-center">
                            <p className="text-sm font-medium text-white/40">No events</p>
                            <p className="mt-2 text-sm text-white/40">
                                Nothing happening this day — check another date!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredEvents.map((event) => (
                                <ExploreEventCard
                                    key={event.id}
                                    event={event}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
