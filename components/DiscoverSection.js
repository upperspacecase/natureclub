"use client";

import { useState, useMemo, useCallback } from "react";
import Map, { Marker, Popup } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { SPOT_CATEGORIES, SPOT_CATEGORY_STYLES } from "@/data/events";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Bali center
const BALI_CENTER = { lat: -8.42, lng: 115.23 };

const SPOT_EMOJI = {
    beach: "🏖️",
    waterfall: "💧",
    viewpoint: "🏔️",
    trail: "🥾",
    lake: "🌊",
    "hot-spring": "♨️",
    "rice-terrace": "🌾",
};

const MARKER_COLORS = {
    beach: "#0e7490",
    waterfall: "#1d4ed8",
    viewpoint: "#b5842d",
    trail: "#4f6b3e",
    lake: "#0369a1",
    "hot-spring": "#dc2626",
    "rice-terrace": "#65a30d",
};

const formatTag = (value = "") =>
    value
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");

const DiscoverSection = ({ spots }) => {
    const [activeFilter, setActiveFilter] = useState("all");
    const [selectedSpot, setSelectedSpot] = useState(null);

    const filteredSpots = useMemo(() => {
        if (activeFilter === "all") return spots;
        return spots.filter((spot) => spot.categoryTag === activeFilter);
    }, [spots, activeFilter]);

    // Only spots with lat/lng
    const mappableSpots = useMemo(
        () => filteredSpots.filter((s) => s.location?.lat && s.location?.lng),
        [filteredSpots]
    );

    const categoryCounts = useMemo(() => {
        const counts = {};
        spots.forEach((spot) => {
            counts[spot.categoryTag] = (counts[spot.categoryTag] || 0) + 1;
        });
        return counts;
    }, [spots]);

    const activeCategories = useMemo(
        () => SPOT_CATEGORIES.filter((cat) => categoryCounts[cat.id]),
        [categoryCounts]
    );

    const handleMarkerClick = useCallback((spot) => {
        setSelectedSpot(spot);
    }, []);

    if (!spots?.length) return null;

    return (
        <section className="bg-black px-6 py-16 text-white md:px-10 md:py-20">
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <div className="mb-8 text-center md:mb-10">
                    <h2 className="font-serif text-2xl leading-tight sm:text-3xl">
                        Discover nature spots
                    </h2>
                    <p className="mt-2 text-sm text-white/50">
                        {spots.length} curated spots in Bali
                    </p>
                </div>

                {/* Category filter pills */}
                <div className="mb-6 flex flex-wrap justify-center gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveFilter("all")}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeFilter === "all"
                                ? "bg-white text-black"
                                : "border border-white/20 bg-white/[0.04] text-white/70 hover:border-white/40 hover:text-white"
                            }`}
                    >
                        All ({spots.length})
                    </button>
                    {activeCategories.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() =>
                                setActiveFilter(activeFilter === cat.id ? "all" : cat.id)
                            }
                            className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeFilter === cat.id
                                    ? "bg-white text-black"
                                    : "border border-white/20 bg-white/[0.04] text-white/70 hover:border-white/40 hover:text-white"
                                }`}
                        >
                            {cat.emoji} {cat.label} ({categoryCounts[cat.id]})
                        </button>
                    ))}
                </div>

                {/* Map */}
                <div className="overflow-hidden rounded-2xl border border-white/10">
                    {MAPBOX_TOKEN ? (
                        <div className="h-[420px] sm:h-[500px] lg:h-[560px] nc-map-container">
                            <Map
                                initialViewState={{
                                    longitude: BALI_CENTER.lng,
                                    latitude: BALI_CENTER.lat,
                                    zoom: 9,
                                }}
                                style={{ width: "100%", height: "100%" }}
                                mapStyle="mapbox://styles/mapbox/dark-v11"
                                mapboxAccessToken={MAPBOX_TOKEN}
                                attributionControl={false}
                            >
                                {mappableSpots.map((spot) => {
                                    const color = MARKER_COLORS[spot.categoryTag] || "#22c55e";
                                    const emoji = SPOT_EMOJI[spot.categoryTag] || "📍";

                                    return (
                                        <Marker
                                            key={spot.id}
                                            longitude={spot.location.lng}
                                            latitude={spot.location.lat}
                                            anchor="bottom"
                                            onClick={(e) => {
                                                e.originalEvent.stopPropagation();
                                                handleMarkerClick(spot);
                                            }}
                                        >
                                            <div
                                                className="flex cursor-pointer flex-col items-center transition-transform hover:scale-110"
                                                title={spot.title}
                                            >
                                                <div
                                                    className="rounded-full px-2 py-0.5 text-xs font-semibold text-white shadow-lg"
                                                    style={{ backgroundColor: color }}
                                                >
                                                    {emoji}
                                                </div>
                                                <div
                                                    className="mt-0.5 h-0 w-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent"
                                                    style={{ borderTopColor: color }}
                                                />
                                            </div>
                                        </Marker>
                                    );
                                })}

                                {/* Popup for selected spot */}
                                {selectedSpot && selectedSpot.location && (
                                    <Popup
                                        longitude={selectedSpot.location.lng}
                                        latitude={selectedSpot.location.lat}
                                        anchor="bottom"
                                        offset={24}
                                        closeOnClick={false}
                                        onClose={() => setSelectedSpot(null)}
                                        className="explore-popup"
                                    >
                                        <div className="w-52 p-3">
                                            <h4 className="font-serif text-sm font-semibold leading-tight text-stone-900">
                                                {selectedSpot.title}
                                            </h4>
                                            {selectedSpot.region && (
                                                <p className="mt-1 text-xs text-stone-500">
                                                    📍 {selectedSpot.region}
                                                </p>
                                            )}
                                            {selectedSpot.description && (
                                                <p className="mt-2 text-xs leading-relaxed text-stone-600">
                                                    {selectedSpot.description}
                                                </p>
                                            )}
                                            <div className="mt-2">
                                                <span
                                                    className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-medium ${SPOT_CATEGORY_STYLES[selectedSpot.categoryTag] ||
                                                        "bg-stone-200 text-stone-800"
                                                        }`}
                                                >
                                                    {SPOT_EMOJI[selectedSpot.categoryTag]}{" "}
                                                    {formatTag(selectedSpot.categoryTag)}
                                                </span>
                                            </div>
                                        </div>
                                    </Popup>
                                )}
                            </Map>
                        </div>
                    ) : (
                        <div className="flex h-[420px] items-center justify-center bg-white/[0.02] sm:h-[500px] lg:h-[560px]">
                            <div className="text-center">
                                <p className="text-4xl">🗺️</p>
                                <p className="mt-3 text-sm text-white/40">
                                    Map requires{" "}
                                    <code className="text-white/60">
                                        NEXT_PUBLIC_MAPBOX_TOKEN
                                    </code>
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Spot count below map */}
                <p className="mt-4 text-center text-xs text-white/30">
                    Showing {filteredSpots.length} of {spots.length} spots
                </p>
            </div>
        </section>
    );
};

export default DiscoverSection;
