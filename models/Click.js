import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const clickSchema = mongoose.Schema(
  {
    type: {
      type: String,
      trim: true,
      required: true,
      enum: ["member_click", "host_click"],
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

clickSchema.plugin(toJSON);

export default mongoose.models.Click || mongoose.model("Click", clickSchema);
