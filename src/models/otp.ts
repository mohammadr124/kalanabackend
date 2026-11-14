import mongoose from "mongoose";

const otpCodeSchema = new mongoose.Schema(
  {
    code: {
      type: Number,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    expTime: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const otpModel = mongoose.models.otp || mongoose.model("otp", otpCodeSchema);
export default otpModel;
