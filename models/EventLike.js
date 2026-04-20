import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const eventLikeSchema = mongoose.Schema(
  {
    eventId: {
      type: String,
      trim: true,
      required: true,
    },
    // Anonymous save (pre-auth) — kept for backward compatibility.
    clientId: {
      type: String,
      trim: true,
      default: "",
    },
    // Authenticated save — preferred when the viewer is signed in.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// One like per (event, client) for anonymous, or (event, user) for authed.
eventLikeSchema.index(
  { eventId: 1, clientId: 1 },
  { unique: true, partialFilterExpression: { clientId: { $ne: "" } } }
);
eventLikeSchema.index(
  { eventId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { userId: { $type: "objectId" } } }
);

eventLikeSchema.plugin(toJSON);

export default mongoose.models.EventLike ||
  mongoose.model("EventLike", eventLikeSchema);
