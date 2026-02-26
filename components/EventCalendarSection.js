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

    // Build flat card array: [date-header, card, card, date-header, card, ...]
    const cards = useMemo(() => {
        const sorted = Object.keys(eventsByDate).sort();
        const result = [];
        sorted.forEach((dateKey) => {
            result.push({ _type: "date-header", dateKey });
            eventsByDate[dateKey].forEach((exp) => {
                result.push({ ...exp, _type: "event", _dateKey: dateKey });
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
                (c) => c._type === "date-header" && c.dateKey === key
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
            // Find the nearest date-header at or before the current index
            for (let i = idx; i >= 0; i--) {
                if (cards[i]?._type === "date-header") {
                    const key = cards[i].dateKey;
                    const current = toDateKey(selectedDate);
                    if (key !== current) {
                        const [y, m, d] = key.split("-").map(Number);
                        setSelectedDate(new Date(y, m - 1, d));
                    }
                    break;
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
                    {experiences.length} events in the next 2 weeks
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
                <div className="flex -ml-4">
                    {cards.map((card, i) => {
                        if (card._type === "date-header") {
                            const [y, m, d] = card.dateKey.split("-").map(Number);
                            const dt = new Date(y, m - 1, d);
                            const isToday =
                                toDateKey(dt) === toDateKey(new Date());
                            const label = isToday
                                ? "Today"
                                : dt.toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                });

                            return (
                                <div
                                    key={`header-${card.dateKey}`}
                                    className="flex shrink-0 items-center pl-4"
                                    style={{ minWidth: 80 }}
                                >
                                    <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-white/40">
                                        {label}
                                    </span>
                                </div>
                            );
                        }

                        const exp = card;
                        const hasImage = exp.coverPhotoUrl && exp.coverPhotoUrl.startsWith("http");
                        const activityLabel =
                            exp.activityType === "other"
                                ? exp.activityTypeOther || ""
                                : formatTag(exp.activityType || "");

                        return (
                            <div
                                key={`card-${exp.id}-${i}`}
                                className="flex shrink-0 pl-4 flex-[0_0_260px] sm:flex-[0_0_280px]"
                            >
                                <a
                                    href={exp.slug ? `/e/${exp.slug}` : "#"}
                                    className="group relative w-full overflow-hidden rounded-xl bg-base-200/40 shadow-lg aspect-[4/3]"
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
                                            sizes="280px"
                                        />
                                    )}

                                    {/* Title */}
                                    <div className="absolute left-4 top-3 right-4">
                                        <p className="font-serif text-base leading-tight text-white drop-shadow sm:text-lg">
                                            {exp.title}
                                        </p>
                                        {activityLabel && (
                                            <p className="mt-0.5 text-[10px] text-white/50">
                                                {formatDuration(exp.durationMinutes)}
                                                {activityLabel && ` · ${activityLabel}`}
                                            </p>
                                        )}
                                    </div>

                                    {/* Time badge + spots */}
                                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-black shadow-md">
                                            {formatTime(exp.dateTime)}
                                        </span>
                                        <span className="text-[10px] text-white/50">
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
