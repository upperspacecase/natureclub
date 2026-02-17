import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const userSchema = mongoose.Schema(
  {
    phone: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 280,
      default: "",
    },
    username: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    photoUrl: {
      type: String,
      trim: true,
      default: "",
    },
    hostingOn: {
      type: Boolean,
      default: false,
    },
    // Stripe fields (kept for future payment integration)
    customerId: {
      type: String,
      validate(value) {
        return value.includes("cus_");
      },
    },
    priceId: {
      type: String,
      validate(value) {
        return value.includes("price_");
      },
    },
    hasAccess: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

userSchema.plugin(toJSON);

export default mongoose.models.User || mongoose.model("User", userSchema);
