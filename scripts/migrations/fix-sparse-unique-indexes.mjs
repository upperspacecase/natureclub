/**
 * Fix non-sparse unique indexes on the users collection.
 *
 * The User schema declares email/phone/username/firebaseUid as
 * `unique: true, sparse: true`, but the indexes that exist in MongoDB
 * were created before `sparse` was added, and Mongoose never rebuilds
 * existing indexes. A non-sparse unique index treats every missing
 * value as null, so the second user without a phone number fails with
 * E11000 — which breaks sign-up for every new user.
 *
 * Usage:  node scripts/migrations/fix-sparse-unique-indexes.mjs
 *
 * Safe to re-run — skips indexes that are already sparse, and refuses
 * to rebuild an index if duplicate non-null values exist.
 */

import { readFile } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load env ──
const envPath = resolve(__dirname, "../../.env.local");
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
const db = mongoose.connection.db;
console.log("Connected. Database:", db.databaseName);

const users = db.collection("users");
const FIELDS = ["email", "phone", "username", "firebaseUid"];

const indexes = await users.indexes();
console.log(
    "Current indexes:",
    indexes.map((i) => `${i.name}(unique:${!!i.unique},sparse:${!!i.sparse})`).join(", ")
);

for (const field of FIELDS) {
    const idx = indexes.find(
        (i) => i.key && i.key[field] === 1 && Object.keys(i.key).length === 1
    );
    if (!idx) {
        console.log(`- ${field}: no single-field index found, skipping`);
        continue;
    }
    if (!idx.unique) {
        console.log(`- ${field}: index ${idx.name} not unique, skipping`);
        continue;
    }
    if (idx.sparse) {
        console.log(`- ${field}: index ${idx.name} already sparse, OK`);
        continue;
    }

    // Refuse to rebuild if real duplicate values exist
    const dupes = await users
        .aggregate([
            { $match: { [field]: { $ne: null } } },
            { $group: { _id: `$${field}`, n: { $sum: 1 } } },
            { $match: { n: { $gt: 1 } } },
            { $limit: 1 },
        ])
        .toArray();
    if (dupes.length > 0) {
        console.log(
            `- ${field}: DUPLICATE non-null values exist, NOT rebuilding. Resolve duplicates first.`
        );
        continue;
    }

    await users.dropIndex(idx.name);
    await users.createIndex({ [field]: 1 }, { unique: true, sparse: true });
    console.log(`- ${field}: rebuilt ${idx.name} as unique+sparse`);
}

const after = await users.indexes();
console.log(
    "Indexes now:",
    after.map((i) => `${i.name}(unique:${!!i.unique},sparse:${!!i.sparse})`).join(", ")
);
console.log("User count:", await users.countDocuments());

await mongoose.disconnect();
