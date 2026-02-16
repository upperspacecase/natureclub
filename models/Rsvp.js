import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const RSVP_STATUSES = ["confirmed", "cancelled", "waitlisted"];

const rsvpSchema = mongoose.Schema(
    {
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BookingEvent",
            required: true,
            index: true,
        },
        participantPhone: {
            type: String,
            trim: true,
            required: true,
        },
        participantName: {
            type: String,
            trim: true,
            required: true,
            maxlength: 50,
        },
        status: {
            type: String,
            enum: RSVP_STATUSES,
            default: "confirmed",
            index: true,
        },
        waitlistPosition: {
            type: Number,
            default: null,
        },
        waitlistPromotedAt: {
            type: Date,
            default: null,
        },
        waitlistExpiresAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
    }
);

// Prevent duplicate RSVPs: one phone per event
rsvpSchema.index(
    { eventId: 1, participantPhone: 1 },
    {
        unique: true,
        partialFilterExpression: { status: { $ne: "cancelled" } },
    }
);

rsvpSchema.index({ eventId: 1, status: 1, waitlistPosition: 1 });

rsvpSchema.plugin(toJSON);

export { RSVP_STATUSES };

export default mongoose.models.Rsvp || mongoose.model("Rsvp", rsvpSchema);
