"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Map, { Marker, Popup } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { SPOT_CATEGORIES, SPOT_CATEGORY_STYLES } from "@/data/events";
import apiClient from "@/libs/api";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Bali center
const BALI_CENTER = { lat: -8.42, lng: 115.23 };

const SPOT_EMOJI = {
    beach: "",
    waterfall: "",
    viewpoint: "",
    trail: "",
    lake: "",
    "hot-spring": "",
    "rice-terrace": "",
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

const EXPERIENCE_COLOR = "#c26b3a";

const FILTER_TYPES = [
    { id: "all", label: "All", emoji: "" },
    { id: "experiences", label: "Experiences", emoji: "" },
    { id: "spots", label: "Spots", emoji: "" },
];

const formatTag = (value = "") =>
    value
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");

const DiscoverSection = ({ spots }) => {
    const [activeFilter, setActiveFilter] = useState("all");
    const [activeCategory, setActiveCategory] = useState("all");
    const [selectedItem, setSelectedItem] = useState(null);
    const [experiences, setExperiences] = useState([]);

    // Fetch experiences from API
    useEffect(() => {
        const fetchExperiences = async () => {
            try {
                const res = await apiClient.get("/events/explore");
                if (res?.events) {
                    setExperiences(res.events);
                }
            } catch (err) {
                console.error("Failed to load experiences:", err);
            }
        };
        fetchExperiences();
    }, []);

    // Filter spots by category
    const filteredSpots = useMemo(() => {
        if (activeFilter === "experiences") return [];
        if (activeCategory === "all") return spots;
        return spots.filter((spot) => spot.categoryTag === activeCategory);
    }, [spots, activeFilter, activeCategory]);

    // Filter experiences (show/hide)
    const filteredExperiences = useMemo(() => {
        if (activeFilter === "spots") return [];
        return experiences.filter((e) => e.meetingPoint?.lat && e.meetingPoint?.lng);
    }, [experiences, activeFilter]);

    // Mappable spots
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

    const totalCount = spots.length + experiences.length;
    const visibleCount = mappableSpots.length + filteredExperiences.length;

    const handleMarkerClick = useCallback((item) => {
        setSelectedItem(item);
    }, []);

    if (!spots?.length && !experiences?.length) return null;

    return (
        <section className="bg-black px-6 py-16 text-white md:px-10 md:py-20">
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <div className="mb-8 text-center md:mb-10">
                    <h2 className="font-serif text-2xl leading-tight sm:text-3xl">
                        Discover Bali
                    </h2>
                    <p className="mt-2 text-sm text-white/50">
                        {spots.length} spots · {experiences.length} upcoming experiences
                    </p>
                </div>

                {/* Type filter (All / Experiences / Spots) */}
                <div className="mb-3 flex flex-wrap justify-center gap-2">
                    {FILTER_TYPES.map((ft) => (
                        <button
                            key={ft.id}
                            type="button"
                            onClick={() => {
                                setActiveFilter(ft.id);
                                if (ft.id === "experiences") setActiveCategory("all");
                            }}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeFilter === ft.id
                                ? "bg-white text-black"
                                : "border border-white/20 bg-white/[0.04] text-white/70 hover:border-white/40 hover:text-white"
                                }`}
                        >
                            {ft.emoji} {ft.label}
                        </button>
                    ))}
                </div>

                {/* Category filter pills (only when spots are visible) */}
                {activeFilter !== "experiences" && (
                    <div className="mb-6 flex flex-wrap justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveCategory("all")}
                            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${activeCategory === "all"
                                ? "bg-white/20 text-white"
                                : "border border-white/10 bg-white/[0.02] text-white/50 hover:border-white/30 hover:text-white/70"
                                }`}
                        >
                            All spots
                        </button>
                        {activeCategories.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() =>
                                    setActiveCategory(
                                        activeCategory === cat.id ? "all" : cat.id
                                    )
                                }
                                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${activeCategory === cat.id
                                    ? "bg-white/20 text-white"
                                    : "border border-white/10 bg-white/[0.02] text-white/50 hover:border-white/30 hover:text-white/70"
                                    }`}
                            >
                                {cat.emoji} {cat.label}
                            </button>
                        ))}
                    </div>
                )}

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
                                {/* Spot markers */}
                                {mappableSpots.map((spot) => {
                                    const color =
                                        MARKER_COLORS[spot.categoryTag] || "#22c55e";
                                    const label =
                                        spot.categoryTag ? formatTag(spot.categoryTag).charAt(0) : "S";

                                    return (
                                        <Marker
                                            key={`spot-${spot.id}`}
                                            longitude={spot.location.lng}
                                            latitude={spot.location.lat}
                                            anchor="bottom"
                                            onClick={(e) => {
                                                e.originalEvent.stopPropagation();
                                                handleMarkerClick({
                                                    ...spot,
                                                    _type: "spot",
                                                });
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
                                                    {label}
                                                </div>
                                                <div
                                                    className="mt-0.5 h-0 w-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent"
                                                    style={{ borderTopColor: color }}
                                                />
                                            </div>
                                        </Marker>
                                    );
                                })}

                                {/* Experience markers */}
                                {filteredExperiences.map((exp) => {
                                    const time = new Date(exp.dateTime).toLocaleTimeString(
                                        "en-US",
                                        { hour: "numeric", minute: "2-digit" }
                                    );

                                    return (
                                        <Marker
                                            key={`exp-${exp.id}`}
                                            longitude={exp.meetingPoint.lng}
                                            latitude={exp.meetingPoint.lat}
                                            anchor="bottom"
                                            onClick={(e) => {
                                                e.originalEvent.stopPropagation();
                                                handleMarkerClick({ ...exp, _type: "experience" });
                                            }}
                                        >
                                            <div
                                                className="flex cursor-pointer flex-col items-center transition-transform hover:scale-110"
                                                title={exp.title}
                                            >
                                                <div
                                                    className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-lg"
                                                    style={{ backgroundColor: EXPERIENCE_COLOR }}
                                                >
                                                    {time}
                                                </div>
                                                <div
                                                    className="mt-0.5 h-0 w-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent"
                                                    style={{ borderTopColor: EXPERIENCE_COLOR }}
                                                />
                                            </div>
                                        </Marker>
                                    );
                                })}

                                {/* Popup */}
                                {selectedItem &&
                                    (selectedItem._type === "spot"
                                        ? selectedItem.location
                                        : selectedItem.meetingPoint) && (
                                        <Popup
                                            longitude={
                                                selectedItem._type === "spot"
                                                    ? selectedItem.location.lng
                                                    : selectedItem.meetingPoint.lng
                                            }
                                            latitude={
                                                selectedItem._type === "spot"
                                                    ? selectedItem.location.lat
                                                    : selectedItem.meetingPoint.lat
                                            }
                                            anchor="bottom"
                                            offset={24}
                                            closeOnClick={false}
                                            onClose={() => setSelectedItem(null)}
                                            className="explore-popup"
                                        >
                                            <div className="w-56">
                                                {/* Spot image */}
                                                {selectedItem._type === "spot" && selectedItem.image && (
                                                    <img
                                                        src={selectedItem.image}
                                                        alt={selectedItem.title}
                                                        className="h-28 w-full rounded-t object-cover"
                                                    />
                                                )}
                                                <div className="p-3">
                                                    <h4 className="font-serif text-sm font-semibold leading-tight text-stone-900">
                                                        {selectedItem.title}
                                                    </h4>

                                                    {selectedItem._type === "spot" ? (
                                                        <>
                                                            {selectedItem.region && (
                                                                <p className="mt-1 text-xs text-stone-500">
                                                                    {selectedItem.region}
                                                                </p>
                                                            )}
                                                            {selectedItem.description && (
                                                                <p className="mt-2 text-xs leading-relaxed text-stone-600">
                                                                    {selectedItem.description}
                                                                </p>
                                                            )}
                                                            <div className="mt-2">
                                                                <span
                                                                    className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-medium ${SPOT_CATEGORY_STYLES[
                                                                        selectedItem.categoryTag
                                                                    ] || "bg-stone-200 text-stone-800"
                                                                        }`}
                                                                >
                                                                    {formatTag(selectedItem.categoryTag)}
                                                                </span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p className="mt-1 text-xs text-stone-500">
                                                                {new Date(
                                                                    selectedItem.dateTime
                                                                ).toLocaleDateString("en-US", {
                                                                    weekday: "short",
                                                                    month: "short",
                                                                    day: "numeric",
                                                                })}{" "}
                                                                ·{" "}
                                                                {new Date(
                                                                    selectedItem.dateTime
                                                                ).toLocaleTimeString("en-US", {
                                                                    hour: "numeric",
                                                                    minute: "2-digit",
                                                                })}
                                                            </p>
                                                            {selectedItem.activityType && (
                                                                <p className="mt-1 text-xs text-stone-400">
                                                                    {formatTag(selectedItem.activityType)}
                                                                </p>
                                                            )}
                                                            <div className="mt-2 flex items-center justify-between">
                                                                <span className="text-xs text-stone-400">
                                                                    {selectedItem.spotsLeft}/
                                                                    {selectedItem.groupSize} spots
                                                                </span>
                                                                {selectedItem.slug && (
                                                                    <a
                                                                        href={`/e/${selectedItem.slug}`}
                                                                        className="rounded-full bg-stone-900 px-3 py-1 text-[10px] font-semibold text-white transition hover:bg-stone-700"
                                                                    >
                                                                        View →
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </Popup>
                                    )}
                            </Map>
                        </div>
                    ) : (
                        <div className="flex h-[420px] items-center justify-center bg-white/[0.02] sm:h-[500px] lg:h-[560px]">
                            <div className="text-center">
                                <p className="text-sm font-medium text-white/40">Map</p>
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

                {/* Count below map */}
                <p className="mt-4 text-center text-xs text-white/30">
                    Showing {visibleCount} of {totalCount} items
                </p>
            </div>
        </section>
    );
};

export default DiscoverSection;
