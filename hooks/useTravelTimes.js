"use client";

import { useEffect, useState, useRef } from "react";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const BATCH_SIZE = 24; // Matrix API: 25 coords max = 1 origin + 24 dests

async function fetchMatrix(profile, originLng, originLat, destinations) {
  const coords = [`${originLng},${originLat}`];
  destinations.forEach((d) => coords.push(`${d.lng},${d.lat}`));

  const url = `https://api.mapbox.com/directions-matrix/v1/mapbox/${profile}/${coords.join(
    ";"
  )}?sources=0&annotations=duration&access_token=${MAPBOX_TOKEN}`;

  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  // durations[0] is the row from origin to all destinations
  return data.durations?.[0]?.slice(1) ?? null; // slice(1) to skip origin-to-origin
}

export default function useTravelTimes(userLocation, destinations) {
  const [travelTimes, setTravelTimes] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!userLocation || !destinations || destinations.length === 0) {
      setTravelTimes(new Map());
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);

      const results = new Map();
      const batches = [];

      for (let i = 0; i < destinations.length; i += BATCH_SIZE) {
        batches.push(destinations.slice(i, i + BATCH_SIZE));
      }

      for (const batch of batches) {
        const [walkDurations, driveDurations] = await Promise.all([
          fetchMatrix("walking", userLocation.lng, userLocation.lat, batch),
          fetchMatrix("driving", userLocation.lng, userLocation.lat, batch),
        ]);

        batch.forEach((dest, i) => {
          const walkSec = walkDurations?.[i];
          const driveSec = driveDurations?.[i];
          results.set(dest.id, {
            walkMin:
              walkSec != null ? Math.round(walkSec / 60) : null,
            driveMin:
              driveSec != null ? Math.round(driveSec / 60) : null,
          });
        });
      }

      setTravelTimes(results);
      setLoading(false);
    }, 500);

    return () => clearTimeout(debounceRef.current);
  }, [userLocation, destinations]);

  return { travelTimes, loading };
}
