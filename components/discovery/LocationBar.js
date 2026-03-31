"use client";

import { useState, useCallback, useRef } from "react";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function LocationBar({
  location,
  loading,
  onLocationChange,
  onRequestGeolocation,
}) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  const searchPlaces = useCallback((text) => {
    clearTimeout(debounceRef.current);
    if (!text || text.length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(
          text
        )}&limit=5&access_token=${MAPBOX_TOKEN}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.features) {
          setSuggestions(
            data.features.map((f) => ({
              name: f.properties.name || f.properties.full_address,
              fullAddress: f.properties.full_address,
              lat: f.geometry.coordinates[1],
              lng: f.geometry.coordinates[0],
            }))
          );
        }
      } catch (err) {
        console.error("Geocoding error:", err);
      }
    }, 350);
  }, []);

  function handleSelect(suggestion) {
    const loc = {
      lat: suggestion.lat,
      lng: suggestion.lng,
      name: suggestion.fullAddress || suggestion.name,
    };
    onLocationChange(loc);
    setQuery("");
    setSuggestions([]);
    setExpanded(false);
  }

  function handleUseMyLocation() {
    onRequestGeolocation();
    setQuery("");
    setSuggestions([]);
    setExpanded(false);
  }

  function handleExpand() {
    setExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleClose() {
    setExpanded(false);
    setQuery("");
    setSuggestions([]);
  }

  if (expanded) {
    return (
      <div className="flex flex-col gap-0">
        <div className="flex items-center gap-2 rounded-t-xl bg-black/80 px-3 py-2.5 backdrop-blur-xl">
          {/* Search icon */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className="shrink-0 text-white/40"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M16 16l4.5 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              searchPlaces(e.target.value);
            }}
            placeholder="Search a city or area..."
            className="flex-1 bg-transparent text-sm text-white placeholder-white/40 outline-none"
          />
          <button
            onClick={handleClose}
            className="text-white/40 transition hover:text-white/70"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Suggestions dropdown */}
        <div className="max-h-64 overflow-y-auto rounded-b-xl bg-black/80 backdrop-blur-xl">
          <button
            onClick={handleUseMyLocation}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-white/70 transition hover:bg-white/10"
          >
            {/* Crosshair icon */}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              className="shrink-0 text-white/50"
            >
              <circle
                cx="12"
                cy="12"
                r="4"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M12 2v4M12 18v4M2 12h4M18 12h4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Use my location
          </button>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSelect(s)}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-white/70 transition hover:bg-white/10"
            >
              {/* Pin icon */}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                className="shrink-0 text-white/40"
              >
                <path
                  d="M12 21s-6-5.69-6-10A6 6 0 0118 11c0 4.31-6 10-6 10z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle
                  cx="12"
                  cy="11"
                  r="2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
              <span className="truncate">{s.fullAddress || s.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Collapsed state
  return (
    <button
      onClick={handleExpand}
      className="inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-2 backdrop-blur-xl transition active:scale-95"
    >
      {/* Pin icon */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        className="shrink-0 text-white/50"
      >
        <path
          d="M12 21s-6-5.69-6-10A6 6 0 0118 11c0 4.31-6 10-6 10z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle
          cx="12"
          cy="11"
          r="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
      <span className="max-w-[200px] truncate text-xs font-medium tracking-wide text-white/70">
        {loading
          ? "Finding location..."
          : location?.name || "Set your location"}
      </span>
    </button>
  );
}
