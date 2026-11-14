import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    receiverName: { type: String, required: true }, // *
    receiverLastName: { type: String, required: true },
    receiverPhone: { type: String, required: true }, //*
    receiverAddress: { type: String, required: true },
    receiverCityAddress: { type: String, required: true },
    receiverMainAddress: { type: String, required: true },
    postCode: { type: String, required: true },
    plaque: { type: String, required: true },
    description: { type: String, required: false },
    orderPrice: { type: Number, required: true },
    orderOwner: { type: mongoose.Types.ObjectId, required: true, ref: "user" },
    items: [
      {
        user: { type: mongoose.Types.ObjectId, required: true, ref: "user" },
        product: {
          title: { type: String, required: true },
          images: [{ type: String, required: true }],
          price: { type: Number, required: true },
          intro: { type: String, required: true },
        },
        count: { type: Number, required: true },
        createdAt: { type: Date, required: true },
        updatedAt: { type: Date, required: true },
      },
    ],
    orderId: { type: String, required: true },
    shippingStatus: {
      type: String,
      enum: ["PENDING", "PROCESSING", "DELIVERED", "CANCELLED"],
      default: "PENDING",
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const orderModel =
  mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;
