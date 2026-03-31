"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/libs/api";
import NavMenu from "@/components/home/NavMenu";

export default function FacilitatorEventsPage() {
    const router = useRouter();
    const [events, setEvents] = useState([]);
    const [attending, setAttending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [menuOpen, setMenuOpen] = useState(null); // event id for overflow menu
    const [duplicating, setDuplicating] = useState(null);

    useEffect(() => {
        loadEvents();
        loadAttending();
        loadProfile();
    }, []);

    async function loadEvents() {
        try {
            const res = await apiClient.get("/events/list");
            setEvents(res.events || []);
        } catch (_err) {
            console.error("Failed to load events:", _err);
        } finally {
            setLoading(false);
        }
    }

    async function loadAttending() {
        try {
            const res = await apiClient.get("/rsvp/my-events");
            setAttending(res.events || []);
        } catch (_err) {
            console.error("Failed to load attending:", _err);
        }
    }

    async function loadProfile() {
        try {
            const res = await apiClient.get("/user");
            setProfile(res);
        } catch (_err) {
            console.error("Failed to load profile:", _err);
        }
    }

    async function duplicateEvent(eventId) {
        setDuplicating(eventId);
        try {
            const res = await apiClient.post(`/events/${eventId}/duplicate`);
            if (res.id) {
                router.push(`/events/new?id=${res.id}`);
            }
        } catch (_err) {
            console.error("Duplicate failed:", _err);
        } finally {
            setDuplicating(null);
        }
    }

    async function rainCheck(eventId, action, data = {}) {
        try {
            await apiClient.post(`/events/${eventId}/raincheck`, { action, ...data });
            await loadEvents();
            setMenuOpen(null);
        } catch (_err) {
            console.error("Rain check failed:", _err);
        }
    }

    async function deleteEvent(eventId) {
        if (!confirm("Delete this event permanently? This cannot be undone.")) return;
        try {
            await apiClient.delete(`/events/${eventId}`);
            setEvents((prev) => prev.filter((e) => (e.id || e._id) !== eventId));
            setMenuOpen(null);
        } catch (_err) {
            console.error("Delete failed:", _err);
        }
    }

    const now = new Date();

    // Sort: upcoming published first, then drafts, then past, then cancelled
    const sorted = [...events].sort((a, b) => {
        const order = { published: 0, draft: 1, cancelled: 2 };
        const aUpcoming = a.status === "published" && (!a.dateTime || new Date(a.dateTime) >= now);
        const bUpcoming = b.status === "published" && (!b.dateTime || new Date(b.dateTime) >= now);
        if (aUpcoming && !bUpcoming) return -1;
        if (!aUpcoming && bUpcoming) return 1;
        const oa = order[a.status] ?? 3;
        const ob = order[b.status] ?? 3;
        if (oa !== ob) return oa - ob;
        return new Date(b.dateTime || 0) - new Date(a.dateTime || 0);
    });

    function formatDate(dateStr) {
        if (!dateStr) return "Date TBA";
        return new Date(dateStr).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    }

    function statusBadge(event) {
        if (event.status === "draft") {
            return (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/50">
                    Draft
                </span>
            );
        }
        if (event.status === "cancelled") {
            return (
                <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-400/70">
                    Cancelled
                </span>
            );
        }
        if (event.dateTime && new Date(event.dateTime) < now) {
            return (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/40">
                    Past
                </span>
            );
        }
        return null;
    }

    return (
        <div className="relative mx-auto h-[100dvh] w-full max-w-[430px] overflow-y-auto overflow-x-hidden bg-black text-white">
            <div className="px-4 py-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="font-serif text-2xl italic text-white">
                        Your Events
                    </h1>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push("/events/new")}
                            className="btn"
                        >
                            + New Event
                        </button>
                    </div>
                </div>

                {/* Event List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <span className="text-white/40">Loading...</span>
                    </div>
                ) : sorted.length === 0 ? (
                    <div className="rounded-3xl border border-white/15 bg-white/10 p-10 text-center backdrop-blur-sm">
                        <p className="text-lg font-medium text-white/40">No events</p>
                        <p className="mt-3 text-sm text-white/60">
                            No events yet — create your first one!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sorted.map((event) => {
                            const eid = event.id || event._id;
                            return (
                                <div
                                    key={eid}
                                    className="relative overflow-hidden rounded-[6px] border border-white/15 bg-white/10 backdrop-blur-sm"
                                >
                                    <button
                                        onClick={() =>
                                            event.status === "draft"
                                                ? router.push(`/events/new?id=${eid}`)
                                                : event.slug
                                                    ? router.push(`/events/new?id=${eid}&view=share`)
                                                    : null
                                        }
                                        className="flex w-full items-center gap-4 p-4 text-left"
                                    >
                                        {/* Thumbnail */}
                                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-[6px] bg-white/10">
                                            {event.coverPhotoUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={event.coverPhotoUrl}
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-sm font-medium text-white/40">
                                                    NC
                                                </div>
                                            )}
                                        </div>
                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-serif font-medium text-white truncate">
                                                    {event.title || "Untitled"}
                                                </h3>
                                                {statusBadge(event)}
                                            </div>
                                            <p className="text-sm text-white/60">
                                                {formatDate(event.dateTime)}
                                            </p>
                                        </div>
                                        {/* RSVP count */}
                                        <div className="flex-shrink-0 text-right">
                                            <span className="text-sm font-medium text-white">
                                                {event.rsvpCount || 0}/{event.groupSize}
                                            </span>
                                            <p className="text-xs text-white/40">spots</p>
                                        </div>
                                    </button>

                                    {/* Overflow menu trigger */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setMenuOpen(menuOpen === eid ? null : eid);
                                        }}
                                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white/70"
                                    >
                                        ⋯
                                    </button>

                                    {/* Overflow menu dropdown */}
                                    {menuOpen === eid && (
                                        <div className="border-t border-white/10 p-2 space-y-0.5">
                                            {event.slug && (
                                                <a
                                                    href={`/e/${event.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10"
                                                >
                                                    View event page
                                                </a>
                                            )}
                                            {event.status === "published" && (
                                                <>
                                                    <button
                                                        onClick={() => duplicateEvent(eid)}
                                                        disabled={duplicating === eid}
                                                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-white/70 hover:bg-white/10"
                                                    >
                                                        {duplicating === eid ? "..." : "Run again"}
                                                    </button>
                                                    {event.dateTime && new Date(event.dateTime) >= now && (
                                                        <>
                                                            <button
                                                                onClick={() => rainCheck(eid, "on")}
                                                                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-white/70 hover:bg-white/10"
                                                            >
                                                                We&apos;re ON
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    const newDate = prompt("New date/time (e.g. 2026-03-01 10:00):");
                                                                    if (newDate) rainCheck(eid, "reschedule", { newDateTime: newDate });
                                                                }}
                                                                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-white/70 hover:bg-white/10"
                                                            >
                                                                Reschedule
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    const reason = prompt("Reason (optional):");
                                                                    rainCheck(eid, "cancel", { reason: reason || "" });
                                                                }}
                                                                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-400/70 hover:bg-white/10"
                                                            >
                                                                Cancel event
                                                            </button>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                            <div className="border-t border-white/10 mt-1 pt-1" />
                                            <button
                                                onClick={() => deleteEvent(eid)}
                                                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-400/70 hover:bg-white/10"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Attending Section */}
                {attending.length > 0 && (
                    <div className="mt-10">
                        <h2 className="font-serif text-xl italic text-white mb-4">
                            Attending
                        </h2>
                        <div className="space-y-3">
                            {attending.map((event) => (
                                <a
                                    key={event.id}
                                    href={`/e/${event.slug}`}
                                    className="flex items-center gap-4 rounded-[6px] border border-white/15 bg-white/10 p-4 backdrop-blur-sm hover:bg-white/[0.14] transition"
                                >
                                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-[6px] bg-white/10">
                                        {event.coverPhotoUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={event.coverPhotoUrl}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-sm font-medium text-white/40">
                                                NC
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-serif font-medium text-white truncate">
                                                {event.title || "Untitled"}
                                            </h3>
                                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                                event.rsvpStatus === "confirmed"
                                                    ? "bg-green-500/10 text-green-400/80"
                                                    : event.rsvpStatus === "waitlisted"
                                                        ? "bg-yellow-500/10 text-yellow-400/80"
                                                        : "bg-white/10 text-white/50"
                                            }`}>
                                                {event.rsvpStatus === "confirmed" ? "Going" : event.rsvpStatus === "waitlisted" ? "Waitlisted" : "Maybe"}
                                            </span>
                                        </div>
                                        <p className="text-sm text-white/60">
                                            {formatDate(event.dateTime)}
                                        </p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Hamburger Menu */}
            <div className="absolute right-5 top-6 z-40">
                <NavMenu user={profile} />
            </div>
        </div>
    );
}
