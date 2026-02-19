"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";

/**
 * Live story card preview — single source of truth.
 * Downloads use html2canvas to capture this exact DOM element.
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
    hideDownload,
    location,
    durationMinutes,
    currency,
    compact,
}) {
    const cardRef = useRef(null);
    const [saving, setSaving] = useState(false);

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

    const currencySymbol = {
        USD: "$", EUR: "€", GBP: "£", CAD: "CA$", AUD: "A$",
        NZD: "NZ$", BRL: "R$", MXN: "MX$", JPY: "¥", INR: "₹",
        ZAR: "R", CHF: "CHF", SEK: "kr", NOK: "kr", DKK: "kr",
        COP: "COL$", ARS: "AR$", CLP: "CL$",
    }[currency] || "$";

    const priceLabel =
        price === undefined || price === null
            ? null
            : price === 0
                ? "Free"
                : `${currencySymbol}${price}`;

    function formatDuration(mins) {
        if (!mins) return "";
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        if (h === 0) return `${m} min`;
        if (m === 0) return `${h} hr`;
        return `${h} hr ${m} min`;
    }

    async function handleDownload() {
        if (!cardRef.current) return;
        setSaving(true);
        try {
            const canvas = await html2canvas(cardRef.current, {
                scale: 4, // High-res for Instagram Stories (1080×1920)
                useCORS: true,
                allowTaint: false,
                backgroundColor: "#292524",
            });
            const url = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.href = url;
            a.download = `${slug || "event"}-story.png`;
            a.click();
        } catch (err) {
            console.error("Story card download failed:", err);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="flex flex-col items-center gap-3">
            {/* Card preview — scaled 9:16 aspect ratio */}
            <div
                ref={cardRef}
                className="relative w-full overflow-hidden rounded-2xl shadow-2xl"
                style={{ aspectRatio: compact ? "4 / 5" : "9 / 16" }}
            >
                {/* Cover photo background */}
                {coverPhotoUrl && (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={coverPhotoUrl}
                            alt=""
                            crossOrigin="anonymous"
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
                    {/* Top: title */}
                    <div>
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
                    </div>

                    {/* Bottom-left: details */}
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
                        {durationMinutes > 0 && (
                            <span>⏱ {formatDuration(durationMinutes)}</span>
                        )}
                        {location && (
                            <span>📍 {location}</span>
                        )}
                        {hostName && (
                            <span>🌿 with {hostName}</span>
                        )}
                        {groupSize ? (
                            <span>👥 {groupSize} spots</span>
                        ) : null}
                        {priceLabel !== null && (
                            <span>💵 {priceLabel}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Download button */}
            {!hideDownload && (
                <button
                    onClick={handleDownload}
                    disabled={!published || saving}
                    className={`w-full rounded-full px-4 py-2.5 text-xs font-medium transition-all ${published
                        ? "bg-white text-black hover:bg-white/90"
                        : "cursor-not-allowed border border-white/15 bg-white/5 text-white/30"
                        }`}
                >
                    {saving
                        ? "Saving..."
                        : published
                            ? "📱 Download story card"
                            : "📱 Download available after publishing"}
                </button>
            )}
        </div>
    );
}
