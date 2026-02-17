"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// TWILIO-AUTH: Was: import { UserButton } from "@clerk/nextjs";
import apiClient from "@/libs/api";
import ShareActions from "@/components/ShareActions";

const TABS = ["upcoming", "drafts", "past", "cancelled"];

export default function FacilitatorEventsPage() {
    const router = useRouter();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("upcoming");
    const [profileOpen, setProfileOpen] = useState(false);
    const [profile, setProfile] = useState(null);
    const [profileSaving, setProfileSaving] = useState(false);
    const [duplicating, setDuplicating] = useState(null);
    const [rainCheckTarget, setRainCheckTarget] = useState(null);

    useEffect(() => {
        loadEvents();
        loadProfile();
    }, []);

    async function loadEvents() {
        try {
            const res = await apiClient.get("/events/list");
            setEvents(res.events || []);
        } catch (err) {
            console.error("Failed to load events:", err);
        } finally {
            setLoading(false);
        }
    }

    async function loadProfile() {
        try {
            const res = await apiClient.get("/user");
            setProfile(res);
        } catch (err) {
            console.error("Failed to load profile:", err);
        }
    }

    async function saveProfile() {
        if (!profile) return;
        setProfileSaving(true);
        try {
            const res = await apiClient.patch("/user", {
                name: profile.name,
                username: profile.username,
                bio: profile.bio,
                phone: profile.phone,
            });
            setProfile(res);
        } catch (err) {
            console.error("Failed to save profile:", err);
        } finally {
            setProfileSaving(false);
        }
    }

    async function duplicateEvent(eventId) {
        setDuplicating(eventId);
        try {
            const res = await apiClient.post(`/events/${eventId}/duplicate`);
            if (res.id) {
                router.push(`/events/new?id=${res.id}`);
            }
        } catch (err) {
            console.error("Duplicate failed:", err);
        } finally {
            setDuplicating(null);
        }
    }

    async function rainCheck(eventId, action, data = {}) {
        try {
            await apiClient.post(`/events/${eventId}/raincheck`, { action, ...data });
            await loadEvents();
            setRainCheckTarget(null);
        } catch (err) {
            console.error("Rain check failed:", err);
        }
    }

    const now = new Date();

    const filtered = events.filter((e) => {
        switch (activeTab) {
            case "upcoming":
                return e.status === "published" && (!e.dateTime || new Date(e.dateTime) >= now);
            case "past":
                return e.status === "published" && e.dateTime && new Date(e.dateTime) < now;
            case "drafts":
                return e.status === "draft";
            case "cancelled":
                return e.status === "cancelled";
            default:
                return true;
        }
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

    return (
        <div className="min-h-screen bg-base-100 text-white">
            <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="font-serif text-2xl italic text-white">
                        Your Events
                    </h1>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setProfileOpen(!profileOpen)}
                            className="text-sm text-white/60 hover:text-white"
                        >
                            Profile
                        </button>
                        <button
                            onClick={() => router.push("/events/new")}
                            className="btn"
                        >
                            + New Event
                        </button>
                        {/* TWILIO-AUTH: Add sign-out button when auth is wired */}
                    </div>
                </div>

                {/* Profile editing */}
                {profileOpen && profile && (
                    <div className="mb-6 rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
                        <h2 className="mb-4 font-serif text-lg text-white">
                            Edit Profile
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-white/60">Name</label>
                                <input
                                    type="text"
                                    value={profile.name || ""}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    className="w-full rounded-[5px] border border-white/35 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/60 outline-none focus:border-white/70"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-white/60">Username</label>
                                <div className="flex items-center gap-1">
                                    <span className="text-sm text-white/50">@</span>
                                    <input
                                        type="text"
                                        value={profile.username || ""}
                                        onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                                        placeholder="your-username"
                                        className="flex-1 rounded-[5px] border border-white/35 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/60 outline-none focus:border-white/70"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-white/60">Bio</label>
                                <textarea
                                    value={profile.bio || ""}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                    maxLength={280}
                                    rows={2}
                                    className="w-full resize-none rounded-[5px] border border-white/35 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/60 outline-none focus:border-white/70"
                                />
                                <p className="mt-0.5 text-right text-xs text-white/40">
                                    {(profile.bio || "").length}/280
                                </p>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-white/60">Phone</label>
                                <input
                                    type="tel"
                                    value={profile.phone || ""}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    className="w-full rounded-[5px] border border-white/35 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/60 outline-none focus:border-white/70"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={saveProfile}
                                    disabled={profileSaving}
                                    className="btn"
                                >
                                    {profileSaving ? "Saving..." : "Save"}
                                </button>
                                {profile.username && (
                                    <a
                                        href={`/@${profile.username}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-white/60 hover:text-white hover:underline"
                                    >
                                        View public profile →
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="mb-4 flex gap-1 rounded-xl bg-white/10 p-1">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 rounded-lg py-2 text-xs font-medium capitalize transition-colors ${activeTab === tab
                                    ? "bg-white/20 text-white"
                                    : "text-white/50 hover:text-white/80"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Event List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <span className="text-white/40">Loading...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="rounded-3xl border border-white/15 bg-white/10 p-10 text-center backdrop-blur-sm">
                        <p className="text-3xl">🌿</p>
                        <p className="mt-3 text-sm text-white/60">
                            {activeTab === "upcoming"
                                ? "No upcoming events — create one!"
                                : `No ${activeTab} events.`}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((event) => (
                            <div
                                key={event.id || event._id}
                                className="overflow-hidden rounded-[6px] border border-white/15 bg-white/10 backdrop-blur-sm"
                            >
                                <button
                                    onClick={() =>
                                        event.status === "draft"
                                            ? router.push(`/events/new?id=${event.id || event._id}`)
                                            : event.slug
                                                ? window.open(`/e/${event.slug}`, "_blank")
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
                                            <div className="flex h-full w-full items-center justify-center text-xl">
                                                🌿
                                            </div>
                                        )}
                                    </div>
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-serif font-medium text-white truncate">
                                            {event.title || "Untitled"}
                                        </h3>
                                        <p className="text-sm text-white/60">
                                            {formatDate(event.dateTime)}
                                        </p>
                                    </div>
                                    {/* Meta */}
                                    <div className="flex-shrink-0 text-right">
                                        <span className="text-sm font-medium text-white">
                                            {event.rsvpCount || 0}/{event.groupSize}
                                        </span>
                                        <p className="text-xs text-white/40">spots</p>
                                    </div>
                                </button>

                                {/* Quick actions */}
                                {event.status !== "draft" && (
                                    <div className="flex items-center gap-2 border-t border-white/10 px-4 py-2">
                                        {event.slug && (
                                            <ShareActions
                                                slug={event.slug}
                                                eventId={event.id || event._id}
                                                title={event.title}
                                            />
                                        )}
                                        <div className="flex-1" />
                                        {event.status === "published" && (
                                            <>
                                                <button
                                                    onClick={() => duplicateEvent(event.id || event._id)}
                                                    disabled={duplicating === (event.id || event._id)}
                                                    className="text-xs text-white/50 hover:text-white"
                                                >
                                                    {duplicating === (event.id || event._id)
                                                        ? "..."
                                                        : "Run again"}
                                                </button>
                                                {event.dateTime && new Date(event.dateTime) >= now && (
                                                    <button
                                                        onClick={() =>
                                                            setRainCheckTarget(
                                                                rainCheckTarget === (event.id || event._id)
                                                                    ? null
                                                                    : event.id || event._id
                                                            )
                                                        }
                                                        className="text-xs text-white/50 hover:text-white"
                                                    >
                                                        Rain check
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Rain check dropdown */}
                                {rainCheckTarget === (event.id || event._id) && (
                                    <div className="border-t border-white/10 p-3 space-y-1.5">
                                        <button
                                            onClick={() => rainCheck(event.id || event._id, "on")}
                                            className="block w-full rounded-[5px] border border-white/20 bg-white/10 px-3 py-2 text-left text-sm text-white/90 hover:bg-white/20"
                                        >
                                            ✅ We&apos;re ON
                                        </button>
                                        <button
                                            onClick={() => {
                                                const newDate = prompt("New date/time (e.g. 2026-03-01 10:00):");
                                                if (newDate) rainCheck(event.id || event._id, "reschedule", { newDateTime: newDate });
                                            }}
                                            className="block w-full rounded-[5px] border border-white/20 bg-white/10 px-3 py-2 text-left text-sm text-white/90 hover:bg-white/20"
                                        >
                                            📅 Reschedule
                                        </button>
                                        <button
                                            onClick={() => {
                                                const reason = prompt("Reason (optional):");
                                                rainCheck(event.id || event._id, "cancel", { reason: reason || "" });
                                            }}
                                            className="block w-full rounded-[5px] border border-white/20 bg-white/10 px-3 py-2 text-left text-sm text-white/90 hover:bg-white/20"
                                        >
                                            ❌ Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
