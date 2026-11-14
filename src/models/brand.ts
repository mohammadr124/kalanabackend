import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    barndName: {
      type: String,
      required: true,
    },
    barndDescription: {
      type: String,
      required: true,
    },
    barndImageUrl: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true },
);

const brandModel =
  mongoose.models.brand || mongoose.model("brand", brandSchema);

export default brandModel;
