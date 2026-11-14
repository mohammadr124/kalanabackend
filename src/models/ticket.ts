import mongoose from "mongoose";

const tiketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    lastUpdate: {
      type: Date,
      required: true,
      default: null,
    },
    author: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const ticketModel =
  mongoose.models.ticket || mongoose.model("ticket", tiketSchema);
export default ticketModel;
