"use client";

import { useMemo, useState, useCallback } from "react";
import Map, { Marker, Popup, Source, Layer } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// 1.6 km ≈ 20 min walk
const RADIUS_KM = 1.6;
const RADIUS_DEG = RADIUS_KM / 111.32;

function circleGeoJSON(center, radiusDeg, steps = 64) {
    const coords = [];
    for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * 2 * Math.PI;
        coords.push([
            center[0] + radiusDeg * Math.cos(angle),
            center[1] + radiusDeg * Math.sin(angle) * (1 / Math.cos((center[1] * Math.PI) / 180)),
        ]);
    }
    return {
        type: "Feature",
        geometry: { type: "Polygon", coordinates: [coords] },
    };
}

function markerColor(spotsLeft, groupSize) {
    const pct = spotsLeft / groupSize;
    if (pct <= 0) return "#ef4444"; // red — full
    if (pct <= 0.3) return "#eab308"; // yellow — almost full
    return "#22c55e"; // green — spots available
}

function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });
}

/**
 * Explore map with event markers and walkable-radius circle.
 *
 * Props:
 *  - events       : array of explore event objects
 *  - userLocation : { lat, lng } | null
 */
export default function ExploreMap({ events, userLocation }) {
    const [selectedEvent, setSelectedEvent] = useState(null);

    const center = useMemo(
        () =>
            userLocation
                ? { lng: userLocation.lng, lat: userLocation.lat }
                : { lng: -9.4151, lat: 38.9634 }, // Ericeira default
        [userLocation]
    );

    const circleData = useMemo(
        () =>
            userLocation
                ? circleGeoJSON(
                    [userLocation.lng, userLocation.lat],
                    RADIUS_DEG
                )
                : null,
        [userLocation]
    );

    const handleMarkerClick = useCallback((event) => {
        setSelectedEvent(event);
    }, []);

    if (!MAPBOX_TOKEN) {
        return (
            <div className="flex h-full items-center justify-center bg-black text-white/40">
                <div className="text-center">
                    <p className="text-sm font-medium text-white/40">Map</p>
                    <p className="mt-2 text-sm">
                        Mapbox token not configured. Add{" "}
                        <code className="text-white/60">
                            NEXT_PUBLIC_MAPBOX_TOKEN
                        </code>{" "}
                        to your <code className="text-white/60">.env.local</code>{" "}
                        file.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <Map
            initialViewState={{
                longitude: center.lng,
                latitude: center.lat,
                zoom: userLocation ? 14 : 12,
            }}
            style={{ width: "100%", height: "100%" }}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            mapboxAccessToken={MAPBOX_TOKEN}
            attributionControl={false}
        >
            {/* Walkable radius circle */}
            {circleData && (
                <Source id="radius-circle" type="geojson" data={circleData}>
                    <Layer
                        id="radius-fill"
                        type="fill"
                        paint={{
                            "fill-color": "#22c55e",
                            "fill-opacity": 0.08,
                        }}
                    />
                    <Layer
                        id="radius-stroke"
                        type="line"
                        paint={{
                            "line-color": "#22c55e",
                            "line-width": 1.5,
                            "line-opacity": 0.3,
                            "line-dasharray": [4, 3],
                        }}
                    />
                </Source>
            )}

            {/* User location dot */}
            {userLocation && (
                <Marker
                    longitude={userLocation.lng}
                    latitude={userLocation.lat}
                    anchor="center"
                >
                    <div className="relative">
                        <div className="h-3 w-3 rounded-full border-2 border-white bg-blue-500 shadow-lg" />
                        <div className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-40" />
                    </div>
                </Marker>
            )}

            {/* Event markers */}
            {events.map((event) => (
                <Marker
                    key={event.id}
                    longitude={event.meetingPoint.lng}
                    latitude={event.meetingPoint.lat}
                    anchor="bottom"
                    onClick={(e) => {
                        e.originalEvent.stopPropagation();
                        handleMarkerClick(event);
                    }}
                >
                    <div
                        className="flex cursor-pointer flex-col items-center transition-transform hover:scale-110"
                        title={event.title}
                    >
                        <div
                            className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-lg"
                            style={{
                                backgroundColor: markerColor(
                                    event.spotsLeft,
                                    event.groupSize
                                ),
                            }}
                        >
                            {formatTime(event.dateTime)}
                        </div>
                        <div
                            className="mt-0.5 h-0 w-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent"
                            style={{
                                borderTopColor: markerColor(
                                    event.spotsLeft,
                                    event.groupSize
                                ),
                            }}
                        />
                    </div>
                </Marker>
            ))}

            {/* Popup for selected event */}
            {selectedEvent && (
                <Popup
                    longitude={selectedEvent.meetingPoint.lng}
                    latitude={selectedEvent.meetingPoint.lat}
                    anchor="bottom"
                    offset={24}
                    closeOnClick={false}
                    onClose={() => setSelectedEvent(null)}
                    className="explore-popup"
                >
                    <div className="w-52">
                        {selectedEvent.coverPhotoUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={selectedEvent.coverPhotoUrl}
                                alt=""
                                className="h-24 w-full rounded-t-lg object-cover"
                            />
                        )}
                        <div className="p-2.5">
                            <h4 className="font-serif text-sm font-semibold leading-tight text-stone-900">
                                {selectedEvent.title}
                            </h4>
                            <p className="mt-1 text-xs text-stone-500">
                                {formatTime(selectedEvent.dateTime)}
                                {selectedEvent.activityType &&
                                    ` · ${selectedEvent.activityType.replace(/-/g, " ")}`}
                            </p>
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-xs text-stone-400">
                                    {selectedEvent.spotsLeft} /{" "}
                                    {selectedEvent.groupSize} spots
                                </span>
                                {selectedEvent.slug && (
                                    <a
                                        href={`/e/${selectedEvent.slug}`}
                                        className="rounded-full bg-stone-900 px-3 py-1 text-[10px] font-semibold text-white transition hover:bg-stone-700"
                                    >
                                        View →
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </Popup>
            )}
        </Map>
    );
}
