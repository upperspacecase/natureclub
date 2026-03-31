"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NavMenu({ user }) {
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
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setMenuOpen(true)}
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

      {/* Full-page overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black">
          {/* Close button */}
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute right-5 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="text-white"
            >
              <path
                d="M2 2l12 12M14 2L2 14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Nav links */}
          <nav className="flex flex-1 flex-col items-center justify-center gap-8">
            {user ? (
              <>
                <Link
                  href="/home"
                  className="font-serif text-3xl italic text-white transition hover:text-white/70"
                >
                  Home
                </Link>
                <Link
                  href="/discovery"
                  className="font-serif text-3xl italic text-white transition hover:text-white/70"
                >
                  Discovery
                </Link>
                <Link
                  href="/events/new"
                  className="font-serif text-3xl italic text-white transition hover:text-white/70"
                >
                  New Event
                </Link>
                <Link
                  href={user.username ? `/profile/${user.username}` : "#"}
                  className="font-serif text-3xl italic text-white transition hover:text-white/70"
                >
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="font-serif text-3xl italic text-white/50 transition hover:text-white/70"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/discovery"
                  className="font-serif text-3xl italic text-white transition hover:text-white/70"
                >
                  Discovery
                </Link>
                <Link
                  href="/signin"
                  className="font-serif text-3xl italic text-white transition hover:text-white/70"
                >
                  Sign In
                </Link>
              </>
            )}
          </nav>

          {/* Logo footer */}
          <div className="flex justify-center pb-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-light.svg"
              alt="Nature Club"
              className="h-5 w-auto opacity-40"
            />
          </div>
        </div>
      )}
    </>
  );
}
