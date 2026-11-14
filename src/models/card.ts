import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, required: true, ref: "user"},
    product: { type: mongoose.Types.ObjectId, required: true, ref: "product"},
    count: {type: Number, required: true, default: 1}
  },
  {
    timestamps: true,
  },
);

const cardModel = mongoose.models.card || mongoose.model("card", cardSchema);
export default cardModel;
