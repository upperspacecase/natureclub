"use client";

import { useState } from "react";

export default function ShareActions({ slug, eventId, title }) {
    const [copied, setCopied] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const eventUrl =
        typeof window !== "undefined"
            ? `${window.location.origin}/e/${slug}`
            : `/e/${slug}`;

    async function copyLink() {
        try {
            await navigator.clipboard.writeText(eventUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const input = document.createElement("input");
            input.value = eventUrl;
            document.body.appendChild(input);
            input.select();
            document.execCommand("copy");
            document.body.removeChild(input);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    async function downloadStoryCard() {
        setDownloading(true);
        try {
            const res = await fetch(`/api/events/${eventId}/story-card`);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${slug}-story.png`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download failed:", err);
        } finally {
            setDownloading(false);
        }
    }

    function nativeShare() {
        if (navigator.share) {
            navigator.share({
                title,
                text: `Join me for ${title}!`,
                url: eventUrl,
            });
        } else {
            copyLink();
        }
    }

    return (
        <div className="flex flex-wrap gap-2">
            <button
                onClick={copyLink}
                className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-50"
            >
                {copied ? "✓ Copied!" : "🔗 Copy link"}
            </button>
            <button
                onClick={downloadStoryCard}
                disabled={downloading}
                className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-50 disabled:opacity-50"
            >
                {downloading ? "..." : "📱 Story card"}
            </button>
            <button
                onClick={nativeShare}
                className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-50"
            >
                ↗ Share
            </button>
        </div>
    );
}
