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
  const percentage = Math.min(Math.round((totalHours / YEARLY_GOAL) * 100), 100);

  return (
    <section className="relative h-[795px] w-full flex flex-col justify-end">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          alt="Ancient forest with light beams"
          className="w-full h-full object-cover"
          src="/home-hero.jpg"
        />
        <div className="absolute inset-0 hero-gradient-overlay" />
      </div>

      {/* Menu */}
      <div className="absolute top-8 right-8 z-20">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white p-2 hover:opacity-80 transition-opacity"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-12 bg-white text-nc-on-surface shadow-lg py-2 min-w-[180px] z-30">
            <Link
              href="/events"
              className="block px-5 py-3 text-sm hover:bg-nc-surface-container transition-colors"
            >
              My Events
            </Link>
            <Link
              href={user?.username ? `/profile/${user.username}` : "#"}
              className="block px-5 py-3 text-sm hover:bg-nc-surface-container transition-colors"
            >
              Public Profile
            </Link>
            <Link
              href="/events/new"
              className="block px-5 py-3 text-sm hover:bg-nc-surface-container transition-colors"
            >
              Edit Profile
            </Link>
          </div>
        )}
      </div>

      {/* Hero Content */}
      <div className="relative z-10 px-8 pb-16">
        <h1 className="font-headline italic text-5xl md:text-7xl text-white leading-tight mb-12">
          Your Nature Journey
        </h1>

        <div className="flex flex-col gap-10">
          {/* Stats Row */}
          <div className="flex justify-between items-end border-b border-white/20 pb-8">
            <div className="space-y-1">
              <span className="block text-white/60 text-[10px] text-all-caps-spacing uppercase">
                Activity
              </span>
              <p className="text-white text-xl font-light">
                {eventCount} event{eventCount !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="space-y-1">
              <span className="block text-white/60 text-[10px] text-all-caps-spacing uppercase">
                Immersion
              </span>
              <p className="text-white text-xl font-light">
                {totalHours} hour{totalHours !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="space-y-1">
              <span className="block text-white/60 text-[10px] text-all-caps-spacing uppercase">
                Consistency
              </span>
              <p className="text-white text-xl font-light">
                {streakWeeks > 0
                  ? `${streakWeeks}-week streak`
                  : "No streak yet"}
              </p>
            </div>
          </div>

          {/* Progress Ring */}
          <div className="flex items-center gap-6">
            <ProgressRing percentage={percentage} />
            <div className="flex flex-col">
              <span className="text-white/60 text-[10px] text-all-caps-spacing uppercase">
                Yearly Milestone
              </span>
              <h2 className="text-white text-2xl font-light italic font-headline">
                {YEARLY_GOAL} hour goal
              </h2>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/discovery"
            className="py-5 px-8 flex justify-between items-center transition-all active:scale-95 group bg-white/50 text-nc-primary backdrop-blur-sm"
          >
            <span className="text-all-caps-spacing text-xs uppercase tracking-[0.2em]">
              Explore
            </span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform group-hover:translate-x-2"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
