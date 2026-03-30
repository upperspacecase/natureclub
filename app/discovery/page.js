"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const STATS = [
  { label: "Activity", value: "24", unit: "events" },
  { label: "Immersion", value: "156", unit: "hours" },
  { label: "Consistency", value: "12", unit: "week streak" },
];

const PROGRESS = { current: 156, goal: 200 };
const PROGRESS_PCT = Math.round((PROGRESS.current / PROGRESS.goal) * 100);

const DISCOVERY_CARDS = [
  {
    id: 1,
    number: "01",
    category: "TRAIL",
    title: "Campuhan Ridge",
    distance: "2.4 km away",
    conditions: "Sunny \u00b7 Bring water",
    image: "/mock_images/3.png",
  },
  {
    id: 2,
    number: "02",
    category: "WATERFALL",
    title: "Tegenungan Cascades",
    distance: "5.8 km away",
    conditions: "Misty \u00b7 Slippery path",
    image: "/mock_images/6.png",
  },
  {
    id: 3,
    number: "03",
    category: "GARDEN",
    title: "Tegalalang Terraces",
    distance: "8.2 km away",
    conditions: "Humid \u00b7 Wear sunscreen",
    image: "/mock_images/9.png",
  },
  {
    id: 4,
    number: "04",
    category: "FOREST",
    title: "Sacred Monkey Sanctuary",
    distance: "1.1 km away",
    conditions: "Shady \u00b7 Watch belongings",
    image: "/mock_images/12.png",
  },
  {
    id: 5,
    number: "05",
    category: "LAKE",
    title: "Alpine Lake Meditation",
    distance: "14.6 km away",
    conditions: "Clear \u00b7 22\u00b0C",
    image: "/mock_images/15.png",
  },
];

// SVG progress ring math
const RING_RADIUS = 45;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const RING_OFFSET = RING_CIRCUMFERENCE * (1 - PROGRESS_PCT / 100);

export default function DiscoveryPage() {
  const heroRef = useRef(null);
  const [showFabs, setShowFabs] = useState(false);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowFabs(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="h-[100dvh] snap-y snap-mandatory overflow-y-auto scrollbar-hide">
      {/* ── Section 1: Journey Dashboard Hero ── */}
      <section
        ref={heroRef}
        className="relative flex h-[100svh] min-h-[700px] snap-start flex-col justify-between overflow-hidden bg-black"
      >
        {/* Background */}
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mock_images/3.png"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80" />
        </div>

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-14">
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-light.svg"
              alt="Nature Club"
              className="h-7 w-auto"
            />
          </Link>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition hover:bg-white/20">
            <svg
              width="18"
              height="14"
              viewBox="0 0 18 14"
              fill="none"
              className="text-white"
            >
              <path
                d="M1 1h16M1 7h16M1 13h16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex flex-col gap-8 px-6 pb-10">
          <h1 className="font-serif text-5xl italic leading-[1.05] text-white sm:text-6xl">
            Your Nature Journey
          </h1>

          {/* Stats row */}
          <div className="flex justify-between border-b border-white/15 pb-6">
            {STATS.map((s) => (
              <div key={s.label} className="space-y-1">
                <span className="block text-[10px] font-medium uppercase tracking-[0.1em] text-white/50">
                  {s.label}
                </span>
                <p className="text-xl font-light text-white">
                  {s.value}{" "}
                  <span className="text-sm text-white/60">{s.unit}</span>
                </p>
              </div>
            ))}
          </div>

          {/* Progress ring + goal */}
          <div className="flex items-center gap-5">
            <div className="relative h-24 w-24 shrink-0">
              <svg
                className="-rotate-90"
                viewBox="0 0 100 100"
                width="96"
                height="96"
              >
                <circle
                  cx="50"
                  cy="50"
                  r={RING_RADIUS}
                  fill="transparent"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="4"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={RING_RADIUS}
                  fill="transparent"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="butt"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={RING_OFFSET}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {PROGRESS_PCT}%
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-white/50">
                Yearly Milestone
              </span>
              <h2 className="font-serif text-2xl italic text-white">
                {PROGRESS.goal} hour goal
              </h2>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/explore"
            className="flex items-center justify-between bg-white/50 px-8 py-5 text-black backdrop-blur-sm transition-all active:scale-95"
          >
            <span className="text-xs font-medium uppercase tracking-[0.2em]">
              Explore
            </span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="text-black"
            >
              <path
                d="M4 10h12m0 0-4-4m4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Section 2: Discovery Feed ── */}
      {DISCOVERY_CARDS.map((card) => (
        <section
          key={card.id}
          className="relative h-[100svh] min-h-[600px] snap-start overflow-hidden bg-black"
        >
          {/* Background image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.image}
            alt={card.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

          {/* Card content */}
          <div className="absolute inset-0 z-10 flex flex-col justify-end px-6 pb-12">
            <span className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-white/60">
              {card.number} / {card.category}
            </span>
            <h2 className="mb-3 font-serif text-4xl italic leading-tight text-white sm:text-5xl">
              {card.title}
            </h2>
            <div className="flex items-center gap-3 text-sm uppercase tracking-wider text-white/80">
              <span>{card.distance}</span>
              <span className="opacity-40">&bull;</span>
              <span>{card.conditions}</span>
            </div>
          </div>
        </section>
      ))}

      {/* ── Floating Action Buttons ── */}
      <div
        className={`fixed right-5 bottom-8 z-50 flex flex-col gap-3 transition-all duration-300 ${
          showFabs
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <button className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 shadow-2xl shadow-black/30 backdrop-blur-xl transition active:scale-90">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            className="text-white"
          >
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"
              fill="currentColor"
            />
          </svg>
        </button>
        <button className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 shadow-2xl shadow-black/30 backdrop-blur-xl transition active:scale-90">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            className="text-white"
          >
            <path
              d="M4 6h16M6 12h12M8 18h8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
