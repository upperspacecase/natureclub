import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const facilitatorSchema = mongoose.Schema(
    {
        clerkUserId: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            trim: true,
            required: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            required: true,
            private: true,
        },
        phone: {
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
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
    }
);

facilitatorSchema.plugin(toJSON);

export default mongoose.models.Facilitator ||
    mongoose.model("Facilitator", facilitatorSchema);
