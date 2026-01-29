import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const visitSessionSchema = mongoose.Schema(
  {
    durationMs: {
      type: Number,
      min: 0,
      required: true,
    },
    country: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

visitSessionSchema.plugin(toJSON);

export default mongoose.models.VisitSession ||
  mongoose.model("VisitSession", visitSessionSchema);
