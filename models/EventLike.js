import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const eventLikeSchema = mongoose.Schema(
  {
    eventId: {
      type: String,
      trim: true,
      required: true,
    },
    clientId: {
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

eventLikeSchema.index({ eventId: 1, clientId: 1 }, { unique: true });
eventLikeSchema.plugin(toJSON);

export default mongoose.models.EventLike ||
  mongoose.model("EventLike", eventLikeSchema);
