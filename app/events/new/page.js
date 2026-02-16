"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/libs/api";
import {
    getActivityDefaults,
    getActivityTypeOptions,
} from "@/libs/activityDefaults";

const TITLE_PLACEHOLDERS = [
    "Saturday morning bird walk",
    "Full moon hike at Bear Creek",
    "Forest bathing in the redwoods",
    "Sunrise yoga at the lake",
    "Wildflower foraging walk",
    "Meditation by the creek",
];

const WEATHER_PRESETS = [
    "Light rain OK, storms cancel",
    "Any rain cancels",
    "We go regardless",
];

const DIFFICULTY_OPTIONS = [
    { value: "easy", label: "Easy" },
    { value: "moderate", label: "Moderate" },
    { value: "hard", label: "Hard" },
    { value: "strenuous", label: "Strenuous" },
];

export default function EventCreatePage() {
    const router = useRouter();
    const [eventId, setEventId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [published, setPublished] = useState(false);
    const [slug, setSlug] = useState("");
    const [detailsOpen, setDetailsOpen] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [dateTime, setDateTime] = useState("");
    const [durationMinutes, setDurationMinutes] = useState(90);
    const [activityType, setActivityType] = useState("");
    const [activityTypeOther, setActivityTypeOther] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [groupSize, setGroupSize] = useState(10);
    const [description, setDescription] = useState("");
    const [whatToBring, setWhatToBring] = useState([]);
    const [newBringItem, setNewBringItem] = useState("");
    const [weatherPolicy, setWeatherPolicy] = useState("Light rain OK, storms cancel");
    const [customWeather, setCustomWeather] = useState("");
    const [price, setPrice] = useState(0);
    const [priceLink, setPriceLink] = useState("");
    const [accessibilityNotes, setAccessibilityNotes] = useState("");
    const [coverPhotoUrl, setCoverPhotoUrl] = useState("");
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const [placeholder] = useState(
        () => TITLE_PLACEHOLDERS[Math.floor(Math.random() * TITLE_PLACEHOLDERS.length)]
    );

    const saveTimer = useRef(null);

    // Create draft event on mount
    useEffect(() => {
        async function createDraft() {
            try {
                const res = await apiClient.post("/events/create");
                setEventId(res.id);
            } catch (err) {
                console.error("Failed to create draft:", err);
            }
        }
        createDraft();
    }, []);

    // Auto-save (debounced)
    const autoSave = useCallback(
        (fields) => {
            if (!eventId) return;
            if (saveTimer.current) clearTimeout(saveTimer.current);
            saveTimer.current = setTimeout(async () => {
                setSaving(true);
                try {
                    await apiClient.patch(`/events/${eventId}`, fields);
                } catch (err) {
                    console.error("Auto-save failed:", err);
                } finally {
                    setSaving(false);
                }
            }, 800);
        },
        [eventId]
    );

    // Auto-save on field change
    useEffect(() => {
        if (!eventId) return;
        autoSave({
            title,
            dateTime: dateTime ? new Date(dateTime).toISOString() : null,
            durationMinutes,
            activityType,
            activityTypeOther,
            difficulty,
            groupSize,
            description,
            whatToBring,
            weatherPolicy: WEATHER_PRESETS.includes(weatherPolicy)
                ? weatherPolicy
                : customWeather,
            price,
            priceLink,
            accessibilityNotes,
            coverPhotoUrl,
        });
    }, [
        eventId, title, dateTime, durationMinutes, activityType, activityTypeOther,
        difficulty, groupSize, description, whatToBring, weatherPolicy, customWeather,
        price, priceLink, accessibilityNotes, coverPhotoUrl, autoSave,
    ]);

    // When activity type changes, set defaults
    useEffect(() => {
        if (!activityType) return;
        const defaults = getActivityDefaults(activityType);
        if (defaults) {
            if (!difficulty) setDifficulty(defaults.difficulty);
            if (whatToBring.length === 0) setWhatToBring([...defaults.whatToBring]);
            if (!description) setDescription(defaults.placeholder);
        }
    }, [activityType]);

    // Publish
    async function handlePublish() {
        if (!title.trim()) return;
        setPublishing(true);
        try {
            const res = await apiClient.patch(`/events/${eventId}`, {
                title,
                status: "published",
            });
            setPublished(true);
            setSlug(res.slug);
        } catch (err) {
            console.error("Publish failed:", err);
        } finally {
            setPublishing(false);
        }
    }

    // Photo upload
    async function handlePhotoUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingPhoto(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.url) {
                setCoverPhotoUrl(data.url);
            }
        } catch (err) {
            console.error("Upload failed:", err);
        } finally {
            setUploadingPhoto(false);
        }
    }

    // Add what-to-bring item
    function addBringItem() {
        const item = newBringItem.trim();
        if (item && !whatToBring.includes(item)) {
            setWhatToBring([...whatToBring, item]);
            setNewBringItem("");
        }
    }

    function removeBringItem(index) {
        setWhatToBring(whatToBring.filter((_, i) => i !== index));
    }

    return (
        <div className="min-h-screen bg-[#f8f6f3]">
            <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <button
                        onClick={() => router.push("/events")}
                        className="text-sm text-stone-500 hover:text-stone-700"
                    >
                        ← Back
                    </button>
                    <div className="flex items-center gap-3">
                        {saving && (
                            <span className="text-xs text-stone-400">Saving...</span>
                        )}
                        {published && slug && (
                            <a
                                href={`/e/${slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-emerald-600 hover:underline"
                            >
                                View event →
                            </a>
                        )}
                        <button
                            onClick={handlePublish}
                            disabled={!title.trim() || publishing || published}
                            className="rounded-full bg-stone-800 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {published ? "Published ✓" : publishing ? "Publishing..." : "Publish"}
                        </button>
                    </div>
                </div>

                {/* Cover Photo */}
                <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-2xl bg-stone-200">
                    {coverPhotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={coverPhotoUrl}
                            alt="Cover"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-stone-400">
                            <label className="cursor-pointer text-center">
                                <span className="text-3xl">📷</span>
                                <p className="mt-2 text-sm">Add a cover photo</p>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    )}
                    {coverPhotoUrl && (
                        <label className="absolute bottom-3 right-3 cursor-pointer rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-stone-700 backdrop-blur-sm">
                            Change photo
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handlePhotoUpload}
                                className="hidden"
                            />
                        </label>
                    )}
                    {uploadingPhoto && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <span className="text-white">Uploading...</span>
                        </div>
                    )}
                </div>

                {/* Title */}
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={placeholder}
                    maxLength={80}
                    className="mb-6 w-full border-0 bg-transparent font-serif text-3xl font-bold text-stone-800 placeholder-stone-300 outline-none focus:ring-0 sm:text-4xl"
                />

                {/* Add details toggle */}
                <button
                    onClick={() => setDetailsOpen(!detailsOpen)}
                    className="mb-6 flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-700"
                >
                    <span
                        className="inline-block transition-transform"
                        style={{ transform: detailsOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                    >
                        ▸
                    </span>
                    Add details
                </button>

                {/* Details section */}
                {detailsOpen && (
                    <div className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
                        {/* Date & Time */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-stone-600">
                                Date & Time
                            </label>
                            <input
                                type="datetime-local"
                                value={dateTime}
                                onChange={(e) => setDateTime(e.target.value)}
                                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-800"
                            />
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-stone-600">
                                Duration
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={durationMinutes}
                                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                                    min={15}
                                    max={480}
                                    step={15}
                                    className="w-24 rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-800"
                                />
                                <span className="text-sm text-stone-500">minutes</span>
                            </div>
                        </div>

                        {/* Activity Type */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-stone-600">
                                Activity Type
                            </label>
                            <select
                                value={activityType}
                                onChange={(e) => setActivityType(e.target.value)}
                                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-800"
                            >
                                <option value="">Select activity...</option>
                                {getActivityTypeOptions().map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            {activityType === "other" && (
                                <input
                                    type="text"
                                    value={activityTypeOther}
                                    onChange={(e) => setActivityTypeOther(e.target.value)}
                                    placeholder="What kind of activity?"
                                    className="mt-2 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-800"
                                />
                            )}
                        </div>

                        {/* Difficulty */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-stone-600">
                                Difficulty
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {DIFFICULTY_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setDifficulty(opt.value)}
                                        className={`rounded-full px-4 py-1.5 text-sm transition-colors ${difficulty === opt.value
                                            ? "bg-stone-800 text-white"
                                            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Group Size */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-stone-600">
                                Group Size
                            </label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setGroupSize(Math.max(2, groupSize - 1))}
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200"
                                >
                                    −
                                </button>
                                <span className="w-10 text-center text-lg font-medium text-stone-800">
                                    {groupSize}
                                </span>
                                <button
                                    onClick={() => setGroupSize(Math.min(100, groupSize + 1))}
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200"
                                >
                                    +
                                </button>
                                <span className="text-sm text-stone-500">people</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-stone-600">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                maxLength={2000}
                                rows={4}
                                placeholder="Tell people what to expect..."
                                className="w-full resize-none rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-800"
                            />
                            <p className="mt-1 text-right text-xs text-stone-400">
                                {description.length}/2000
                            </p>
                        </div>

                        {/* What to Bring */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-stone-600">
                                What to Bring
                            </label>
                            <ul className="mb-2 space-y-1">
                                {whatToBring.map((item, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-1.5 text-sm text-stone-700"
                                    >
                                        <span>☑ {item}</span>
                                        <button
                                            onClick={() => removeBringItem(i)}
                                            className="text-stone-400 hover:text-stone-600"
                                        >
                                            ✕
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newBringItem}
                                    onChange={(e) => setNewBringItem(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addBringItem()}
                                    placeholder="Add item..."
                                    className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-800"
                                />
                                <button
                                    onClick={addBringItem}
                                    className="rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-600 hover:bg-stone-200"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        {/* Weather Policy */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-stone-600">
                                Weather Policy
                            </label>
                            <div className="space-y-2">
                                {WEATHER_PRESETS.map((preset) => (
                                    <button
                                        key={preset}
                                        onClick={() => { setWeatherPolicy(preset); setCustomWeather(""); }}
                                        className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${weatherPolicy === preset
                                            ? "bg-stone-800 text-white"
                                            : "bg-stone-50 text-stone-600 hover:bg-stone-100"
                                            }`}
                                    >
                                        {preset}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setWeatherPolicy("custom")}
                                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${weatherPolicy === "custom"
                                        ? "bg-stone-800 text-white"
                                        : "bg-stone-50 text-stone-600 hover:bg-stone-100"
                                        }`}
                                >
                                    Custom
                                </button>
                                {weatherPolicy === "custom" && (
                                    <input
                                        type="text"
                                        value={customWeather}
                                        onChange={(e) => setCustomWeather(e.target.value)}
                                        placeholder="Describe your weather policy..."
                                        className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-800"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Price */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-stone-600">
                                Price
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="text-stone-500">$</span>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(Number(e.target.value))}
                                    min={0}
                                    className="w-24 rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-800"
                                />
                                <span className="text-sm text-stone-500">
                                    {price === 0 ? "(Free)" : ""}
                                </span>
                            </div>
                            {price > 0 && (
                                <input
                                    type="url"
                                    value={priceLink}
                                    onChange={(e) => setPriceLink(e.target.value)}
                                    placeholder="Payment link (Venmo, PayPal, etc.)"
                                    className="mt-2 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-800"
                                />
                            )}
                        </div>

                        {/* Accessibility */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-stone-600">
                                Accessibility Notes
                            </label>
                            <input
                                type="text"
                                value={accessibilityNotes}
                                onChange={(e) => setAccessibilityNotes(e.target.value)}
                                maxLength={500}
                                placeholder="Trail is wheelchair accessible for first 0.5 miles"
                                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-800"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
