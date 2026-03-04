"use client";

import { useRef, useEffect } from "react";

/**
 * Horizontal scrollable date strip — extends to cover all event dates.
 *
 * Props:
 *  - selectedDate : Date (default: today)
 *  - onSelect     : (date: Date) => void
 *  - eventDates   : Set<string> — set of YYYY-MM-DD strings that have events
 */
export default function DayStrip({ selectedDate, onSelect, eventDates }) {
    const scrollRef = useRef(null);
    const todayRef = useRef(null);

    const days = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Determine how many days to show: at least 30, or until the last event + 7 days
    let totalDays = 30;
    if (eventDates?.size) {
        const sorted = [...eventDates].sort();
        const lastEventDate = new Date(sorted[sorted.length - 1] + "T00:00:00");
        const diffMs = lastEventDate - now;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 7;
        if (diffDays > totalDays) totalDays = diffDays;
    }

    for (let i = 0; i < totalDays; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() + i);
        d.setHours(0, 0, 0, 0);
        days.push(d);
    }

    const toKey = (d) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    const selectedKey = toKey(selectedDate);

    // Scroll to today on mount
    useEffect(() => {
        if (todayRef.current && scrollRef.current) {
            todayRef.current.scrollIntoView({
                behavior: "instant",
                inline: "center",
                block: "nearest",
            });
        }
    }, []);

    const weekday = (d) =>
        d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();

    return (
        <div
            ref={scrollRef}
            className="no-scrollbar flex gap-1.5 overflow-x-auto px-3 py-2"
            style={{ WebkitOverflowScrolling: "touch" }}
        >
            {days.map((day, i) => {
                const key = toKey(day);
                const isSelected = key === selectedKey;
                const isToday = i === 0;
                const hasEvents = eventDates?.has(key);

                return (
                    <button
                        key={key}
                        ref={isToday ? todayRef : null}
                        onClick={() => onSelect(day)}
                        className={`relative flex shrink-0 flex-col items-center rounded-xl px-3 py-2 transition-all ${isSelected
                            ? "bg-white text-black shadow-lg"
                            : "bg-white/10 text-white/60 hover:bg-white/15"
                            }`}
                        style={{ minWidth: 52 }}
                    >
                        <span
                            className={`text-[10px] font-semibold tracking-wider ${isSelected ? "text-black/60" : ""
                                }`}
                        >
                            {isToday ? "TODAY" : weekday(day)}
                        </span>
                        <span
                            className={`text-lg font-bold leading-tight ${isSelected ? "text-black" : "text-white"
                                }`}
                        >
                            {day.getDate()}
                        </span>
                        {/* Event indicator dot */}
                        {hasEvents && (
                            <span
                                className={`mt-0.5 h-1 w-1 rounded-full ${isSelected ? "bg-black/40" : "bg-green-400"
                                    }`}
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
