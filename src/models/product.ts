import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      required: true,
      type: String,
    },
    category: {
      required: true,
      type: String,
    },
    images: [{ required: true, type: String }],
    brand: {
      required: true,
      ref: "brand",
      type: mongoose.Types.ObjectId,
    },
    atributes: [
      {
        required: true,
        type: String,
      },
    ],
    price: {
      required: true,
      type: Number,
    },
    count: {
      required: true,
      type: Number,
    },
    rate: {
      required: true,
      type: Number,
    },
    intro: {
      required: true,
      type: String,
    },
    productAtribute: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const productModel =
  mongoose.models.product || mongoose.model("product", productSchema);
export default productModel;
