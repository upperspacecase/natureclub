import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";
import { LEAD_STATUS, SIGNUP_QUESTION_VERSION } from "@/libs/signup";

const memberResponsesSchema = new mongoose.Schema(
  {
    locationCity: { type: String, trim: true, default: "" },
    locationCoords: { type: String, trim: true, default: "" },
    interests: { type: [String], default: [] },
    interestsOther: { type: String, trim: true, default: "" },
    interestThemes: { type: [String], default: [] },
    motivations: { type: [String], default: [] },
    motivationsOther: { type: String, trim: true, default: "" },
    experiencesPerMonth: { type: String, trim: true, default: "" },
    pricingSelection: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const hostResponsesSchema = new mongoose.Schema(
  {
    locationCity: { type: String, trim: true, default: "" },
    locationCoords: { type: String, trim: true, default: "" },
    experience: { type: String, trim: true, default: "" },
    sessionsPerMonth: { type: String, trim: true, default: "" },
    bookingsPerSession: { type: String, trim: true, default: "" },
    rateAmount: { type: String, trim: true, default: "" },
    rateMin: { type: String, trim: true, default: "" },
    rateMax: { type: String, trim: true, default: "" },
    tools: { type: [String], default: [] },
    toolsOther: { type: String, trim: true, default: "" },
    features: { type: [String], default: [] },
    featuresOther: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const leadSchema = mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      private: true,
      required: true,
    },
    role: {
      type: String,
      trim: true,
      required: true,
      enum: ["host", "member"],
    },
    status: {
      type: String,
      trim: true,
      enum: [LEAD_STATUS.DRAFT, LEAD_STATUS.SUBMITTED],
      default: LEAD_STATUS.SUBMITTED,
      index: true,
    },
    source: {
      type: String,
      trim: true,
      default: "button",
    },
    country: {
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
    draftId: {
      type: String,
      trim: true,
      default: "",
    },
    sessionId: {
      type: String,
      trim: true,
      default: "",
    },
    questionVersion: {
      type: String,
      trim: true,
      default: SIGNUP_QUESTION_VERSION,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    welcomeEmailSentAt: {
      type: Date,
      default: null,
    },
    responses: {
      type: {
        member: {
          type: memberResponsesSchema,
          default: null,
        },
        host: {
          type: hostResponsesSchema,
          default: null,
        },
      },
      default: {
        member: null,
        host: null,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

leadSchema.index(
  { draftId: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { draftId: { $type: "string", $ne: "" } },
  }
);
leadSchema.index({ status: 1, role: 1, createdAt: -1 });
leadSchema.index({ role: 1, email: 1, createdAt: -1 });
leadSchema.index({ country: 1, role: 1, createdAt: -1 });
leadSchema.index({ regionKey: 1, role: 1, createdAt: -1 });

leadSchema.plugin(toJSON);

export default mongoose.models.Lead || mongoose.model("Lead", leadSchema);
