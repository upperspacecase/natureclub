/**
 * Manual CLI run of the NYC Parks event import.
 * Logic lives in libs/nyc-parks-import.js (shared with the weekly cron at
 * /api/cron/import-events).
 *
 * Usage:  node scripts/import-nyc-parks-events.mjs
 *
 * Run scripts/backfill-covers.mjs afterwards to upgrade the default cover
 * images to real photos.
 */

import { readFile } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { importParksEvents } from "../libs/nyc-parks-import.js";

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

await mongoose.connect(process.env.MONGODB_URI);
const result = await importParksEvents(mongoose.connection.db);
console.log(
    `Dataset rows: ${result.totalRows} | aligned: ${result.aligned} | selected: ${result.selected} | created: ${result.created} | updated: ${result.updated}`
);
await mongoose.disconnect();
