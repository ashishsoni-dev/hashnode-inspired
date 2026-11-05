import mongoose from "mongoose";

const commentLikeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

commentLikeSchema.index({ user: 1, comment: 1 }, { unique: true });
commentLikeSchema.index({ comment: 1 });

export default mongoose.model("CommentLike", commentLikeSchema);
