"use client";

import { useState } from "react";
import Link from "next/link";
import ProgressRing from "./ProgressRing";

const YEARLY_GOAL = 200;

export default function HomeHero({ stats, user }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const totalHours = stats?.totalHours ?? 0;
  const eventCount = stats?.eventCount ?? 0;
  const streakWeeks = stats?.streakWeeks ?? 0;
  const percentage = Math.min(
    Math.round((totalHours / YEARLY_GOAL) * 100),
    100
  );

  return (
    <section className="relative flex h-[100svh] min-h-[700px] w-full flex-col justify-end overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          className="h-full w-full object-cover"
          src="/home-hero.jpg"
        />
        <div className="absolute inset-0 hero-gradient-overlay" />
      </div>

      {/* Menu */}
      <div className="absolute right-5 top-14 z-20">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
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
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-12 z-30 min-w-[180px] bg-white py-2 text-nc-on-surface shadow-lg">
            <Link
              href="/events"
              className="block px-5 py-3 text-sm transition-colors hover:bg-nc-surface-container"
            >
              My Events
            </Link>
            <Link
              href={user?.username ? `/profile/${user.username}` : "#"}
              className="block px-5 py-3 text-sm transition-colors hover:bg-nc-surface-container"
            >
              Public Profile
            </Link>
          </div>
        )}
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col gap-8 px-6 pb-10">
        <h1 className="font-headline text-5xl italic leading-[1.05] text-white">
          Your Nature Journey
        </h1>

        <div className="flex flex-col gap-8">
          {/* Stats Row */}
          <div className="flex justify-between border-b border-white/15 pb-6">
            <div className="space-y-1">
              <span className="block text-[10px] text-all-caps-spacing uppercase text-white/50">
                Activity
              </span>
              <p className="text-lg font-light text-white">
                {eventCount} event{eventCount !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="space-y-1">
              <span className="block text-[10px] text-all-caps-spacing uppercase text-white/50">
                Immersion
              </span>
              <p className="text-lg font-light text-white">
                {totalHours} hour{totalHours !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="space-y-1">
              <span className="block text-[10px] text-all-caps-spacing uppercase text-white/50">
                Consistency
              </span>
              <p className="text-lg font-light text-white">
                {streakWeeks > 0
                  ? `${streakWeeks}-week streak`
                  : "No streak yet"}
              </p>
            </div>
          </div>

          {/* Progress Ring */}
          <div className="flex items-center gap-5">
            <ProgressRing percentage={percentage} />
            <div className="flex flex-col">
              <span className="text-[10px] text-all-caps-spacing uppercase text-white/50">
                Yearly Milestone
              </span>
              <h2 className="font-headline text-2xl italic text-white">
                {YEARLY_GOAL} hour goal
              </h2>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/discovery"
            className="flex items-center justify-between bg-white/50 px-8 py-5 text-nc-primary backdrop-blur-sm transition-all active:scale-95"
          >
            <span className="text-xs text-all-caps-spacing uppercase tracking-[0.2em]">
              Explore
            </span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="transition-transform group-hover:translate-x-2"
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
      </div>
    </section>
  );
}
