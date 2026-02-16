/**
 * Milestone 1 — Smoke tests for models and utility libs.
 *
 * Run: node --import ./scripts/register-aliases.mjs scripts/test-milestone-1.mjs
 *   or: node scripts/test-milestone-1.mjs  (uses inline loader)
 *
 * Tests:
 *  1. slugify — generates valid slugs
 *  2. activityDefaults — returns correct defaults
 *  3. reserved-usernames — blocks reserved words
 *  4. calendar — generates valid .ics and Google Cal links
 *  5. notifications — all templates return correct shape
 *  6. Facilitator model — validates schema
 *  7. BookingEvent model — validates schema, enums, defaults
 *  8. Rsvp model — validates schema, compound index exists
 */

import { register } from "node:module";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

// Register a custom loader that resolves @/ to project root
// so we can test files that use Next.js path aliases
const projectRoot = resolve(import.meta.dirname, "..");

register("data:text/javascript," + encodeURIComponent(`
  import { existsSync } from "node:fs";
  import { fileURLToPath } from "node:url";
  import { resolve as pathResolve, dirname } from "node:path";

  function tryAppendJs(resolved) {
    if (!resolved.match(/\\.[a-z]+$/i) && existsSync(resolved + ".js")) {
      return resolved + ".js";
    }
    return resolved;
  }

  export function resolve(specifier, context, nextResolve) {
    // Handle @/ alias
    if (specifier.startsWith("@/")) {
      const resolved = tryAppendJs("${projectRoot}/" + specifier.slice(2));
      return nextResolve(resolved, context);
    }
    // Handle relative imports (./foo, ../foo) from project files
    if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL) {
      const parentPath = fileURLToPath(context.parentURL);
      const parentDir = dirname(parentPath);
      if (parentDir.startsWith("${projectRoot}")) {
        const resolved = tryAppendJs(pathResolve(parentDir, specifier));
        return nextResolve(resolved, context);
      }
    }
    return nextResolve(specifier, context);
  }
`), pathToFileURL("./"));

// --- Helpers ---------------------------------------------------------------

let passed = 0;
let failed = 0;
function assert(condition, message) {
    if (!condition) {
        console.error(`  ✗ ${message}`);
        failed++;
    } else {
        passed++;
    }
}

// --- 1. slugify -----------------------------------------------------------

const { slugify } = await import("../libs/slugify.js");

assert(
    /^saturday-morning-bird-walk-[a-z0-9]{4}$/.test(slugify("Saturday morning bird walk")),
    "slugify basic"
);
assert(
    /^hello-world-[a-z0-9]{4}$/.test(slugify("  Hello!!! World???  ")),
    "slugify special chars"
);
assert(/^[a-z0-9]{4}$/.test(slugify("")), "slugify empty string");
assert(slugify("test") !== slugify("test"), "slugify unique suffixes");

console.log("✓ slugify");

// --- 2. activityDefaults --------------------------------------------------

const {
    default: ACTIVITY_DEFAULTS,
    getActivityDefaults,
    getActivityTypeOptions,
} = await import("../libs/activityDefaults.js");

const hikeDefaults = getActivityDefaults("hike");
assert(hikeDefaults.difficulty === "moderate", "hike difficulty");
assert(hikeDefaults.whatToBring.length > 0, "hike has items");
assert(hikeDefaults.label === "Hike", "hike label");

const birdDefaults = getActivityDefaults("bird-walk");
assert(birdDefaults.difficulty === "easy", "bird-walk difficulty");
assert(
    birdDefaults.whatToBring.some((i) => i.toLowerCase().includes("binocular")),
    "bird-walk suggests binoculars"
);

assert(getActivityDefaults("nonexistent") === null, "unknown type → null");

const options = getActivityTypeOptions();
assert(options.length === 8, `8 activity types (got ${options.length})`);
assert(options.every((o) => o.value && o.label), "options have value + label");

console.log("✓ activityDefaults");

// --- 3. reserved-usernames ------------------------------------------------

const { isReservedUsername } = await import("../libs/reserved-usernames.js");

assert(isReservedUsername("admin"), "admin is reserved");
assert(isReservedUsername("Admin"), "case insensitive");
assert(isReservedUsername("dashboard"), "dashboard is reserved");
assert(isReservedUsername("e"), "e is reserved");
assert(isReservedUsername("api"), "api is reserved");
assert(!isReservedUsername("sarah-the-hiker"), "normal name is fine");
assert(!isReservedUsername(""), "empty not reserved");
assert(!isReservedUsername(null), "null handled");
assert(!isReservedUsername(undefined), "undefined handled");

console.log("✓ reserved-usernames");

// --- 4. calendar ----------------------------------------------------------

const { generateIcs, googleCalendarUrl } = await import("../libs/calendar.js");

const eventData = {
    title: "Morning Bird Walk",
    dateTime: "2026-03-15T09:00:00Z",
    durationMinutes: 90,
    location: "Bear Creek Trail",
    description: "A relaxed walk spotting birds.",
    url: "https://natureclub.com/e/morning-bird-walk-a3x9",
};

const ics = generateIcs(eventData);
assert(ics.includes("BEGIN:VCALENDAR"), "ics has VCALENDAR");
assert(ics.includes("BEGIN:VEVENT"), "ics has VEVENT");
assert(ics.includes("Morning Bird Walk"), "ics has title");
assert(ics.includes("Bear Creek Trail"), "ics has location");
assert(ics.includes("DTSTART:"), "ics has start");
assert(ics.includes("DTEND:"), "ics has end");
assert(ics.includes("END:VCALENDAR"), "ics closes");

const gcalUrl = googleCalendarUrl(eventData);
assert(gcalUrl.startsWith("https://calendar.google.com/calendar/render"), "gcal base url");

const minIcs = generateIcs({
    title: "Quick walk",
    dateTime: "2026-04-01T10:00:00Z",
    durationMinutes: 60,
});
assert(minIcs.includes("Quick walk"), "min ics has title");
assert(!minIcs.includes("LOCATION:"), "no location when omitted");

console.log("✓ calendar");

// --- 5. notifications (template shapes) -----------------------------------

const {
    rsvpConfirmedParticipant,
    rsvpConfirmedFacilitator,
    waitlistJoined,
    spotOpened,
    waitlistExpired,
    eventEdited,
    rainCheckOn,
    rainCheckReschedule,
    rainCheckCancel,
    duplicateNotify,
    eventUrl,
} = await import("../libs/notifications.js");

const templates = [
    ["rsvpConfirmedParticipant", rsvpConfirmedParticipant({
        email: "a@b.com", eventTitle: "Walk", eventDate: "2026-03-15T09:00:00Z",
        eventUrl: "https://natureclub.com/e/test",
    })],
    ["rsvpConfirmedFacilitator", rsvpConfirmedFacilitator({
        facilitatorEmail: "f@b.com", participantName: "Sarah",
        eventTitle: "Walk", rsvpCount: 3, groupSize: 10,
    })],
    ["waitlistJoined", waitlistJoined({ email: "a@b.com", eventTitle: "Walk", position: 2 })],
    ["spotOpened", spotOpened({ email: "a@b.com", eventTitle: "Walk", confirmUrl: "https://x.com" })],
    ["waitlistExpired", waitlistExpired({ email: "a@b.com", eventTitle: "Walk" })],
    ["eventEdited", eventEdited({
        email: "a@b.com", eventTitle: "Walk",
        changes: ["Time changed"], eventUrl: "https://x.com",
    })],
    ["rainCheckOn", rainCheckOn({
        email: "a@b.com", eventTitle: "Walk", eventDate: "2026-03-15", note: "Bring rain gear!",
    })],
    ["rainCheckReschedule", rainCheckReschedule({
        email: "a@b.com", eventTitle: "Walk", newDate: "2026-03-22", eventUrl: "https://x.com",
    })],
    ["rainCheckCancel", rainCheckCancel({
        email: "a@b.com", eventTitle: "Walk", eventDate: "2026-03-15", reason: "Weather",
    })],
    ["duplicateNotify", duplicateNotify({
        email: "a@b.com", facilitatorName: "Maria", eventTitle: "Walk",
        newDate: "2026-04-01", eventUrl: "https://x.com",
    })],
];

for (const [name, t] of templates) {
    assert(typeof t.to === "string" && t.to.includes("@"), `${name}.to`);
    assert(typeof t.subject === "string" && t.subject.length > 0, `${name}.subject`);
    assert(typeof t.body === "string" && t.body.length > 0, `${name}.body`);
}

const url = eventUrl("morning-walk-a3x9");
assert(url.endsWith("/e/morning-walk-a3x9"), `eventUrl: "${url}"`);

console.log("✓ notifications (10 templates)");

// --- 6–8. Mongoose models -------------------------------------------------

const mongoose = (await import("mongoose")).default;
const Facilitator = (await import("../models/Facilitator.js")).default;
const BookingEvent = (await import("../models/BookingEvent.js")).default;
const Rsvp = (await import("../models/Rsvp.js")).default;

// 6. Facilitator
const validFac = new Facilitator({
    clerkUserId: "user_123",
    name: "Maria Silva",
    email: "maria@example.com",
});
assert(!validFac.validateSync(), "valid facilitator passes");

const badFac = new Facilitator({ name: "No clerk id" });
assert(badFac.validateSync(), "facilitator without clerkUserId fails");

assert(validFac.bio === "", "bio defaults empty");
assert(validFac.phone === "", "phone defaults empty");
assert(validFac.photoUrl === "", "photoUrl defaults empty");

console.log("✓ Facilitator model");

// 7. BookingEvent
const { ACTIVITY_TYPES, DIFFICULTIES, EVENT_STATUSES } = await import("../models/BookingEvent.js");

assert(ACTIVITY_TYPES.length === 8, `8 activity types (got ${ACTIVITY_TYPES.length})`);
assert(DIFFICULTIES.length === 4, `4 difficulties (got ${DIFFICULTIES.length})`);
assert(EVENT_STATUSES.length === 3, `3 statuses (got ${EVENT_STATUSES.length})`);

const validEvt = new BookingEvent({
    facilitatorId: new mongoose.Types.ObjectId(),
    title: "Bird Walk",
    slug: "bird-walk-a3x9",
    status: "published",
    activityType: "bird-walk",
    difficulty: "easy",
});
assert(!validEvt.validateSync(), "valid event passes");
assert(validEvt.durationMinutes === 90, "duration defaults 90");
assert(validEvt.groupSize === 10, "groupSize defaults 10");
assert(validEvt.price === 0, "price defaults 0");
assert(validEvt.weatherPolicy === "Light rain OK, storms cancel", "weather policy default");

const badEvt = new BookingEvent({
    facilitatorId: new mongoose.Types.ObjectId(),
    activityType: "swimming",
});
assert(badEvt.validateSync(), "invalid activityType fails");

const noFacEvt = new BookingEvent({ title: "Test" });
assert(noFacEvt.validateSync(), "event without facilitatorId fails");

const evtWithPoint = new BookingEvent({
    facilitatorId: new mongoose.Types.ObjectId(),
    meetingPoint: { lat: 38.7, lng: -9.14, description: "By the big oak tree" },
});
assert(evtWithPoint.meetingPoint.lat === 38.7, "meeting point lat");
assert(evtWithPoint.meetingPoint.description === "By the big oak tree", "meeting point desc");

console.log("✓ BookingEvent model");

// 8. Rsvp
const validRsvp = new Rsvp({
    eventId: new mongoose.Types.ObjectId(),
    participantPhone: "+15551234567",
    participantName: "Sarah",
});
assert(!validRsvp.validateSync(), "valid rsvp passes");
assert(validRsvp.status === "confirmed", "rsvp defaults confirmed");
assert(validRsvp.waitlistPosition === null, "waitlist position defaults null");

const wlRsvp = new Rsvp({
    eventId: new mongoose.Types.ObjectId(),
    participantPhone: "+15559999999",
    participantName: "Tom",
    status: "waitlisted",
    waitlistPosition: 3,
});
assert(!wlRsvp.validateSync(), "waitlisted rsvp passes");
assert(wlRsvp.waitlistPosition === 3, "waitlist position set");

const badRsvp = new Rsvp({
    eventId: new mongoose.Types.ObjectId(),
    participantPhone: "+15551111111",
    participantName: "Bad",
    status: "maybe",
});
assert(badRsvp.validateSync(), "invalid rsvp status fails");

const noPhone = new Rsvp({
    eventId: new mongoose.Types.ObjectId(),
    participantName: "NoPhone",
});
assert(noPhone.validateSync(), "rsvp without phone fails");

const rsvpIndexes = Rsvp.schema.indexes();
const hasCompound = rsvpIndexes.some(([fields]) => fields.eventId && fields.participantPhone);
assert(hasCompound, "compound index on eventId + participantPhone");

console.log("✓ Rsvp model");

// --- Summary ---------------------------------------------------------------
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
    console.log("❌ Some tests failed.");
    process.exit(1);
} else {
    console.log("🎉 All Milestone 1 tests passed.");
    process.exit(0);
}
