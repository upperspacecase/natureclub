"use client";

import { useRef } from "react";

/**
 * Live story card preview — mirrors the server-side story card design
 * at /api/events/[id]/story-card but renders as pure CSS/HTML.
 *
 * Props:
 *  - title: string
 *  - dateTime: string (ISO or datetime-local value)
 *  - activityType: string (slug like "forest-bathing")
 *  - groupSize: number
 *  - hostName: string
 *  - slug: string (event slug, shown in URL)
 *  - published: boolean (controls download button)
 *  - eventId: string (for API download)
 *  - coverPhotoUrl: string (cover photo URL)
 *  - price: number (0 = free)
 */
export default function StoryCardPreview({
    title,
    dateTime,
    activityType,
    groupSize,
    hostName,
    slug,
    published,
    eventId,
    coverPhotoUrl,
    price,
}) {
    const cardRef = useRef(null);

    const activityLabel = activityType
        ? activityType
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())
        : "";

    const dateStr = dateTime
        ? new Date(dateTime).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
        })
        : "";

    const timeStr = dateTime
        ? new Date(dateTime).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        })
        : "";

    const displayUrl = slug
        ? `natureclub.app/e/${slug}`
        : "natureclub.app/e/...";

    const priceLabel =
        price === undefined || price === null
            ? null
            : price === 0
                ? "Free"
                : `$${price}`;

    async function handleDownload() {
        if (!published || !eventId) return;
        try {
            const res = await fetch(`/api/events/${eventId}/story-card`);
            if (!res.ok) throw new Error("Failed to fetch");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${slug || "event"}-story.png`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Story card download failed:", err);
        }
    }

    return (
        <div className="flex flex-col items-center gap-3">
            {/* Card preview — scaled 9:16 aspect ratio */}
            <div
                ref={cardRef}
                className="relative w-full overflow-hidden rounded-2xl shadow-2xl"
                style={{ aspectRatio: "9 / 16" }}
            >
                {/* Cover photo background */}
                {coverPhotoUrl && (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={coverPhotoUrl}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                        {/* Dark overlay for readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                    </>
                )}

                {/* Card body */}
                <div
                    className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8"
                    style={{
                        backgroundColor: coverPhotoUrl ? "transparent" : "#292524",
                        color: "#fafaf9",
                    }}
                >
                    {/* Event info */}
                    <div className="flex flex-col gap-3">
                        {activityLabel && (
                            <div>
                                <span
                                    className="inline-block rounded-full px-3 py-1 text-xs"
                                    style={{
                                        backgroundColor: "rgba(255,255,255,0.12)",
                                        color: "#d6d3d1",
                                        backdropFilter: coverPhotoUrl ? "blur(8px)" : "none",
                                    }}
                                >
                                    {activityLabel}
                                </span>
                            </div>
                        )}

                        <h2
                            className="font-serif font-bold leading-tight"
                            style={{
                                fontSize: "clamp(1.25rem, 5vw, 2rem)",
                                opacity: title ? 1 : 0.3,
                                textShadow: coverPhotoUrl ? "0 1px 4px rgba(0,0,0,0.5)" : "none",
                            }}
                        >
                            {title || "Your event title"}
                        </h2>

                        <div
                            className="flex flex-col gap-1 text-xs"
                            style={{ color: coverPhotoUrl ? "#e7e5e4" : "#a8a29e" }}
                        >
                            {dateStr ? (
                                <span>
                                    📅 {dateStr}
                                    {timeStr ? ` at ${timeStr}` : ""}
                                </span>
                            ) : (
                                <span style={{ opacity: 0.4 }}>
                                    📅 Date & time
                                </span>
                            )}
                            {hostName && (
                                <span>🌿 with {hostName}</span>
                            )}
                            {groupSize ? (
                                <span>👥 {groupSize} spots</span>
                            ) : (
                                <span style={{ opacity: 0.4 }}>
                                    👥 Group size
                                </span>
                            )}
                            {priceLabel !== null && (
                                <span>💵 {priceLabel}</span>
                            )}
                        </div>
                    </div>

                    {/* Bottom: CTA */}
                    <div className="flex flex-col items-center gap-2">
                        <div
                            className="rounded-full px-6 py-2 text-xs font-semibold"
                            style={{
                                backgroundColor: "#fafaf9",
                                color: "#292524",
                            }}
                        >
                            RSVP — I&apos;m in 🌱
                        </div>
                        <span
                            className="text-center text-[10px]"
                            style={{ color: "#78716c" }}
                        >
                            {displayUrl}
                        </span>
                    </div>
                </div>
            </div>

            {/* Download button */}
            <button
                onClick={handleDownload}
                disabled={!published}
                className={`w-full rounded-full px-4 py-2.5 text-xs font-medium transition-all ${published
                    ? "bg-white text-black hover:bg-white/90"
                    : "cursor-not-allowed border border-white/15 bg-white/5 text-white/30"
                    }`}
            >
                {published
                    ? "📱 Download story card"
                    : "📱 Download available after publishing"}
            </button>
        </div>
    );
}
