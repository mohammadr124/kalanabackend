import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    star: { type: Number, required: true },
    author: { type: mongoose.Types.ObjectId, ref: "user", required: true },
    product: { type: mongoose.Types.ObjectId, ref: "product", required: true },
    text: { type: String, required: true },
    isShow: {type:Boolean, required: true}
  },
  { timestamps: true },
);

const commentModel =  mongoose.models.comment || mongoose.model("comment", commentSchema)
export default commentModel