import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const eventSchema = mongoose.Schema(
  {
    eventId: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      trim: true,
      required: true,
    },
    duration: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    themes: {
      type: [String],
      default: [],
    },
    categoryTag: {
      type: String,
      trim: true,
      default: "",
    },
    attributeTags: {
      type: [String],
      default: [],
    },
    type: {
      type: String,
      trim: true,
      default: "experience",
    },
    headline: {
      type: String,
      trim: true,
      default: "",
    },
    buttonText: {
      type: String,
      trim: true,
      default: "",
    },
    region: {
      type: String,
      trim: true,
      default: "",
    },
    regionKey: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    facilitatorName: {
      type: String,
      trim: true,
      default: "",
    },
    facilitatorEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    startsAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

eventSchema.plugin(toJSON);

export default mongoose.models.Event || mongoose.model("Event", eventSchema);
