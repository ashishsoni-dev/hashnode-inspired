import Post from "../models/Post.js";
import Like from "../models/Like.js";
import Bookmark from "../models/Bookmark.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import validateObjectId from "../middleware/validateObjectId.js";
import { sendSuccess } from "../utils/response.js";

async function getPublishedPost(postId) {
    validateObjectId(postId, "post id");
    const post = await Post.findOne({ _id: postId, status: "published" }).select("_id");
    if (!post) throw new ApiError(404, "Published article not found.");
    return post;
}

export const likePost = asyncHandler(async (req, res) => {
    const post = await getPublishedPost(req.params.id);
    await Like.updateOne(
        { user: req.user._id, post: post._id },
        { $setOnInsert: { user: req.user._id, post: post._id } },
        { upsert: true }
    );
    const likes = await Like.countDocuments({ post: post._id });
    return sendSuccess(res, { isLiked: true, likes, likesCount: likes });
});

export const unlikePost = asyncHandler(async (req, res) => {
    const post = await getPublishedPost(req.params.id);
    await Like.deleteOne({ user: req.user._id, post: post._id });
    const likes = await Like.countDocuments({ post: post._id });
    return sendSuccess(res, { isLiked: false, likes, likesCount: likes });
});

export const bookmarkPost = asyncHandler(async (req, res) => {
    const post = await getPublishedPost(req.params.id);
    await Bookmark.updateOne(
        { user: req.user._id, post: post._id },
        { $setOnInsert: { user: req.user._id, post: post._id } },
        { upsert: true }
    );
    const bookmarks = await Bookmark.countDocuments({ post: post._id });
    return sendSuccess(res, { isBookmarked: true, bookmarks, bookmarksCount: bookmarks });
});

export const unbookmarkPost = asyncHandler(async (req, res) => {
    const post = await getPublishedPost(req.params.id);
    await Bookmark.deleteOne({ user: req.user._id, post: post._id });
    const bookmarks = await Bookmark.countDocuments({ post: post._id });
    return sendSuccess(res, { isBookmarked: false, bookmarks, bookmarksCount: bookmarks });
});
