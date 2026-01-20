import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const visitSchema = mongoose.Schema(
  {
    date: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

visitSchema.plugin(toJSON);

export default mongoose.models.Visit || mongoose.model("Visit", visitSchema);
