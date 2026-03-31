"use client";

import Link from "next/link";
import ProgressRing from "./ProgressRing";
import NavMenu from "./NavMenu";

const YEARLY_GOAL = 200;

export default function HomeHero({ stats, user }) {
  const totalHours = stats?.totalHours ?? 0;
  const eventCount = stats?.eventCount ?? 0;
  const streakWeeks = stats?.streakWeeks ?? 0;
  const percentage = Math.min(
    Math.round((totalHours / YEARLY_GOAL) * 100),
    100
  );

  return (
    <section className="relative flex h-[100svh] min-h-[700px] w-full flex-col justify-between overflow-hidden bg-black">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          className="h-full w-full object-cover"
          src="/home-hero.jpg"
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
        <NavMenu user={user} />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col gap-8 px-6 pb-10">
        <h1 className="font-serif text-5xl italic leading-[1.05] text-white">
          Your Nature Journey
        </h1>

        <div className="flex flex-col gap-8">
          {/* Stats Row */}
          <div className="flex justify-between border-b border-white/15 pb-6">
            <div className="space-y-1">
              <span className="block text-[10px] font-medium uppercase tracking-[0.1em] text-white/50">
                Activity
              </span>
              <p className="text-lg font-light text-white">
                {eventCount} event{eventCount !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="space-y-1">
              <span className="block text-[10px] font-medium uppercase tracking-[0.1em] text-white/50">
                Immersion
              </span>
              <p className="text-lg font-light text-white">
                {totalHours} hour{totalHours !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="space-y-1">
              <span className="block text-[10px] font-medium uppercase tracking-[0.1em] text-white/50">
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
              <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-white/50">
                Yearly Milestone
              </span>
              <h2 className="font-serif text-2xl italic text-white">
                {YEARLY_GOAL} hour goal
              </h2>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/discovery"
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
