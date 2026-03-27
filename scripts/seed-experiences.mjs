/**
 * Seed 12 Bali nature experiences into MongoDB as BookingEvents.
 *
 * Usage:  node scripts/seed-experiences.mjs
 *
 * Creates a system "Nature Club" user (if needed) and 12 public,
 * published BookingEvents with dates spread over the next 30 days.
 *
 * Safe to re-run — upserts by slug.
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

await mongoose.connect(process.env.MONGODB_URI);
console.log("✅ Connected to MongoDB.\n");

// ── Get or create system user ──
const User =
    mongoose.models.User ||
    mongoose.model("User", new mongoose.Schema({}, { strict: false, timestamps: true }));

let systemUser = await User.findOne({ phone: "+0000000000" });
if (!systemUser) {
    systemUser = await User.create({
        phone: "+0000000000",
        name: "Nature Club",
        username: "natureclub",
        hostingOn: true,
    });
    console.log("Created system user: Nature Club\n");
} else {
    console.log(`Using existing system user: ${systemUser._id}\n`);
}

// ── Experience templates (cycled across 30 days, 2 per day) ──
const now = new Date();
const makeDate = (dayOffset, hour) => {
    const d = new Date(now);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, 0, 0, 0);
    return d;
};

const templates = [
    {
        title: "Sunrise Yoga at Batu Bolong",
        activityType: "outdoor-yoga",
        description: "Start your day with a 75-minute vinyasa flow on the beach. Mats provided. Suitable for all levels. Stay for a smoothie bowl after.",
        difficulty: "easy",
        groupSize: 15,
        durationMinutes: 75,
        meetingPoint: { lat: -8.659482, lng: 115.130136, description: "Batu Bolong Beach, near the main entrance" },
        whatToBring: ["Water bottle", "Sunscreen", "Towel"],
        price: 100000,
        currency: "IDR",
        hour: 7,
    },
    {
        title: "Sekumpul Waterfall Trek",
        activityType: "hike",
        description: "A guided 4-hour trek to Bali's most spectacular waterfall. Steep descent through jungle. Swimming at the base. Lunch included.",
        difficulty: "moderate",
        groupSize: 8,
        durationMinutes: 240,
        meetingPoint: { lat: -8.171881, lng: 115.186212, description: "Sekumpul carpark" },
        whatToBring: ["Hiking shoes", "Swimsuit", "Dry bag", "Snacks"],
        price: 250000,
        currency: "IDR",
        hour: 8,
    },
    {
        title: "Rice Terrace Photography Walk",
        activityType: "nature-walk",
        description: "Golden hour photography session walking through Jatiluwih UNESCO rice terraces. Tips on composition and lighting. Camera or phone welcome.",
        difficulty: "easy",
        groupSize: 10,
        durationMinutes: 120,
        meetingPoint: { lat: -8.370094, lng: 115.131227, description: "Jatiluwih main entrance" },
        whatToBring: ["Camera/phone", "Hat", "Water"],
        price: 150000,
        currency: "IDR",
        hour: 16,
    },
    {
        title: "Forest Bathing in Ubud",
        activityType: "forest-bathing",
        description: "A slow, meditative walk through the monkey forest with guided breathwork and nature connection exercises. 90 minutes of deep presence.",
        difficulty: "easy",
        groupSize: 12,
        durationMinutes: 90,
        meetingPoint: { lat: -8.518703, lng: 115.258761, description: "Ubud Monkey Forest south entrance" },
        whatToBring: ["Comfortable shoes", "Bug spray"],
        price: 175000,
        currency: "IDR",
        hour: 9,
    },
    {
        title: "Birdwatching at Lake Tamblingan",
        activityType: "bird-walk",
        description: "Early morning birdwatching around the twin lakes with a local ornithologist. Binoculars provided. Expect 20+ species including kingfishers and raptors.",
        difficulty: "easy",
        groupSize: 6,
        durationMinutes: 150,
        meetingPoint: { lat: -8.257059, lng: 115.09701, description: "Lake Tamblingan temple parking" },
        whatToBring: ["Long sleeves", "Notebook", "Quiet shoes"],
        price: 200000,
        currency: "IDR",
        hour: 6,
    },
    {
        title: "Cliff Jumping at Aling-Aling",
        activityType: "hike",
        description: "Visit a complex of 4 waterfalls with cliff jumping from 3m to 14m. Natural waterslides. Guide handles safety. Not for the faint-hearted!",
        difficulty: "hard",
        groupSize: 8,
        durationMinutes: 180,
        meetingPoint: { lat: -8.174612, lng: 115.104728, description: "Aling-Aling Waterfall entrance" },
        whatToBring: ["Swimsuit", "Water shoes", "GoPro"],
        price: 175000,
        currency: "IDR",
        hour: 10,
    },
    {
        title: "Mount Batur Sunrise Hike",
        activityType: "hike",
        description: "Classic 2am start for sunrise from the rim of Batur volcano. Guided trek, breakfast cooked on volcanic steam vents. Views of Agung and the crater lake.",
        difficulty: "moderate",
        groupSize: 12,
        durationMinutes: 300,
        meetingPoint: { lat: -8.282639, lng: 115.364307, description: "Batur trailhead carpark" },
        whatToBring: ["Headlamp", "Warm layer", "Hiking shoes", "Snacks"],
        price: 350000,
        currency: "IDR",
        hour: 2,
    },
    {
        title: "Meditation & Hot Springs",
        activityType: "meditation",
        description: "Guided meditation in the garden, followed by a soak in the natural mineral pools of Banjar. Massage optional. Pure relaxation.",
        difficulty: "easy",
        groupSize: 10,
        durationMinutes: 120,
        meetingPoint: { lat: -8.210606, lng: 114.967019, description: "Banjar Hot Spring entrance" },
        whatToBring: ["Swimsuit", "Towel", "Sarong"],
        price: 125000,
        currency: "IDR",
        hour: 15,
    },
    {
        title: "Coastal Foraging Walk",
        activityType: "foraging",
        description: "Learn to identify edible seaweed, coastal plants, and tidal pool life with a local marine biologist. Taste what you find. 2 hours.",
        difficulty: "easy",
        groupSize: 8,
        durationMinutes: 120,
        meetingPoint: { lat: -8.815487, lng: 115.226234, description: "Geger Beach south end" },
        whatToBring: ["Water shoes", "Bucket/bag", "Sunscreen", "Hat"],
        price: 175000,
        currency: "IDR",
        hour: 8,
    },
    {
        title: "Sunset Surf Session",
        activityType: "other",
        activityTypeOther: "Surfing",
        description: "Beginner-friendly group surf at Batu Bolong. Board and rash guard included. Instructor in the water. Watch the sunset from the lineup.",
        difficulty: "easy",
        groupSize: 8,
        durationMinutes: 90,
        meetingPoint: { lat: -8.659482, lng: 115.130136, description: "Batu Bolong Beach, board rental hut" },
        whatToBring: ["Swimsuit", "Sunscreen"],
        price: 250000,
        currency: "IDR",
        hour: 17,
    },
    {
        title: "Tukad Cepung Cave Trek",
        activityType: "hike",
        description: "Short hike to a magical cave waterfall where light rays pierce through the rock. Best visited around noon. Slippery -- wear proper shoes.",
        difficulty: "moderate",
        groupSize: 10,
        durationMinutes: 120,
        meetingPoint: { lat: -8.441017, lng: 115.386808, description: "Tukad Cepung carpark" },
        whatToBring: ["Water shoes", "Waterproof phone case", "Towel"],
        price: 100000,
        currency: "IDR",
        hour: 11,
    },
    {
        title: "Nungnung Waterfall Plunge",
        activityType: "hike",
        description: "492 steps down to one of Bali's most powerful waterfalls. Swimming at the base at noon when the sun hits. The climb back up is the real workout.",
        difficulty: "hard",
        groupSize: 8,
        durationMinutes: 180,
        meetingPoint: { lat: -8.32977, lng: 115.229391, description: "Nungnung Waterfall entrance" },
        whatToBring: ["Hiking shoes", "Swimsuit", "Water (lots)", "Snacks"],
        price: 100000,
        currency: "IDR",
        hour: 9,
    },
];

// Generate 2 events per day for 30 days by cycling through templates
const experiences = [];
for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const morningIdx = (dayOffset * 2) % templates.length;
    const afternoonIdx = (dayOffset * 2 + 1) % templates.length;

    const morning = templates[morningIdx];
    const afternoon = templates[afternoonIdx];

    experiences.push({
        ...morning,
        slug: `${morning.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "")}-day-${dayOffset + 1}`,
        dateTime: makeDate(dayOffset, morning.hour),
    });
    experiences.push({
        ...afternoon,
        slug: `${afternoon.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "")}-day-${dayOffset + 1}`,
        dateTime: makeDate(dayOffset, afternoon.hour),
    });
}

// ── Upsert experiences ──
const BookingEvent =
    mongoose.models.BookingEvent ||
    mongoose.model(
        "BookingEvent",
        new mongoose.Schema({}, { strict: false, timestamps: true })
    );

const ops = experiences.map((exp) => ({
    updateOne: {
        filter: { slug: exp.slug },
        update: {
            $set: {
                ...exp,
                createdBy: systemUser._id,
                status: "published",
                isPublic: true,
                weatherPolicy: "Light rain OK, storms cancel",
                coverPhotoUrl: "",
            },
        },
        upsert: true,
    },
}));

const result = await BookingEvent.bulkWrite(ops);
console.log(`✅ Seeded ${experiences.length} experiences.`);
console.log(
    `   Inserted: ${result.upsertedCount}, Modified: ${result.modifiedCount}\n`
);

await mongoose.disconnect();
console.log("Done.");
