"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
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
            const res = await apiClient.get("/facilitator");
            setProfile(res);
        } catch (err) {
            console.error("Failed to load profile:", err);
        }
    }

    async function saveProfile() {
        if (!profile) return;
        setProfileSaving(true);
        try {
            const res = await apiClient.patch("/facilitator", {
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
        <div className="min-h-screen bg-[#f8f6f3]">
            <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="font-serif text-2xl font-bold text-stone-800">
                        Your Events
                    </h1>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setProfileOpen(!profileOpen)}
                            className="text-sm text-stone-500 hover:text-stone-700"
                        >
                            Profile
                        </button>
                        <button
                            onClick={() => router.push("/events/new")}
                            className="rounded-full bg-stone-800 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-stone-700"
                        >
                            + New Event
                        </button>
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </div>

                {/* Profile editing */}
                {profileOpen && profile && (
                    <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
                        <h2 className="mb-4 font-serif text-lg font-bold text-stone-800">
                            Edit Profile
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-stone-500">Name</label>
                                <input
                                    type="text"
                                    value={profile.name || ""}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-800"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-stone-500">Username</label>
                                <div className="flex items-center gap-1">
                                    <span className="text-sm text-stone-400">@</span>
                                    <input
                                        type="text"
                                        value={profile.username || ""}
                                        onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                                        placeholder="your-username"
                                        className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-800"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-stone-500">Bio</label>
                                <textarea
                                    value={profile.bio || ""}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                    maxLength={280}
                                    rows={2}
                                    className="w-full resize-none rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-800"
                                />
                                <p className="mt-0.5 text-right text-xs text-stone-400">
                                    {(profile.bio || "").length}/280
                                </p>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-stone-500">Phone</label>
                                <input
                                    type="tel"
                                    value={profile.phone || ""}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-800"
                                />
                            </div>
                            <button
                                onClick={saveProfile}
                                disabled={profileSaving}
                                className="rounded-full bg-stone-800 px-5 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50"
                            >
                                {profileSaving ? "Saving..." : "Save"}
                            </button>
                            {profile.username && (
                                <a
                                    href={`/@${profile.username}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-3 text-sm text-stone-500 hover:underline"
                                >
                                    View public profile →
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="mb-4 flex gap-1 rounded-xl bg-stone-100 p-1">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 rounded-lg py-2 text-xs font-medium capitalize transition-colors ${activeTab === tab
                                    ? "bg-white text-stone-800 shadow-sm"
                                    : "text-stone-500 hover:text-stone-700"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Event List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <span className="text-stone-400">Loading...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                        <p className="text-3xl">🌿</p>
                        <p className="mt-3 text-sm text-stone-500">
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
                                className="rounded-xl bg-white shadow-sm"
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
                                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-stone-100">
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
                                        <h3 className="font-medium text-stone-800 truncate">
                                            {event.title || "Untitled"}
                                        </h3>
                                        <p className="text-sm text-stone-500">
                                            {formatDate(event.dateTime)}
                                        </p>
                                    </div>
                                    {/* Meta */}
                                    <div className="flex-shrink-0 text-right">
                                        <span className="text-sm font-medium text-stone-700">
                                            {event.rsvpCount || 0}/{event.groupSize}
                                        </span>
                                        <p className="text-xs text-stone-400">spots</p>
                                    </div>
                                </button>

                                {/* Quick actions */}
                                {event.status !== "draft" && (
                                    <div className="flex items-center gap-2 border-t border-stone-100 px-4 py-2">
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
                                                    className="text-xs text-stone-500 hover:text-stone-700"
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
                                                        className="text-xs text-stone-500 hover:text-stone-700"
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
                                    <div className="border-t border-stone-100 p-3 space-y-1.5">
                                        <button
                                            onClick={() => rainCheck(event.id || event._id, "on")}
                                            className="block w-full rounded-lg bg-emerald-50 px-3 py-2 text-left text-sm text-emerald-700 hover:bg-emerald-100"
                                        >
                                            ✅ We&apos;re ON
                                        </button>
                                        <button
                                            onClick={() => {
                                                const newDate = prompt("New date/time (e.g. 2026-03-01 10:00):");
                                                if (newDate) rainCheck(event.id || event._id, "reschedule", { newDateTime: newDate });
                                            }}
                                            className="block w-full rounded-lg bg-amber-50 px-3 py-2 text-left text-sm text-amber-700 hover:bg-amber-100"
                                        >
                                            📅 Reschedule
                                        </button>
                                        <button
                                            onClick={() => {
                                                const reason = prompt("Reason (optional):");
                                                rainCheck(event.id || event._id, "cancel", { reason: reason || "" });
                                            }}
                                            className="block w-full rounded-lg bg-red-50 px-3 py-2 text-left text-sm text-red-700 hover:bg-red-100"
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
