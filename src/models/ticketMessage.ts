import mongoose from "mongoose";

const tickeMessageSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },
    messageBody: {
      type: String,
      required: true,
    },
    ticket: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true },
);

const ticketMessageModel =
  mongoose.models.ticket_message ||
  mongoose.model("ticket_message", tickeMessageSchema);
export default ticketMessageModel;
