"use client";

import { useState, useEffect } from "react";
import { generateIcs, googleCalendarUrl } from "@/libs/calendar";

export default function EventPageClient({ event }) {
    const [rsvpState, setRsvpState] = useState("idle"); // idle | form | confirmed | waitlisted
    const [phone, setPhone] = useState("");
    const [name, setName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [meetingPoint, setMeetingPoint] = useState(null);
    const [rsvpCount, setRsvpCount] = useState(0);
    const [attendeeNames, setAttendeeNames] = useState([]);

    // Load current RSVP count
    useEffect(() => {
        async function loadPublicData() {
            try {
                const res = await fetch(`/api/event-page/${event.slug}`);
                const data = await res.json();
                if (data.rsvpCount !== undefined) setRsvpCount(data.rsvpCount);
                if (data.attendeeNames) setAttendeeNames(data.attendeeNames);
            } catch (err) {
                console.error("Failed to load event data:", err);
            }
        }
        loadPublicData();
    }, [event.slug]);

    // Check if returning user
    useEffect(() => {
        const savedPhone = localStorage.getItem("nc_phone");
        const savedName = localStorage.getItem("nc_name");
        if (savedPhone) {
            setPhone(savedPhone);
            if (savedName) setName(savedName);
            // Check existing RSVP
            checkExistingRsvp(savedPhone);
        }
    }, []);

    async function checkExistingRsvp(phoneNum) {
        try {
            const res = await fetch(
                `/api/rsvp?eventId=${event.id}&phone=${encodeURIComponent(phoneNum)}`
            );
            const data = await res.json();
            if (data.found) {
                setRsvpState(data.rsvp.status === "waitlisted" ? "waitlisted" : "confirmed");
                if (data.meetingPoint) setMeetingPoint(data.meetingPoint);
            }
        } catch (err) {
            // Not a critical error
        }
    }

    async function handleRsvp(e) {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            const res = await fetch("/api/rsvp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    eventId: event.id,
                    participantName: name,
                    participantPhone: phone,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 409) {
                    // Already RSVP'd
                    setRsvpState(data.status === "waitlisted" ? "waitlisted" : "confirmed");
                    if (data.rsvp?.meetingPoint) setMeetingPoint(data.rsvp.meetingPoint);
                } else {
                    setError(data.error || "Something went wrong");
                }
                return;
            }

            // Save for returning user recognition
            localStorage.setItem("nc_phone", phone);
            localStorage.setItem("nc_name", name);

            if (data.rsvp.status === "waitlisted") {
                setRsvpState("waitlisted");
            } else {
                setRsvpState("confirmed");
                if (data.meetingPoint) setMeetingPoint(data.meetingPoint);
                setRsvpCount((c) => c + 1);
            }
        } catch (err) {
            setError("Network error — please try again");
        } finally {
            setSubmitting(false);
        }
    }

    function handleShare() {
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({ title: event.title, url });
        } else {
            navigator.clipboard.writeText(url);
        }
    }

    function handleCalendar(type) {
        const calData = {
            title: event.title,
            dateTime: event.dateTime,
            durationMinutes: event.durationMinutes,
            location: meetingPoint?.description || "",
            description: event.description || "",
            url: window.location.href,
        };

        if (type === "google") {
            window.open(googleCalendarUrl(calData), "_blank");
        } else {
            const ics = generateIcs(calData);
            const blob = new Blob([ics], { type: "text/calendar" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${event.slug}.ics`;
            a.click();
            URL.revokeObjectURL(url);
        }
    }

    const isCancelled = event.status === "cancelled";
    const isFull = event.groupSize && rsvpCount >= event.groupSize;
    const spotsLeft = event.groupSize ? event.groupSize - rsvpCount : null;

    const formattedDate = event.dateTime
        ? new Date(event.dateTime).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
        })
        : null;

    const formattedTime = event.dateTime
        ? new Date(event.dateTime).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        })
        : null;

    const activityLabel =
        event.activityType === "other"
            ? event.activityTypeOther
            : event.activityType
                ? event.activityType.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                : null;

    return (
        <div className="min-h-screen bg-[#f8f6f3]">
            {/* Cover Photo */}
            {event.coverPhotoUrl && (
                <div className="relative h-56 sm:h-72">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={event.coverPhotoUrl}
                        alt={event.title}
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
            )}

            <div className="mx-auto max-w-lg px-5 py-8">
                {/* Cancelled banner */}
                {isCancelled && (
                    <div className="mb-6 rounded-xl bg-red-50 p-4 text-center">
                        <p className="font-medium text-red-700">This event has been cancelled</p>
                        {event.cancelledReason && (
                            <p className="mt-1 text-sm text-red-600">{event.cancelledReason}</p>
                        )}
                    </div>
                )}

                {/* Title */}
                <h1 className="mb-2 font-serif text-3xl font-bold text-stone-800 sm:text-4xl">
                    {event.title}
                </h1>

                {/* Facilitator */}
                {event.facilitator && (
                    <div className="mb-6 flex items-center gap-3">
                        {event.facilitator.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={event.facilitator.photoUrl}
                                alt={event.facilitator.name}
                                className="h-10 w-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-200 text-lg">
                                🌿
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-medium text-stone-700">
                                {event.facilitator.name}
                            </p>
                            {event.facilitator.username && (
                                <a
                                    href={`/@${event.facilitator.username}`}
                                    className="text-xs text-stone-500 hover:underline"
                                >
                                    @{event.facilitator.username}
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Key details */}
                <div className="mb-6 space-y-2">
                    {formattedDate && (
                        <div className="flex items-center gap-2 text-stone-700">
                            <span className="w-5 text-center">📅</span>
                            <span className="text-sm">
                                {formattedDate} at {formattedTime}
                            </span>
                        </div>
                    )}
                    {activityLabel && (
                        <div className="flex items-center gap-2 text-stone-700">
                            <span className="w-5 text-center">🥾</span>
                            <span className="text-sm">{activityLabel}</span>
                        </div>
                    )}
                    {event.difficulty && (
                        <div className="flex items-center gap-2 text-stone-700">
                            <span className="w-5 text-center">📊</span>
                            <span className="text-sm capitalize">{event.difficulty}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-stone-700">
                        <span className="w-5 text-center">👥</span>
                        <span className="text-sm">
                            {rsvpCount} going
                            {spotsLeft !== null && ` · ${spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"}`}
                        </span>
                    </div>
                    {event.durationMinutes && (
                        <div className="flex items-center gap-2 text-stone-700">
                            <span className="w-5 text-center">⏱</span>
                            <span className="text-sm">
                                {event.durationMinutes >= 60
                                    ? `${Math.floor(event.durationMinutes / 60)}h${event.durationMinutes % 60 ? ` ${event.durationMinutes % 60}m` : ""}`
                                    : `${event.durationMinutes}m`}
                            </span>
                        </div>
                    )}
                    {event.hasLocation && !meetingPoint && (
                        <div className="flex items-center gap-2 text-stone-500">
                            <span className="w-5 text-center">📍</span>
                            <span className="text-sm italic">
                                Exact meeting point revealed after RSVP
                            </span>
                        </div>
                    )}
                    {meetingPoint && (
                        <div className="flex items-center gap-2 text-stone-700">
                            <span className="w-5 text-center">📍</span>
                            <span className="text-sm">
                                {meetingPoint.description || `${meetingPoint.lat}, ${meetingPoint.lng}`}
                            </span>
                        </div>
                    )}
                    {event.price > 0 && (
                        <div className="flex items-center gap-2 text-stone-700">
                            <span className="w-5 text-center">💵</span>
                            <span className="text-sm">
                                ${event.price}
                                {event.priceLink && (
                                    <>
                                        {" · "}
                                        <a
                                            href={event.priceLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-emerald-600 hover:underline"
                                        >
                                            Pay here
                                        </a>
                                    </>
                                )}
                            </span>
                        </div>
                    )}
                </div>

                {/* Description */}
                {event.description && (
                    <div className="mb-6">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-600">
                            {event.description}
                        </p>
                    </div>
                )}

                {/* What to Bring */}
                {event.whatToBring?.length > 0 && (
                    <div className="mb-6">
                        <h3 className="mb-2 text-sm font-medium text-stone-700">
                            What to bring
                        </h3>
                        <ul className="space-y-1">
                            {event.whatToBring.map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-stone-600">
                                    <span>☐</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Weather Policy */}
                {event.weatherPolicy && (
                    <div className="mb-6 rounded-lg bg-sky-50 px-4 py-3">
                        <p className="text-sm text-sky-700">
                            <span className="font-medium">Weather: </span>
                            {event.weatherPolicy}
                        </p>
                    </div>
                )}

                {/* Accessibility */}
                {event.accessibilityNotes && (
                    <div className="mb-6 rounded-lg bg-stone-100 px-4 py-3">
                        <p className="text-sm text-stone-600">
                            <span className="font-medium">Accessibility: </span>
                            {event.accessibilityNotes}
                        </p>
                    </div>
                )}

                {/* RSVP Section */}
                {!isCancelled && (
                    <div className="mt-8">
                        {rsvpState === "idle" && (
                            <button
                                onClick={() => setRsvpState("form")}
                                disabled={isFull}
                                className="w-full rounded-2xl bg-stone-800 py-4 text-lg font-semibold text-white transition-all hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {isFull ? "Full — Join waitlist" : "I'm in 🌱"}
                            </button>
                        )}

                        {rsvpState === "form" && (
                            <form onSubmit={handleRsvp} className="space-y-3">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    required
                                    maxLength={50}
                                    className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-800 placeholder-stone-400"
                                />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Phone number"
                                    required
                                    className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-800 placeholder-stone-400"
                                />
                                {error && (
                                    <p className="text-sm text-red-600">{error}</p>
                                )}
                                <button
                                    type="submit"
                                    disabled={submitting || !name.trim() || !phone.trim()}
                                    className="w-full rounded-2xl bg-stone-800 py-4 text-lg font-semibold text-white transition-all hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {submitting
                                        ? "Saving..."
                                        : isFull
                                            ? "Join waitlist"
                                            : "I'm in 🌱"}
                                </button>
                            </form>
                        )}

                        {rsvpState === "confirmed" && (
                            <div className="rounded-2xl bg-emerald-50 p-6 text-center">
                                <p className="text-3xl">🌿</p>
                                <h3 className="mt-2 font-serif text-xl font-bold text-emerald-800">
                                    You&apos;re in!
                                </h3>
                                <p className="mt-1 text-sm text-emerald-600">
                                    See you there. Here&apos;s what you need to know:
                                </p>

                                {/* Calendar buttons */}
                                {event.dateTime && (
                                    <div className="mt-4 flex gap-2 justify-center">
                                        <button
                                            onClick={() => handleCalendar("google")}
                                            className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-stone-700 shadow-sm hover:bg-stone-50"
                                        >
                                            📅 Google Calendar
                                        </button>
                                        <button
                                            onClick={() => handleCalendar("ics")}
                                            className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-stone-700 shadow-sm hover:bg-stone-50"
                                        >
                                            📅 Download .ics
                                        </button>
                                    </div>
                                )}

                                {/* Who's going */}
                                {attendeeNames.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-xs text-stone-500">
                                            {attendeeNames.slice(0, 5).join(", ")}
                                            {attendeeNames.length > 5
                                                ? ` + ${attendeeNames.length - 5} more`
                                                : ""}{" "}
                                            going
                                        </p>
                                    </div>
                                )}

                                {/* Share */}
                                <button
                                    onClick={handleShare}
                                    className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50"
                                >
                                    Bring a friend →
                                </button>
                            </div>
                        )}

                        {rsvpState === "waitlisted" && (
                            <div className="rounded-2xl bg-amber-50 p-6 text-center">
                                <p className="text-3xl">⏳</p>
                                <h3 className="mt-2 font-serif text-xl font-bold text-amber-800">
                                    You&apos;re on the waitlist
                                </h3>
                                <p className="mt-1 text-sm text-amber-600">
                                    We&apos;ll let you know if a spot opens up.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
