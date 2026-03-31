"use client";

import { useEffect, useState, useCallback, useRef } from "react";

const STORAGE_KEY = "nc-discovery-location";
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

function loadCached() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > EXPIRY_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return { lat: parsed.lat, lng: parsed.lng, name: parsed.name };
  } catch {
    return null;
  }
}

function saveToStorage(loc) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...loc, ts: Date.now() })
    );
  } catch {}
}

async function reverseGeocode(lat, lng) {
  try {
    const url = `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&limit=1&access_token=${MAPBOX_TOKEN}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.features?.[0]) {
      return (
        data.features[0].properties.full_address ||
        data.features[0].properties.name
      );
    }
  } catch (err) {
    console.error("Reverse geocoding error:", err);
  }
  return `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
}

export default function useUserLocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const didInit = useRef(false);

  // On mount: check cache, then try browser geolocation
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const cached = loadCached();
    if (cached) {
      setLocation(cached);
      setLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const name = await reverseGeocode(lat, lng);
        const loc = { lat, lng, name };
        setLocation(loc);
        saveToStorage(loc);
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  const setManualLocation = useCallback((loc) => {
    setLocation(loc);
    saveToStorage(loc);
  }, []);

  const requestGeolocation = useCallback(async () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const name = await reverseGeocode(lat, lng);
        const loc = { lat, lng, name };
        setLocation(loc);
        saveToStorage(loc);
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 0 }
    );
  }, []);

  return { location, loading, setManualLocation, requestGeolocation };
}
