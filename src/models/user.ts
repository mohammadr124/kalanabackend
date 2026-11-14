import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      default: "USER",
    },
    resetToken: {
      type: String,
      required: false,
      default: null
    },
    resetTokenexpTime: {
      type: Date,
      required: false,
      default: null
    },
    isBan: {
      type: Boolean,
      default: false, 
      required: true
    }
  },
  {
    timestamps: true,
  },
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
