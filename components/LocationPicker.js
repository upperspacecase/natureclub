"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Map, { Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const inputClass =
    "w-full rounded-[5px] border border-white/35 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/60 outline-none focus:border-white/70";

/**
 * Location picker with Mapbox geocoding search + expandable pin-drop map.
 *
 * Props:
 *  - value      : { description: string, lat: number|null, lng: number|null }
 *  - onChange    : (loc: { description, lat, lng }) => void
 */
export default function LocationPicker({ value, onChange }) {
    const [query, setQuery] = useState(value?.description || "");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [mapOpen, setMapOpen] = useState(false);
    const [viewState, setViewState] = useState({
        longitude: value?.lng || -98.5,
        latitude: value?.lat || 39.8,
        zoom: value?.lat ? 13 : 3,
    });

    const debounceRef = useRef(null);
    const containerRef = useRef(null);
    const longPressRef = useRef(null);

    // Sync external value changes
    useEffect(() => {
        if (value?.description && value.description !== query) {
            setQuery(value.description);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value?.description, query]);

    // Close suggestions on outside click
    useEffect(() => {
        function handleClick(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // Geocode search with debounce
    const searchPlaces = useCallback((text) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!text.trim() || text.trim().length < 3) {
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
                    setShowSuggestions(true);
                }
            } catch (err) {
                console.error("Geocoding error:", err);
            }
        }, 350);
    }, []);

    function handleInputChange(e) {
        const text = e.target.value;
        setQuery(text);
        searchPlaces(text);

        // Also update parent with text only (no coords yet)
        onChange({ description: text, lat: value?.lat || null, lng: value?.lng || null });
    }

    function handleSelectSuggestion(suggestion) {
        setQuery(suggestion.fullAddress);
        setShowSuggestions(false);
        setSuggestions([]);
        onChange({
            description: suggestion.fullAddress,
            lat: suggestion.lat,
            lng: suggestion.lng,
        });
        // Center map on selection
        setViewState({
            longitude: suggestion.lng,
            latitude: suggestion.lat,
            zoom: 14,
        });
    }

    // Reverse geocode pin location
    async function reverseGeocode(lat, lng) {
        try {
            const url = `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&limit=1&access_token=${MAPBOX_TOKEN}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.features?.[0]) {
                return data.features[0].properties.full_address || data.features[0].properties.name;
            }
        } catch (err) {
            console.error("Reverse geocoding error:", err);
        }
        return null;
    }

    // Handle map click — drop/move pin
    async function handleMapClick(e) {
        const { lng, lat } = e.lngLat;
        const address = await reverseGeocode(lat, lng);
        const desc = address || query || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

        setQuery(desc);
        onChange({ description: desc, lat, lng });
    }

    // Long-press support for touch devices
    function handleTouchStart(e) {
        const _touch = e.touches[0];
        longPressRef.current = setTimeout(() => {
            // Simulate a click via the map's onClick
        }, 500);
    }

    function handleTouchEnd() {
        if (longPressRef.current) clearTimeout(longPressRef.current);
    }

    return (
        <div ref={containerRef} className="relative">
            {/* Search input */}
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder="Search for a location..."
                    className={inputClass}
                />
                {/* Search icon */}
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
                    🔍
                </span>
            </div>

            {/* Autocomplete dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-white/15 bg-[#1c1917] shadow-xl">
                    {suggestions.map((s, i) => (
                        <li key={i}>
                            <button
                                type="button"
                                onClick={() => handleSelectSuggestion(s)}
                                className="flex w-full items-start gap-2 px-4 py-3 text-left text-sm transition-colors hover:bg-white/10"
                            >
                                <span className="mt-0.5 shrink-0 text-white/40">📍</span>
                                <div>
                                    <p className="font-medium text-white">{s.name}</p>
                                    {s.fullAddress !== s.name && (
                                        <p className="text-xs text-white/50">{s.fullAddress}</p>
                                    )}
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {/* Map toggle */}
            <button
                type="button"
                onClick={() => setMapOpen(!mapOpen)}
                className="mt-2 flex items-center gap-1.5 text-xs text-white/50 transition-colors hover:text-white/80"
            >
                <span>{mapOpen ? "▾" : "▸"}</span>
                <span>📍 {mapOpen ? "Hide map" : "Drop a pin on map"}</span>
            </button>

            {/* Expandable map */}
            {mapOpen && MAPBOX_TOKEN && (
                <div
                    className="nc-map-container mt-3 overflow-hidden rounded-xl border border-white/15"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    <Map
                        {...viewState}
                        onMove={(e) => setViewState(e.viewState)}
                        onClick={handleMapClick}
                        style={{ width: "100%", height: 280 }}
                        mapStyle="mapbox://styles/mapbox/dark-v11"
                        mapboxAccessToken={MAPBOX_TOKEN}
                        attributionControl={false}
                    >
                        {/* Pin marker */}
                        {value?.lat && value?.lng && (
                            <Marker
                                longitude={value.lng}
                                latitude={value.lat}
                                anchor="bottom"
                            >
                                <div className="flex flex-col items-center">
                                    <div className="text-2xl drop-shadow-lg">📍</div>
                                    <div className="h-1 w-3 rounded-full bg-black/30 blur-[2px]" />
                                </div>
                            </Marker>
                        )}
                    </Map>
                    <p className="px-3 py-2 text-[10px] text-white/30">
                        Click anywhere on the map to drop a pin
                    </p>
                </div>
            )}

            {/* No token warning */}
            {mapOpen && !MAPBOX_TOKEN && (
                <div className="mt-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-300">
                    Mapbox token not configured. Add <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> to your <code>.env.local</code> file.
                </div>
            )}
        </div>
    );
}
