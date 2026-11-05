import mongoose from "mongoose";
import { calculateReadingTime, generateExcerpt, isHttpUrl } from "../utils/content.js";

const postSchema = new mongoose.Schema({
    title: { type: String, trim: true, default: "", maxlength: 180 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 120 },
    content: { type: String, default: "", maxlength: 1000000 },
    excerpt: { type: String, maxlength: 250, default: "" },
    coverImage: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
    publishedAt: { type: Date, default: null, index: true },

    featured: { type: Boolean, default: false, select: true },
    readTime: { type: Number, min: 1, default: 1 },
}, { timestamps: true });

postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ author: 1, updatedAt: -1 });
postSchema.index({ tags: 1, status: 1, publishedAt: -1 });
postSchema.index({ title: "text" });

postSchema.pre("validate", function validatePublishedPost() {
    if (this.status !== "published") return;

    if (!this.title?.trim()) this.invalidate("title", "A title is required to publish a post.");
    if (!this.content?.trim()) this.invalidate("content", "Article content is required to publish a post.");
    if (!this.coverImage?.trim() || !isHttpUrl(this.coverImage)) {
        this.invalidate("coverImage", "A valid HTTP or HTTPS cover image URL is required to publish a post.");
    }
    if (!this.tags?.length) this.invalidate("tags", "At least one tag is required to publish a post.");
});

postSchema.pre("save", function deriveArticleMetadata() {
    if (this.isModified("content")) {
        this.excerpt = generateExcerpt(this.content, 250);
        this.readTime = calculateReadingTime(this.content);
    }
});

const Post = mongoose.model("Post", postSchema);
export default Post;
