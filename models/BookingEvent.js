import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const ACTIVITY_TYPES = [
    "nature-walk",
    "hike",
    "bird-walk",
    "forest-bathing",
    "foraging",
    "outdoor-yoga",
    "meditation",
    "other",
];

const DIFFICULTIES = ["easy", "moderate", "hard", "strenuous"];

const EVENT_STATUSES = ["draft", "published", "cancelled"];

const meetingPointSchema = new mongoose.Schema(
    {
        lat: { type: Number },
        lng: { type: Number },
        description: { type: String, trim: true, maxlength: 500, default: "" },
    },
    { _id: false }
);

const bookingEventSchema = mongoose.Schema(
    {
        facilitatorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Facilitator",
            required: true,
            index: true,
        },
        title: {
            type: String,
            trim: true,
            maxlength: 80,
            default: "",
        },
        slug: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            sparse: true,
        },
        status: {
            type: String,
            enum: EVENT_STATUSES,
            default: "draft",
            index: true,
        },
        dateTime: {
            type: Date,
            default: null,
        },
        durationMinutes: {
            type: Number,
            default: 90,
        },
        meetingPoint: {
            type: meetingPointSchema,
            default: null,
        },
        activityType: {
            type: String,
            enum: [...ACTIVITY_TYPES, ""],
            default: "",
        },
        activityTypeOther: {
            type: String,
            trim: true,
            default: "",
        },
        groupSize: {
            type: Number,
            min: 2,
            max: 100,
            default: 10,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: "",
        },
        difficulty: {
            type: String,
            enum: [...DIFFICULTIES, ""],
            default: "",
        },
        whatToBring: {
            type: [String],
            default: [],
        },
        weatherPolicy: {
            type: String,
            trim: true,
            default: "Light rain OK, storms cancel",
        },
        price: {
            type: Number,
            default: 0,
        },
        priceLink: {
            type: String,
            trim: true,
            default: "",
        },
        coverPhotoUrl: {
            type: String,
            trim: true,
            default: "",
        },
        accessibilityNotes: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },
        cancelledReason: {
            type: String,
            trim: true,
            default: "",
        },
        sourceEventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BookingEvent",
            default: null,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
    }
);

bookingEventSchema.index({ facilitatorId: 1, status: 1, dateTime: -1 });

bookingEventSchema.plugin(toJSON);

export { ACTIVITY_TYPES, DIFFICULTIES, EVENT_STATUSES };

export default mongoose.models.BookingEvent ||
    mongoose.model("BookingEvent", bookingEventSchema);
