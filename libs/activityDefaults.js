/**
 * Activity type → default difficulty + what-to-bring checklist + placeholder text.
 * Categories match the THEMES used in member onboarding ("What types of experiences
 * are you most interested in?") from data/events.js.
 */

const ACTIVITY_DEFAULTS = {
    movement: {
        label: "Movement",
        difficulty: "moderate",
        whatToBring: [
            "Water bottle",
            "Athletic shoes",
            "Towel",
            "Light layers",
        ],
        placeholder:
            "Get moving outdoors — whether it's fitness, dance, surfing, or primal movement. All levels welcome.",
    },
    wellness: {
        label: "Wellness",
        difficulty: "easy",
        whatToBring: [
            "Yoga mat",
            "Comfortable clothing",
            "Water bottle",
            "Cushion or sit pad",
        ],
        placeholder:
            "A restorative session in nature — yoga, breathwork, meditation, or sound bath. Come as you are.",
    },
    arts: {
        label: "Arts",
        difficulty: "easy",
        whatToBring: [
            "Sketchbook or notebook",
            "Pencils/pens",
            "Water bottle",
        ],
        placeholder:
            "Create something outdoors — crafts, music, writing, or visual arts. No experience needed, just curiosity.",
    },
    wildlife: {
        label: "Wildlife",
        difficulty: "easy",
        whatToBring: [
            "Binoculars (if you have them)",
            "Field guide (optional)",
            "Water bottle",
            "Comfortable shoes",
            "Sunscreen",
        ],
        placeholder:
            "Observe and connect with local wildlife — birdwatching, ecology walks, tracking, or citizen science.",
    },
    social: {
        label: "Social",
        difficulty: "easy",
        whatToBring: [
            "Water bottle",
            "Snacks to share (optional)",
        ],
        placeholder:
            "Come together outdoors — tea ceremony, outdoor dining, or simply good company in a beautiful setting.",
    },
    cultivation: {
        label: "Cultivation",
        difficulty: "moderate",
        whatToBring: [
            "Gloves",
            "Comfortable clothes you don't mind getting dirty",
            "Water bottle",
            "Sunscreen",
        ],
        placeholder:
            "Get your hands in the soil — gardening, farming, permaculture, or composting. Learn and grow together.",
    },
    restoration: {
        label: "Give Back",
        difficulty: "moderate",
        whatToBring: [
            "Gloves",
            "Water bottle",
            "Sturdy shoes",
            "Sunscreen",
        ],
        placeholder:
            "Give back to the land — volunteering, conservation, clean-ups, or tree planting. Every hand counts.",
    },
    cultural: {
        label: "Cultural",
        difficulty: "easy",
        whatToBring: [
            "Water bottle",
            "Comfortable shoes",
            "Blanket or chair (optional)",
        ],
        placeholder:
            "Celebrate together — harvest festivals, music festivals, solstice events, or seasonal rites.",
    },
    skills: {
        label: "Skills",
        difficulty: "moderate",
        whatToBring: [
            "Water bottle",
            "Sturdy shoes",
            "Notebook (optional)",
            "Sunscreen",
        ],
        placeholder:
            "Learn a hands-on skill outdoors — foraging, natural building, sailing, navigation, or firecraft.",
    },
    adventure: {
        label: "Exploration",
        difficulty: "moderate",
        whatToBring: [
            "Water bottle",
            "Snacks",
            "Comfortable hiking shoes",
            "Sunscreen",
            "Light layers",
        ],
        placeholder:
            "Head out and explore — hiking, camping, or expeditions. Expect some terrain and beautiful discoveries.",
    },
    other: {
        label: "Other",
        difficulty: "",
        whatToBring: [],
        placeholder:
            "Tell people what to expect — what you'll do, where you'll be, and why it'll be worth showing up.",
    },
};

/**
 * Get defaults for a given activity type.
 * Returns { label, difficulty, whatToBring, placeholder } or null.
 */
export function getActivityDefaults(activityType) {
    return ACTIVITY_DEFAULTS[activityType] || null;
}

/**
 * Get all activity types as an array of { value, label } for select inputs.
 */
export function getActivityTypeOptions() {
    return Object.entries(ACTIVITY_DEFAULTS).map(([value, { label }]) => ({
        value,
        label,
    }));
}

export default ACTIVITY_DEFAULTS;
