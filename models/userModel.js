import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // require: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
    },
    mobile: {
      type: Number,
      // require: true,
    },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "address",
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin", "staff"],
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("user", userSchema);
