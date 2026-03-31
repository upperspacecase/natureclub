"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DiscoveryClient({ feedCards, user }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = useCallback(async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      router.push("/signin");
    } catch (_err) {
      // sign-out failed
    }
  }, [router]);

  return (
    <div className="relative mx-auto h-[100dvh] w-full max-w-[430px] snap-y snap-mandatory overflow-y-auto scrollbar-hide">
      {/* ── Hamburger Menu ── */}
      <div className="fixed right-5 top-6 z-50">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition hover:bg-black/50 active:scale-95"
        >
          <svg
            width="18"
            height="14"
            viewBox="0 0 18 14"
            fill="none"
            className="text-white drop-shadow-md"
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
            {user ? (
              <>
                <Link
                  href="/home"
                  className="block px-5 py-3 text-sm transition-colors hover:bg-nc-surface-container"
                >
                  Home
                </Link>
                <Link
                  href="/events/new"
                  className="block px-5 py-3 text-sm transition-colors hover:bg-nc-surface-container"
                >
                  New Event
                </Link>
                <Link
                  href={user.username ? `/profile/${user.username}` : "#"}
                  className="block px-5 py-3 text-sm transition-colors hover:bg-nc-surface-container"
                >
                  Public Profile
                </Link>
                <Link
                  href="/events"
                  className="block px-5 py-3 text-sm transition-colors hover:bg-nc-surface-container"
                >
                  Profile Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full px-5 py-3 text-left text-sm transition-colors hover:bg-nc-surface-container"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="block px-5 py-3 text-sm transition-colors hover:bg-nc-surface-container"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Discovery Feed ── */}
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
                {card.category}
              </span>
              {card.href ? (
                <Link href={card.href}>
                  <h2 className="mb-3 font-serif text-4xl italic leading-tight text-white">
                    {card.title}
                  </h2>
                </Link>
              ) : (
                <h2 className="mb-3 font-serif text-4xl italic leading-tight text-white">
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
      <div className="fixed bottom-8 right-5 z-50 flex flex-col gap-4">
        {/* Map toggle */}
        <Link
          href="/explore"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white/50 text-nc-primary-container shadow-2xl shadow-black/20 backdrop-blur-xl transition active:scale-90"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="text-current"
          >
            <path
              d="M15 3l6 3v15l-6-3M15 3l-6 3M15 3v15m0 0l-6-3M9 6L3 3v15l6 3M9 6v15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        {/* Filter */}
        <button className="flex h-14 w-14 items-center justify-center rounded-full bg-white/50 text-nc-primary-container shadow-2xl shadow-black/20 backdrop-blur-xl transition active:scale-90">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="text-current"
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
