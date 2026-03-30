"use client";

import { useState, useEffect, useCallback } from "react";
import { generateIcs, googleCalendarUrl } from "@/libs/calendar";
import StoryCardPreview from "@/components/StoryCardPreview";
import { getActivityDefaults } from "@/libs/activityDefaults";
import { formatPrice } from "@/libs/formatPrice";
import Map, { Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAuth } from "@/libs/useAuth";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const DIFFICULTY_LABELS = {
    easy: "Easy",
    moderate: "Moderate",
    hard: "Hard",
    strenuous: "Crazy",
};

export default function EventPageClient({ event, weather }) {
    const { user: authUser, loading: authLoading } = useAuth();
    const [rsvpState, setRsvpState] = useState("idle"); // idle | form | confirmed | maybe | waitlisted
    const [rsvpResponse, setRsvpResponse] = useState(null); // "going" | "maybe" | "cantgo"
    const [phone, setPhone] = useState("");
    const [countryCode, setCountryCode] = useState("+1");
    const [name, setName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [meetingPoint, setMeetingPoint] = useState(null);
    const [rsvpCount, setRsvpCount] = useState(0);
    const [maybeCount, setMaybeCount] = useState(0);
    const [attendeeNames, setAttendeeNames] = useState([]);
    const [detailsOpen, setDetailsOpen] = useState(false);

    // Common country codes
    const countryCodes = [
        { code: "+1", label: "US" },
        { code: "+1", label: "CA" },
        { code: "+44", label: "UK" },
        { code: "+61", label: "AU" },
        { code: "+64", label: "NZ" },
        { code: "+353", label: "IE" },
        { code: "+49", label: "DE" },
        { code: "+33", label: "FR" },
        { code: "+34", label: "ES" },
        { code: "+39", label: "IT" },
        { code: "+31", label: "NL" },
        { code: "+46", label: "SE" },
        { code: "+47", label: "NO" },
        { code: "+45", label: "DK" },
        { code: "+55", label: "BR" },
        { code: "+52", label: "MX" },
        { code: "+81", label: "JP" },
        { code: "+82", label: "KR" },
        { code: "+91", label: "IN" },
        { code: "+27", label: "ZA" },
    ];

    // Load current RSVP data
    useEffect(() => {
        async function loadPublicData() {
            try {
                const res = await fetch(`/api/event-page/${event.slug}`);
                const data = await res.json();
                if (data.rsvpCount !== undefined) setRsvpCount(data.rsvpCount);
                if (data.maybeCount !== undefined) setMaybeCount(data.maybeCount);
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
        } catch {
            // best-effort
        }
    }, []);

    const checkExistingRsvp = useCallback(async () => {
        try {
            const res = await fetch(`/api/rsvp?eventId=${event.id}`);
            const data = await res.json();
            if (data.found) {
                if (data.rsvp.status === "waitlisted") {
                    setRsvpState("waitlisted");
                } else if (data.rsvp.status === "maybe") {
                    setRsvpState("maybe");
                } else if (data.rsvp.status === "confirmed") {
                    setRsvpState("confirmed");
                }
                if (data.meetingPoint) setMeetingPoint(data.meetingPoint);
            }
        } catch (_err) {
            // Not critical
        }
    }, [event.id]);

    // Check existing RSVP when user is authenticated
    useEffect(() => {
        if (authUser) {
            setName(authUser.name || "");
            checkExistingRsvp();
        }
    }, [authUser, checkExistingRsvp]);

    async function handleRsvp(e) {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            if (!authUser) {
                window.location.href = `/signin?returnUrl=${encodeURIComponent(`/e/${event.slug}`)}`;
                return;
            }

            const rsvpStatus = rsvpResponse === "going" ? "confirmed"
                : rsvpResponse === "maybe" ? "maybe"
                    : "cancelled";

            const res = await fetch("/api/rsvp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    eventId: event.id,
                    status: rsvpStatus,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    window.location.href = `/signin?returnUrl=${encodeURIComponent(`/e/${event.slug}`)}`;
                    return;
                }
                if (res.status === 409) {
                    if (data.status === "waitlisted") setRsvpState("waitlisted");
                    else if (data.status === "maybe") setRsvpState("maybe");
                    else setRsvpState("confirmed");
                    if (data.meetingPoint) setMeetingPoint(data.meetingPoint);
                } else {
                    setError(data.error || "Something went wrong");
                }
                return;
            }

            if (rsvpStatus === "cancelled") {
                // Decrement the appropriate count based on previous state
                if (rsvpState === "confirmed") setRsvpCount((c) => Math.max(0, c - 1));
                if (rsvpState === "maybe") setMaybeCount((c) => Math.max(0, c - 1));
                setRsvpState("idle");
                setRsvpResponse(null);
                return;
            }

            if (data.rsvp?.status === "waitlisted") {
                setRsvpState("waitlisted");
            } else if (rsvpStatus === "maybe") {
                setRsvpState("maybe");
                setMaybeCount((c) => c + 1);
            } else {
                setRsvpState("confirmed");
                if (data.meetingPoint) setMeetingPoint(data.meetingPoint);
                setRsvpCount((c) => c + 1);
            }
        } catch (_err) {
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

    const formattedPrice = event.price > 0 ? formatPrice(event.price, event.currency) : "Free";

    function formatDuration(mins) {
        if (!mins) return "";
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        if (h === 0) return `${m} min`;
        if (m === 0) return `${h} hr`;
        return `${h} hr ${m} min`;
    }

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
                ? (getActivityDefaults(event.activityType)?.label || event.activityType.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
                : null;

    const inputClass =
        "w-full rounded-[5px] border border-white/35 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/60 outline-none focus:border-white/70";

    return (
        <div className="min-h-screen bg-black text-white">
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

                {/* Story Card Preview — compact 4:5 ratio with RSVP on card */}
                <div className="mb-4">
                    <StoryCardPreview
                        title={event.title}
                        dateTime={event.dateTime}
                        activityType={activityLabel}
                        groupSize={event.groupSize}
                        hostName={event.host?.name}
                        slug={event.slug}
                        published={true}
                        eventId={event.id}
                        coverPhotoUrl={event.coverPhotoUrl}
                        price={event.price}
                        hideDownload={true}
                        location={event.approximateLocation ? (meetingPoint?.description || "") : ""}
                        durationMinutes={event.durationMinutes}
                        currency={event.currency}
                        compact={true}
                    >
                        {/* RSVP button on card */}
                        {!isCancelled && rsvpState === "idle" && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!authUser) {
                                        window.location.href = `/signin?returnUrl=${encodeURIComponent(`/e/${event.slug}`)}`;
                                        return;
                                    }
                                    setRsvpResponse("going");
                                    setRsvpState("form");
                                }}
                                disabled={isFull}
                                className={`flex flex-col items-center gap-0.5 ${isFull ? "cursor-not-allowed opacity-30" : "hover:scale-110"} transition-transform`}
                            >
                                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/40 text-sm font-bold text-white backdrop-blur-md">
                                    R
                                </div>
                                <span className="text-[9px] font-medium text-white/70">
                                    {isFull ? "Full" : "RSVP"}
                                </span>
                            </button>
                        )}
                        {/* Show Going status on card */}
                        {rsvpState === "confirmed" && (
                            <div className="flex flex-col items-center gap-0.5">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-green-400/40 bg-green-500/20 text-sm font-bold text-green-400 backdrop-blur-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-[9px] font-medium text-green-400/70">Going</span>
                            </div>
                        )}
                    </StoryCardPreview>
                </div>

                {/* Host info */}
                {event.host && (
                    <div className="mb-4 flex items-center gap-3">
                        {event.host.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={event.host.photoUrl}
                                alt={event.host.name}
                                className="h-9 w-9 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-white/60">
                                {event.host?.name?.charAt(0)?.toUpperCase() || "H"}
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-medium text-white/90">
                                Hosted by {event.host.name}
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

                {/* Attendees — Partiful-style circles */}
                {(rsvpCount > 0 || maybeCount > 0) && (
                    <div className="mb-5">
                        <div className="flex items-center gap-3">
                            {/* Overlapping circles */}
                            <div className="flex -space-x-2">
                                {attendeeNames.slice(0, 6).map((name, i) => {
                                    const colors = [
                                        "bg-emerald-600", "bg-amber-600", "bg-sky-600",
                                        "bg-rose-600", "bg-violet-600", "bg-teal-600",
                                    ];
                                    return (
                                        <div
                                            key={i}
                                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-black text-xs font-semibold text-white ${colors[i % colors.length]}`}
                                            title={name}
                                        >
                                            {name.charAt(0).toUpperCase()}
                                        </div>
                                    );
                                })}
                                {attendeeNames.length > 6 && (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-white/20 text-[10px] font-medium text-white/80">
                                        +{attendeeNames.length - 6}
                                    </div>
                                )}
                            </div>
                            {/* Count text */}
                            <span className="text-sm text-white/60">
                                {rsvpCount} going
                                {maybeCount > 0 && ` · ${maybeCount} maybe`}
                                {spotsLeft !== null && spotsLeft > 0 && ` · ${spotsLeft} left`}
                                {spotsLeft !== null && spotsLeft <= 0 && " · Full"}
                            </span>
                        </div>
                    </div>
                )}

                {/* ── RSVP Modal Overlay ── */}
                {!isCancelled && rsvpState !== "idle" && rsvpState !== "confirmed" && (
                    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
                        <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl border border-white/15 bg-[#1a1917] p-6 sm:p-8 shadow-2xl">

                            {/* RSVP Form */}
                            {rsvpState === "form" && (
                                <form onSubmit={handleRsvp} className="space-y-3">
                                    <p className="mb-2 text-center text-sm text-white/60">
                                        {rsvpResponse === "going" ? "You're going!" : rsvpResponse === "maybe" ? "Maybe -- we'll save you a spot" : "Can't make it"}
                                    </p>
                                    {authUser && (
                                        <div className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3">
                                            <p className="text-sm text-white/90">{authUser.name || "Guest"}</p>
                                            <p className="text-xs text-white/50">{authUser.email}</p>
                                        </div>
                                    )}
                                    {error && (
                                        <p className="text-sm text-red-400">{error}</p>
                                    )}
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => { setRsvpState("idle"); setRsvpResponse(null); }}
                                            className="rounded-xl border border-white/25 px-4 py-4 text-sm text-white/60 hover:border-white hover:text-white"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className={`flex-1 rounded-xl py-4 text-base font-semibold transition-all ${!submitting
                                                ? "bg-white text-black hover:bg-white/90"
                                                : "cursor-not-allowed bg-white/15 text-white/30"
                                                }`}
                                        >
                                            {submitting ? "Saving..." : "Confirm"}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Confirmed */}
                            {rsvpState === "confirmed" && (
                                <div className="text-center">
                                    <h3 className="mt-2 font-serif text-xl italic text-white">
                                        You&apos;re in!
                                    </h3>
                                    <p className="mt-1 text-sm text-white/70">
                                        See you there!
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => { setRsvpState("confirmed"); setRsvpResponse(null); }}
                                        className="btn mt-4"
                                    >
                                        Done
                                    </button>
                                </div>
                            )}

                            {/* Maybe */}
                            {rsvpState === "maybe" && (
                                <div className="text-center">
                                    <h3 className="mt-2 font-serif text-xl italic text-white">
                                        Noted — maybe!
                                    </h3>
                                    <p className="mt-1 text-sm text-white/70">
                                        We&apos;ll keep a spot warm for you.
                                    </p>
                                    <button onClick={handleShare} className="btn mt-4">
                                        Share with a friend →
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setRsvpState("idle"); setRsvpResponse(null); }}
                                        className="mt-3 block w-full text-center text-sm text-white/40 hover:text-white/70"
                                    >
                                        Close
                                    </button>
                                </div>
                            )}

                            {/* Waitlisted */}
                            {rsvpState === "waitlisted" && (
                                <div className="text-center">
                                    <h3 className="mt-2 font-serif text-xl italic text-white">
                                        You&apos;re on the waitlist
                                    </h3>
                                    <p className="mt-1 text-sm text-white/70">
                                        We&apos;ll let you know if a spot opens up.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => { setRsvpState("idle"); setRsvpResponse(null); }}
                                        className="mt-3 block w-full text-center text-sm text-white/40 hover:text-white/70"
                                    >
                                        Close
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Weather forecast */}
                {weather && (
                    <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
                        <WeatherIcon type={weather.icon} />
                        <div className="flex-1">
                            <p className="text-sm text-white/80">{weather.description}</p>
                            <p className="text-xs text-white/50">
                                {weather.tempHigh}° / {weather.tempLow}°C
                                {weather.precipChance > 0 && ` -- ${weather.precipChance}% chance of rain`}
                            </p>
                        </div>
                    </div>
                )}

                {/* Details accordion — below RSVP */}
                <div className="mb-6">
                    <button
                        onClick={() => setDetailsOpen(!detailsOpen)}
                        className="w-full rounded-2xl border border-white/15 bg-white/5 p-4 text-left transition-colors hover:bg-white/[0.08]"
                    >
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/70">
                            {event.durationMinutes > 0 && (
                                <span>{formatDuration(event.durationMinutes)}</span>
                            )}
                            {event.price > 0 ? (
                                <span>{formattedPrice}</span>
                            ) : (
                                <span>Free</span>
                            )}
                            {event.difficulty && (
                                <span>{DIFFICULTY_LABELS[event.difficulty] || event.difficulty}</span>
                            )}
                        </div>
                        {event.description && (
                            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/50">
                                {event.description}
                            </p>
                        )}
                        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-white/40">
                            <span
                                className="inline-block transition-transform"
                                style={{ transform: detailsOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                            >
                                ▸
                            </span>
                            {detailsOpen ? "Hide details" : "Show all details"}
                        </div>
                    </button>

                    {detailsOpen && (
                        <div className="mt-4 space-y-3">
                            {formattedDate && (
                                <div className="flex items-center gap-2 text-white/80">
                                    <span className="text-sm">{formattedDate} at {formattedTime}</span>
                                </div>
                            )}
                            {event.durationMinutes > 0 && (
                                <div className="flex items-center gap-2 text-white/80">
                                    <span className="text-sm">{formatDuration(event.durationMinutes)}</span>
                                </div>
                            )}
                            {activityLabel && (
                                <div className="flex items-center gap-2 text-white/80">
                                    <span className="text-sm">{activityLabel}</span>
                                </div>
                            )}
                            {event.difficulty && (
                                <div className="flex items-center gap-2 text-white/80">
                                    <span className="text-sm">
                                        {DIFFICULTY_LABELS[event.difficulty] || event.difficulty}
                                    </span>
                                </div>
                            )}
                            {event.hasLocation && !meetingPoint && (
                                <div className="flex items-center gap-2 text-white/50">
                                    <span className="text-sm italic">
                                        Exact meeting point revealed after RSVP
                                    </span>
                                </div>
                            )}
                            {meetingPoint && (
                                <div className="flex items-center gap-2 text-white/80">
                                    <span className="text-sm">
                                        {meetingPoint.description || `${meetingPoint.lat}, ${meetingPoint.lng}`}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-white/80">
                                <span className="text-sm">
                                    {event.price > 0 ? (
                                        <>
                                            {formattedPrice}
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
                            {event.description && (
                                <div className="mt-2 border-t border-white/10 pt-3">
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/70">
                                        {event.description}
                                    </p>
                                </div>
                            )}
                            {event.whatToBring?.length > 0 && (
                                <div className="mt-2">
                                    <h3 className="mb-2 text-sm font-medium text-white/60">What to bring</h3>
                                    <ul className="space-y-1">
                                        {event.whatToBring.map((item, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-white/70">
                                                <span>• {item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {event.weatherPolicy && (
                                <div className="mt-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                                    <p className="text-sm text-white/80">
                                        <span className="font-medium text-white/90">Weather: </span>
                                        {event.weatherPolicy}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Location Map ── */}
                {event.approximateLocation && MAPBOX_TOKEN && (
                    <div className="mb-6">
                        <h3 className="mb-3 text-sm font-medium text-white/60">Location</h3>
                        <div className="overflow-hidden rounded-2xl border border-white/10">
                            <Map
                                initialViewState={{
                                    latitude: event.approximateLocation.lat,
                                    longitude: event.approximateLocation.lng,
                                    zoom: 13,
                                }}
                                style={{ width: "100%", height: 200 }}
                                mapStyle="mapbox://styles/mapbox/dark-v11"
                                mapboxAccessToken={MAPBOX_TOKEN}
                                interactive={false}
                                attributionControl={false}
                            >
                                <Marker
                                    latitude={event.approximateLocation.lat}
                                    longitude={event.approximateLocation.lng}
                                    anchor="bottom"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="white"
                                        className="h-7 w-7 drop-shadow-lg"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </Marker>
                            </Map>
                        </div>
                        {meetingPoint?.description && (
                            <p className="mt-2 text-xs text-white/50">
                                {meetingPoint.description}
                            </p>
                        )}
                        {!meetingPoint && (
                            <p className="mt-2 text-xs text-white/40 italic">
                                Approximate area — exact point shared after RSVP
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function WeatherIcon({ type }) {
    const icons = {
        sun: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-yellow-400">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
        ),
        "cloud-sun": (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-white/60">
                <circle cx="10" cy="8" r="3" />
                <path d="M10 2v1M3.93 4.93l.71.71M2 10h1M3.93 15.07l.71-.71M15.07 4.93l-.71.71" />
                <path d="M7 16a4 4 0 0 1 .68-7.96 5 5 0 0 1 9.64 1.21A3.5 3.5 0 0 1 17.5 16H7z" />
            </svg>
        ),
        cloud: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-white/50">
                <path d="M6.5 19a4.5 4.5 0 0 1-.42-8.98 7 7 0 0 1 13.42 2.48A4 4 0 0 1 19.5 19H6.5z" />
            </svg>
        ),
        "cloud-rain": (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-blue-400">
                <path d="M6.5 14a4.5 4.5 0 0 1-.42-8.98 7 7 0 0 1 13.42 2.48A4 4 0 0 1 19.5 14H6.5z" />
                <path d="M8 19v2M12 19v2M16 19v2" />
            </svg>
        ),
        "cloud-snow": (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-blue-200">
                <path d="M6.5 14a4.5 4.5 0 0 1-.42-8.98 7 7 0 0 1 13.42 2.48A4 4 0 0 1 19.5 14H6.5z" />
                <circle cx="8" cy="20" r="0.5" fill="currentColor" /><circle cx="12" cy="18" r="0.5" fill="currentColor" /><circle cx="16" cy="20" r="0.5" fill="currentColor" />
            </svg>
        ),
        "cloud-bolt": (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-yellow-300">
                <path d="M6.5 14a4.5 4.5 0 0 1-.42-8.98 7 7 0 0 1 13.42 2.48A4 4 0 0 1 19.5 14H6.5z" />
                <path d="M13 14l-2 4h3l-2 4" />
            </svg>
        ),
    };

    return icons[type] || icons.cloud;
}
