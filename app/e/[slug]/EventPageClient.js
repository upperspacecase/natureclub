"use client";

import { useState, useEffect } from "react";
import { generateIcs, googleCalendarUrl } from "@/libs/calendar";

export default function EventPageClient({ event }) {
    const [rsvpState, setRsvpState] = useState("idle"); // idle | form | confirmed | waitlisted
    const [phone, setPhone] = useState("");
    const [countryCode, setCountryCode] = useState("+1");
    const [name, setName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [meetingPoint, setMeetingPoint] = useState(null);
    const [rsvpCount, setRsvpCount] = useState(0);
    const [attendeeNames, setAttendeeNames] = useState([]);

    // Common country codes — ordered by likely usage
    const countryCodes = [
        { code: "+1", flag: "🇺🇸", label: "US" },
        { code: "+1", flag: "🇨🇦", label: "CA" },
        { code: "+44", flag: "🇬🇧", label: "UK" },
        { code: "+61", flag: "🇦🇺", label: "AU" },
        { code: "+64", flag: "🇳🇿", label: "NZ" },
        { code: "+353", flag: "🇮🇪", label: "IE" },
        { code: "+49", flag: "🇩🇪", label: "DE" },
        { code: "+33", flag: "🇫🇷", label: "FR" },
        { code: "+34", flag: "🇪🇸", label: "ES" },
        { code: "+39", flag: "🇮🇹", label: "IT" },
        { code: "+31", flag: "🇳🇱", label: "NL" },
        { code: "+46", flag: "🇸🇪", label: "SE" },
        { code: "+47", flag: "🇳🇴", label: "NO" },
        { code: "+45", flag: "🇩🇰", label: "DK" },
        { code: "+55", flag: "🇧🇷", label: "BR" },
        { code: "+52", flag: "🇲🇽", label: "MX" },
        { code: "+81", flag: "🇯🇵", label: "JP" },
        { code: "+82", flag: "🇰🇷", label: "KR" },
        { code: "+91", flag: "🇮🇳", label: "IN" },
        { code: "+27", flag: "🇿🇦", label: "ZA" },
    ];

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

    // Detect user timezone and set default country code
    useEffect(() => {
        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
            const tzCountryMap = {
                "America/": "+1", "US/": "+1", "Canada/": "+1",
                "Europe/London": "+44", "GB": "+44",
                "Australia/": "+61",
                "Pacific/Auckland": "+64",
                "Europe/Dublin": "+353",
                "Europe/Berlin": "+49",
                "Europe/Paris": "+33",
                "Europe/Madrid": "+34",
                "Europe/Rome": "+39",
                "Europe/Amsterdam": "+31",
                "Europe/Stockholm": "+46",
                "Europe/Oslo": "+47",
                "Europe/Copenhagen": "+45",
                "America/Sao_Paulo": "+55",
                "America/Mexico_City": "+52",
                "Asia/Tokyo": "+81",
                "Asia/Seoul": "+82",
                "Asia/Kolkata": "+91", "Asia/Calcutta": "+91",
                "Africa/Johannesburg": "+27",
            };
            for (const [prefix, code] of Object.entries(tzCountryMap)) {
                if (tz.startsWith(prefix) || tz === prefix) {
                    setCountryCode(code);
                    break;
                }
            }
        } catch { }
    }, []);

    // Check if returning user
    useEffect(() => {
        const savedPhone = localStorage.getItem("nc_phone");
        const savedName = localStorage.getItem("nc_name");
        if (savedPhone) {
            setPhone(savedPhone.replace(/^\+\d+/, ""));  // strip country code if stored
            if (savedName) setName(savedName);
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
            const fullPhone = phone.startsWith("+") ? phone : `${countryCode}${phone.replace(/^0+/, "")}`;

            const res = await fetch("/api/rsvp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    eventId: event.id,
                    participantName: name,
                    participantPhone: fullPhone,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 409) {
                    setRsvpState(data.status === "waitlisted" ? "waitlisted" : "confirmed");
                    if (data.rsvp?.meetingPoint) setMeetingPoint(data.rsvp.meetingPoint);
                } else {
                    setError(data.error || "Something went wrong");
                }
                return;
            }

            localStorage.setItem("nc_phone", fullPhone);
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

    const inputClass =
        "w-full rounded-[5px] border border-white/35 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/60 outline-none focus:border-white/70";

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Cover Photo */}
            {event.coverPhotoUrl && (
                <div className="relative h-56 sm:h-72">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={event.coverPhotoUrl}
                        alt={event.title}
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                </div>
            )}

            <div className="mx-auto max-w-lg px-5 py-8">
                {/* Cancelled banner */}
                {isCancelled && (
                    <div className="mb-6 rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-center backdrop-blur-sm">
                        <p className="font-medium text-red-300">This event has been cancelled</p>
                        {event.cancelledReason && (
                            <p className="mt-1 text-sm text-red-300/80">{event.cancelledReason}</p>
                        )}
                    </div>
                )}

                {/* Title */}
                <h1 className="mb-2 font-serif text-3xl italic text-white sm:text-4xl">
                    {event.title}
                </h1>

                {/* Facilitator */}
                {event.host && (
                    <div className="mb-6 flex items-center gap-3">
                        {event.host.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={event.host.photoUrl}
                                alt={event.host.name}
                                className="h-10 w-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg">
                                🌿
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-medium text-white/90">
                                {event.host.name}
                            </p>
                            {event.host.username && (
                                <a
                                    href={`/@${event.host.username}`}
                                    className="text-xs text-white/50 hover:text-white hover:underline"
                                >
                                    @{event.host.username}
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Key details */}
                <div className="mb-6 space-y-2">
                    {formattedDate && (
                        <div className="flex items-center gap-2 text-white/80">
                            <span className="w-5 text-center">📅</span>
                            <span className="text-sm">
                                {formattedDate} at {formattedTime}
                            </span>
                        </div>
                    )}
                    {activityLabel && (
                        <div className="flex items-center gap-2 text-white/80">
                            <span className="w-5 text-center">🥾</span>
                            <span className="text-sm">{activityLabel}</span>
                        </div>
                    )}
                    {event.difficulty && (
                        <div className="flex items-center gap-2 text-white/80">
                            <span className="w-5 text-center">📊</span>
                            <span className="text-sm capitalize">{event.difficulty}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-white/80">
                        <span className="w-5 text-center">👥</span>
                        <span className="text-sm">
                            {rsvpCount} going
                            {spotsLeft !== null && ` · ${spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"}`}
                        </span>
                    </div>
                    {event.durationMinutes && (
                        <div className="flex items-center gap-2 text-white/80">
                            <span className="w-5 text-center">⏱</span>
                            <span className="text-sm">
                                {event.durationMinutes >= 60
                                    ? `${Math.floor(event.durationMinutes / 60)}h${event.durationMinutes % 60 ? ` ${event.durationMinutes % 60}m` : ""}`
                                    : `${event.durationMinutes}m`}
                            </span>
                        </div>
                    )}
                    {event.hasLocation && !meetingPoint && (
                        <div className="flex items-center gap-2 text-white/50">
                            <span className="w-5 text-center">📍</span>
                            <span className="text-sm italic">
                                Exact meeting point revealed after RSVP
                            </span>
                        </div>
                    )}
                    {meetingPoint && (
                        <div className="flex items-center gap-2 text-white/80">
                            <span className="w-5 text-center">📍</span>
                            <span className="text-sm">
                                {meetingPoint.description || `${meetingPoint.lat}, ${meetingPoint.lng}`}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-white/80">
                        <span className="w-5 text-center">💵</span>
                        <span className="text-sm">
                            {event.price > 0 ? (
                                <>
                                    ${event.price}
                                    {event.priceLink && (
                                        <>
                                            {" · "}
                                            <a
                                                href={event.priceLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-white hover:underline"
                                            >
                                                Pay here
                                            </a>
                                        </>
                                    )}
                                </>
                            ) : (
                                "Free"
                            )}
                        </span>
                    </div>
                </div>

                {/* Description */}
                {event.description && (
                    <div className="mb-6">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/70">
                            {event.description}
                        </p>
                    </div>
                )}

                {/* What to Bring */}
                {event.whatToBring?.length > 0 && (
                    <div className="mb-6">
                        <h3 className="mb-2 text-sm font-medium text-white/60">
                            What to bring
                        </h3>
                        <ul className="space-y-1">
                            {event.whatToBring.map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-white/70">
                                    <span>☐</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Weather Policy */}
                {event.weatherPolicy && (
                    <div className="mb-6 rounded-3xl border border-white/15 bg-white/10 px-5 py-3 backdrop-blur-sm">
                        <p className="text-sm text-white/80">
                            <span className="font-medium text-white/90">Weather: </span>
                            {event.weatherPolicy}
                        </p>
                    </div>
                )}

                {/* Accessibility */}
                {event.accessibilityNotes && (
                    <div className="mb-6 rounded-3xl border border-white/15 bg-white/10 px-5 py-3 backdrop-blur-sm">
                        <p className="text-sm text-white/80">
                            <span className="font-medium text-white/90">Accessibility: </span>
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
                                className="btn w-full py-4 text-lg font-semibold disabled:cursor-not-allowed disabled:opacity-40"
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
                                    className={inputClass}
                                />
                                <div className="flex gap-2">
                                    <select
                                        value={countryCode}
                                        onChange={(e) => setCountryCode(e.target.value)}
                                        className="w-[90px] shrink-0 rounded-[5px] border border-white/35 bg-white/[0.04] px-2 py-3 text-sm text-white outline-none focus:border-white/70"
                                    >
                                        {countryCodes.map((c, i) => (
                                            <option key={`${c.code}-${c.label}-${i}`} value={c.code}>
                                                {c.flag} {c.code}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="Phone number"
                                        required
                                        className={`flex-1 ${inputClass}`}
                                    />
                                </div>
                                {error && (
                                    <p className="text-sm text-red-400">{error}</p>
                                )}
                                <button
                                    type="submit"
                                    disabled={submitting || !name.trim() || !phone.trim()}
                                    className="btn w-full py-4 text-lg font-semibold disabled:cursor-not-allowed disabled:opacity-40"
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
                            <div className="rounded-3xl border border-white/15 bg-white/10 p-6 text-center backdrop-blur-sm">
                                <p className="text-3xl">🌿</p>
                                <h3 className="mt-2 font-serif text-xl italic text-white">
                                    You&apos;re in!
                                </h3>
                                <p className="mt-1 text-sm text-white/70">
                                    See you there. Here&apos;s what you need to know:
                                </p>

                                {/* Calendar buttons */}
                                {event.dateTime && (
                                    <div className="mt-4 flex gap-2 justify-center">
                                        <button
                                            onClick={() => handleCalendar("google")}
                                            className="rounded-[5px] border border-white/30 bg-white/10 px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/20"
                                        >
                                            📅 Google Calendar
                                        </button>
                                        <button
                                            onClick={() => handleCalendar("ics")}
                                            className="rounded-[5px] border border-white/30 bg-white/10 px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/20"
                                        >
                                            📅 Download .ics
                                        </button>
                                    </div>
                                )}

                                {/* Who's going */}
                                {attendeeNames.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-xs text-white/50">
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
                                    className="btn mt-4"
                                >
                                    Bring a friend →
                                </button>
                            </div>
                        )}

                        {rsvpState === "waitlisted" && (
                            <div className="rounded-3xl border border-white/15 bg-white/10 p-6 text-center backdrop-blur-sm">
                                <p className="text-3xl">⏳</p>
                                <h3 className="mt-2 font-serif text-xl italic text-white">
                                    You&apos;re on the waitlist
                                </h3>
                                <p className="mt-1 text-sm text-white/70">
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
