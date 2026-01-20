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
      required: true,
    },
    image: {
      type: String,
      trim: true,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

eventSchema.plugin(toJSON);

export default mongoose.models.Event || mongoose.model("Event", eventSchema);
