"use client";

import Link from "next/link";
import { useCallback } from "react";

export default function HomeActions() {
  const handleInvite = useCallback(async () => {
    const shareData = {
      title: "Nature Club",
      text: "Join me on Nature Club — nature-based experiences near you.",
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(shareData.url);
      alert("Link copied to clipboard!");
    }
  }, []);

  return (
    <section className="px-8 space-y-4 pb-20">
      <Link
        href="/events/new"
        className="w-full bg-nc-primary border border-nc-primary text-nc-on-primary py-5 px-8 flex justify-between items-center transition-all active:scale-[0.98] group"
      >
        <span className="text-all-caps-spacing text-xs uppercase tracking-[0.2em]">
          Become a Host
        </span>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M3 9.5L12 4l9 5.5v9a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 18.5v-9z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </Link>

      <button
        onClick={handleInvite}
        className="w-full bg-transparent border border-nc-primary text-nc-primary py-5 px-8 flex justify-between items-center transition-all active:scale-[0.98] group"
      >
        <span className="text-all-caps-spacing text-xs uppercase tracking-[0.2em]">
          Invite a Friend
        </span>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="22" y1="11" x2="16" y2="11" />
        </svg>
      </button>
    </section>
  );
}
