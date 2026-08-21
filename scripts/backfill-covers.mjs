/**
 * One-shot cover photo backfill.
 *
 * Reads were previously fetching Unsplash images DURING page loads for any
 * event without a coverPhotoUrl (and retrying on every load when nothing was
 * found) — this script makes covers a write-time concern instead. Run it
 * after importing events.
 *
 * Usage:  node scripts/backfill-covers.mjs
 *
 * For each event missing a cover: try one Unsplash search (paced to respect
 * rate limits); on miss or missing key, fall back to a bundled default image
 * per activity type so no event is ever coverless.
 */

import { readFile } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load env ──
const envPath = resolve(__dirname, "../.env.local");
try {
    const envContent = await readFile(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return;
        const idx = trimmed.indexOf("=");
        if (idx === -1) return;
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) process.env[key] = val;
    });
} catch {
    console.log("No .env.local found, using existing env vars.\n");
}

if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI not set.");
    process.exit(1);
}

const DEFAULT_BY_TYPE = {
    "nature-walk": "/nc/img/1.png",
    hike: "/nc/img/7.png",
    "bird-walk": "/nc/img/12.png",
    "forest-bathing": "/nc/img/6.png",
    foraging: "/nc/img/13.png",
    "outdoor-yoga": "/nc/img/11.png",
    meditation: "/nc/img/14.png",
    other: "/nc/img/17.png",
};

async function unsplashSearch(query) {
    const key = process.env.UNSPLASH_ACCESS_KEY;
    if (!key) return null;
    const url = new URL("https://api.unsplash.com/search/photos");
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", "1");
    url.searchParams.set("orientation", "portrait");
    const res = await fetch(url, {
        headers: { Authorization: `Client-ID ${key}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.results?.[0]?.urls?.regular || null;
}

await mongoose.connect(process.env.MONGODB_URI);
const events = mongoose.connection.db.collection("bookingevents");

const missing = await events
    .find({
        $or: [
            { coverPhotoUrl: null },
            { coverPhotoUrl: "" },
            { coverPhotoUrl: { $exists: false } },
        ],
    })
    .project({ title: 1, activityType: 1 })
    .toArray();
console.log("events missing covers:", missing.length);

let unsplashed = 0;
let defaulted = 0;
for (const e of missing) {
    const query = [
        e.activityType && e.activityType !== "other"
            ? e.activityType.replace(/-/g, " ")
            : "nature outdoors",
        "new york park",
    ].join(" ");
    let url = null;
    try {
        url = await unsplashSearch(query);
    } catch {
        url = null;
    }
    if (url) unsplashed += 1;
    else {
        url = DEFAULT_BY_TYPE[e.activityType] || DEFAULT_BY_TYPE.other;
        defaulted += 1;
    }
    await events.updateOne({ _id: e._id }, { $set: { coverPhotoUrl: url } });
    await new Promise((r) => setTimeout(r, 400)); // pace Unsplash requests
}
console.log(`done: ${unsplashed} from Unsplash, ${defaulted} defaults`);

await mongoose.disconnect();
