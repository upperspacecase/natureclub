"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const ExploreMap = dynamic(() => import("@/components/ExploreMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-black">
      <span className="text-white/30">Loading map…</span>
    </div>
  ),
});

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

export default function DiscoveryPage() {
  // "feed" | "list" | "map"
  const [view, setView] = useState("feed");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative mx-auto h-[100dvh] w-full max-w-[430px] overflow-hidden bg-black">
      {/* ── Top-right menu button ── */}
      <button
        onClick={() => setMenuOpen(true)}
        className="absolute top-6 right-5 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition hover:bg-black/50"
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

      {/* ── Navigation Menu Overlay ── */}
      {menuOpen && (
        <div className="absolute inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md">
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute top-6 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
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

          <nav className="flex flex-1 flex-col items-center justify-center gap-8">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="font-serif text-3xl italic text-white transition hover:text-white/70"
            >
              Home
            </Link>
            <Link
              href="/discovery"
              onClick={() => setMenuOpen(false)}
              className="font-serif text-3xl italic text-white transition hover:text-white/70"
            >
              Discovery
            </Link>
            <Link
              href="/profile"
              onClick={() => setMenuOpen(false)}
              className="font-serif text-3xl italic text-white transition hover:text-white/70"
            >
              Profile
            </Link>
          </nav>

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

      {/* ── Feed View ── */}
      {view === "feed" && (
        <div className="h-full snap-y snap-mandatory overflow-y-auto scrollbar-hide">
          {DISCOVERY_CARDS.map((card) => (
            <section
              key={card.id}
              className="relative h-[100dvh] snap-start overflow-hidden bg-black"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.image}
                alt={card.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

              <div className="absolute inset-0 z-10 flex flex-col justify-end px-6 pb-24">
                <span className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-white/60">
                  {card.number} / {card.category}
                </span>
                <h2 className="mb-3 font-serif text-4xl italic leading-tight text-white">
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
        </div>
      )}

      {/* ── List View ── */}
      {view === "list" && (
        <div className="flex h-full flex-col bg-black">
          <div className="px-5 pt-16 pb-4">
            <h1 className="font-serif text-2xl italic text-white">Nearby</h1>
          </div>
          <div className="flex-1 overflow-y-auto px-5 pb-24 scrollbar-hide">
            <div className="flex flex-col gap-3">
              {DISCOVERY_CARDS.map((card) => (
                <button
                  key={card.id}
                  className="flex items-center gap-4 border-b border-white/10 py-4 text-left transition hover:bg-white/5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.image}
                    alt={card.title}
                    className="h-16 w-16 shrink-0 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-white/40">
                      {card.category}
                    </span>
                    <h3 className="font-serif text-lg italic text-white truncate">
                      {card.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-white/50">
                      {card.distance}
                    </p>
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="shrink-0 text-white/30"
                  >
                    <path
                      d="M6 3l5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Map View ── */}
      {view === "map" && (
        <div className="h-full w-full">
          <ExploreMap events={[]} userLocation={null} />
        </div>
      )}

      {/* ── Bottom FABs ── */}
      <div className="absolute right-5 bottom-8 z-40 flex flex-col gap-3">
        <button
          onClick={() => setView(view === "map" ? "feed" : "map")}
          className={`flex h-14 w-14 items-center justify-center rounded-full shadow-2xl shadow-black/30 backdrop-blur-xl transition active:scale-90 ${
            view === "map" ? "bg-white text-black" : "bg-white/15 text-white"
          }`}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
          >
            {view === "map" ? (
              <path
                d="M4 6h16M6 12h12M8 18h8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"
                fill="currentColor"
              />
            )}
          </svg>
        </button>
        <button
          onClick={() => setView(view === "list" ? "feed" : "list")}
          className={`flex h-14 w-14 items-center justify-center rounded-full shadow-2xl shadow-black/30 backdrop-blur-xl transition active:scale-90 ${
            view === "list" ? "bg-white text-black" : "bg-white/15 text-white"
          }`}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
          >
            {view === "list" ? (
              <path
                d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            ) : (
              <path
                d="M4 6h16M6 12h12M8 18h8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}
