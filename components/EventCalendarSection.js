"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import DayStrip from "@/components/DayStrip";
import apiClient from "@/libs/api";

const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });

const formatDuration = (mins) => {
    if (!mins) return "";
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
};

const toDateKey = (d) => {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
};

const formatTag = (value = "") =>
    value
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");

const EventCalendarSection = () => {
    const [selectedDate, setSelectedDate] = useState(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    });
    const [experiences, setExperiences] = useState([]);
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "start",
        containScroll: "trimSnaps",
        dragFree: true,
    });
    const isScrollingRef = useRef(false);

    // Fetch experiences
    useEffect(() => {
        const fetchExperiences = async () => {
            try {
                const res = await apiClient.get("/events/explore");
                if (res?.events) {
                    setExperiences(res.events);
                }
            } catch (err) {
                console.error("Failed to load experiences:", err);
            }
        };
        fetchExperiences();
    }, []);

    // Group experiences by date
    const eventsByDate = useMemo(() => {
        const grouped = {};
        experiences.forEach((exp) => {
            const key = toDateKey(exp.dateTime);
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(exp);
        });
        // Sort each day's events by time
        Object.values(grouped).forEach((arr) =>
            arr.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
        );
        return grouped;
    }, [experiences]);

    // Dates that have events (for DayStrip dots)
    const eventDates = useMemo(
        () => new Set(Object.keys(eventsByDate)),
        [eventsByDate]
    );

    // Build flat card array with first-of-date flag
    const cards = useMemo(() => {
        const sorted = Object.keys(eventsByDate).sort();
        const result = [];
        sorted.forEach((dateKey) => {
            eventsByDate[dateKey].forEach((exp, idx) => {
                result.push({
                    ...exp,
                    _type: "event",
                    _dateKey: dateKey,
                    _isFirstOfDate: idx === 0,
                });
            });
        });
        return result;
    }, [eventsByDate]);

    // Scroll carousel when date is selected
    const handleDateSelect = useCallback(
        (date) => {
            setSelectedDate(date);
            const key = toDateKey(date);
            const index = cards.findIndex(
                (c) => c._isFirstOfDate && c._dateKey === key
            );
            if (index >= 0 && emblaApi) {
                isScrollingRef.current = true;
                emblaApi.scrollTo(index);
                setTimeout(() => {
                    isScrollingRef.current = false;
                }, 500);
            }
        },
        [cards, emblaApi]
    );

    // Sync date strip when user scrolls the carousel
    useEffect(() => {
        if (!emblaApi) return;
        const onScroll = () => {
            if (isScrollingRef.current) return;
            const idx = emblaApi.selectedScrollSnap();
            const card = cards[idx];
            if (card?._dateKey) {
                const current = toDateKey(selectedDate);
                if (card._dateKey !== current) {
                    const [y, m, d] = card._dateKey.split("-").map(Number);
                    setSelectedDate(new Date(y, m - 1, d));
                }
            }
        };
        emblaApi.on("select", onScroll);
        return () => emblaApi.off("select", onScroll);
    }, [emblaApi, cards, selectedDate]);

    if (!experiences.length) return null;

    return (
        <section className="bg-black px-0 py-12 text-white md:py-16">
            <div className="mx-auto max-w-6xl px-6 md:px-10">
                <h2 className="text-center font-serif text-2xl leading-tight sm:text-3xl">
                    Upcoming experiences
                </h2>
                <p className="mt-2 text-center text-sm text-white/50">
                    {experiences.length} upcoming events
                </p>
            </div>

            {/* Date strip */}
            <div className="mt-6">
                <DayStrip
                    selectedDate={selectedDate}
                    onSelect={handleDateSelect}
                    eventDates={eventDates}
                />
            </div>

            {/* Horizontal cards carousel */}
            <div ref={emblaRef} className="mt-4 overflow-hidden px-6 sm:px-10">
                <div className="flex -ml-6 sm:-ml-10">
                    {cards.map((card, i) => {
                        const exp = card;
                        const hasImage = exp.coverPhotoUrl && exp.coverPhotoUrl.startsWith("http");
                        const activityLabel =
                            exp.activityType === "other"
                                ? exp.activityTypeOther || ""
                                : formatTag(exp.activityType || "");

                        // Date label for first card of each date group
                        const dateLabel = (() => {
                            if (!card._isFirstOfDate) return null;
                            const [y, m, d] = card._dateKey.split("-").map(Number);
                            const dt = new Date(y, m - 1, d);
                            const isToday = toDateKey(dt) === toDateKey(new Date());
                            return isToday
                                ? "Today"
                                : dt.toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                });
                        })();

                        return (
                            <div
                                key={`card-${exp.id}-${i}`}
                                className="flex shrink-0 flex-col pl-6 sm:pl-10 flex-[0_0_70vw] sm:flex-[0_0_360px] lg:flex-[0_0_380px]"
                            >
                                {/* Date label above first card of the day */}
                                {dateLabel ? (
                                    <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                                        {dateLabel}
                                    </span>
                                ) : (
                                    <span className="mb-2 h-4" aria-hidden="true" />
                                )}

                                <a
                                    href={exp.slug ? `/e/${exp.slug}` : "#"}
                                    className="group relative w-full overflow-hidden rounded-[6px] shadow-xl aspect-[3/4]"
                                    style={
                                        !hasImage
                                            ? {
                                                background:
                                                    "linear-gradient(145deg, #1a2a1a 0%, #0d1f0d 50%, #0a160a 100%)",
                                            }
                                            : undefined
                                    }
                                >
                                    {hasImage && (
                                        <Image
                                            src={exp.coverPhotoUrl}
                                            alt={exp.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 80vw, 420px"
                                        />
                                    )}

                                    {/* Title — top-left, large serif */}
                                    <div className="absolute left-6 top-6 right-6">
                                        <p className="font-serif leading-tight text-white drop-shadow text-[clamp(1.6rem,4.6vw,2.6rem)] sm:text-[clamp(2rem,3.2vw,2.8rem)]">
                                            {exp.title}
                                        </p>
                                        {activityLabel && (
                                            <p className="mt-1 text-xs text-white/50 drop-shadow">
                                                {formatDuration(exp.durationMinutes)}
                                                {activityLabel && ` · ${activityLabel}`}
                                            </p>
                                        )}
                                    </div>

                                    {/* Bottom — time pill + spots */}
                                    <div className="absolute bottom-2.5 left-6 right-6 flex items-center justify-between">
                                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-black shadow-md">
                                            {formatTime(exp.dateTime)}
                                        </span>
                                        <span className="text-xs text-white/60">
                                            {exp.spotsLeft}/{exp.groupSize} spots
                                        </span>
                                    </div>
                                </a>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default EventCalendarSection;
