"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const YEARLY_GOAL = 200;
const RING_RADIUS = 45;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function DiscoveryClient({ stats, feedCards }) {
  const heroRef = useRef(null);
  const [showFabs, setShowFabs] = useState(false);

  const totalHours = stats?.totalHours ?? 0;
  const eventCount = stats?.eventCount ?? 0;
  const streakWeeks = stats?.streakWeeks ?? 0;
  const progressPct = Math.min(
    Math.round((totalHours / YEARLY_GOAL) * 100),
    100
  );
  const ringOffset = RING_CIRCUMFERENCE * (1 - progressPct / 100);

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
            src="/home-hero.jpg"
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
          <Link
            href="/home"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition hover:bg-white/20"
          >
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
          </Link>
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex flex-col gap-8 px-6 pb-10">
          <h1 className="font-serif text-5xl italic leading-[1.05] text-white sm:text-6xl">
            Your Nature Journey
          </h1>

          {/* Stats row */}
          {stats && (
            <div className="flex justify-between border-b border-white/15 pb-6">
              <div className="space-y-1">
                <span className="block text-[10px] font-medium uppercase tracking-[0.1em] text-white/50">
                  Activity
                </span>
                <p className="text-xl font-light text-white">
                  {eventCount}{" "}
                  <span className="text-sm text-white/60">
                    event{eventCount !== 1 ? "s" : ""}
                  </span>
                </p>
              </div>
              <div className="space-y-1">
                <span className="block text-[10px] font-medium uppercase tracking-[0.1em] text-white/50">
                  Immersion
                </span>
                <p className="text-xl font-light text-white">
                  {totalHours}{" "}
                  <span className="text-sm text-white/60">
                    hour{totalHours !== 1 ? "s" : ""}
                  </span>
                </p>
              </div>
              <div className="space-y-1">
                <span className="block text-[10px] font-medium uppercase tracking-[0.1em] text-white/50">
                  Consistency
                </span>
                <p className="text-xl font-light text-white">
                  {streakWeeks > 0 ? (
                    <>
                      {streakWeeks}{" "}
                      <span className="text-sm text-white/60">week streak</span>
                    </>
                  ) : (
                    <span className="text-sm text-white/60">No streak yet</span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Progress ring + goal */}
          {stats && (
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
                    strokeDashoffset={ringOffset}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {progressPct}%
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-white/50">
                  Yearly Milestone
                </span>
                <h2 className="font-serif text-2xl italic text-white">
                  {YEARLY_GOAL} hour goal
                </h2>
              </div>
            </div>
          )}

          {/* Sign-in prompt for unauthenticated visitors */}
          {!stats && (
            <div className="border-t border-white/15 pt-6">
              <p className="text-sm text-white/60">
                <Link href="/signin" className="text-white underline">
                  Sign in
                </Link>{" "}
                to track your nature journey
              </p>
            </div>
          )}

          {/* CTA */}
          <Link
            href="/explore"
            className="flex items-center justify-between bg-white/50 px-8 py-5 text-black backdrop-blur-sm transition-all active:scale-95"
          >
            <span className="text-xs font-medium uppercase tracking-[0.2em]">
              Explore Map
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

      {/* ── Section 2+: Discovery Feed ── */}
      {feedCards.length > 0 ? (
        feedCards.map((card) => (
          <section
            key={card.id}
            className="relative h-[100svh] min-h-[600px] snap-start overflow-hidden bg-black"
          >
            {card.image && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.image}
                  alt={card.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
              </>
            )}

            <div className="absolute inset-0 z-10 flex flex-col justify-end px-6 pb-12">
              <span className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-white/60">
                {card.number} / {card.category}
              </span>
              {card.href ? (
                <Link href={card.href}>
                  <h2 className="mb-3 font-serif text-4xl italic leading-tight text-white sm:text-5xl">
                    {card.title}
                  </h2>
                </Link>
              ) : (
                <h2 className="mb-3 font-serif text-4xl italic leading-tight text-white sm:text-5xl">
                  {card.title}
                </h2>
              )}
              {card.subtitle && (
                <p className="text-sm uppercase tracking-wider text-white/80">
                  {card.subtitle}
                </p>
              )}
            </div>
          </section>
        ))
      ) : (
        <section className="relative flex h-[100svh] min-h-[600px] snap-start items-center justify-center bg-black">
          <div className="px-6 text-center">
            <h2 className="font-serif text-3xl italic text-white/60">
              No experiences yet
            </h2>
            <p className="mt-4 text-sm text-white/40">
              Check back soon for nature experiences and spots near you.
            </p>
          </div>
        </section>
      )}

      {/* ── Floating Action Buttons ── */}
      <div
        className={`fixed bottom-8 right-5 z-50 flex flex-col gap-3 transition-all duration-300 ${
          showFabs
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <Link
          href="/explore"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 shadow-2xl shadow-black/30 backdrop-blur-xl transition active:scale-90"
        >
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
        </Link>
      </div>
    </div>
  );
}
