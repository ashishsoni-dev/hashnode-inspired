import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true, minlength: 1, maxlength: 1000 },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null, index: true },
}, { timestamps: true });

commentSchema.index({ post: 1, parentComment: 1, createdAt: 1 });

export default mongoose.model("Comment", commentSchema);
