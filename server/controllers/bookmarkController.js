import Bookmark from "../models/Bookmark.js";
import Post from "../models/Post.js";
import { formatPosts } from "../utils/formatters.js";
import { paginationMetadata, parsePagination } from "../utils/content.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";

export const listMyBookmarks = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query, { limit: 9, maxLimit: 50 });
    const savedEntries = await Bookmark.find({ user: req.user._id }).select("post").lean();
    const savedPostIds = savedEntries.map((entry) => entry.post);
    const publishedPosts = savedPostIds.length
        ? await Post.find({ _id: { $in: savedPostIds }, status: "published" }).select("_id").lean()
        : [];
    const publishedIds = publishedPosts.map((post) => post._id);
    const query = { user: req.user._id, post: { $in: publishedIds } };

    const [bookmarks, total] = await Promise.all([
        Bookmark.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: "post",
                populate: [
                    { path: "author", select: "name username bio avatarUrl" },
                    { path: "tags", select: "name slug" },
                ],
            }).lean(),
        Bookmark.countDocuments(query),
    ]);

    const posts = bookmarks.map((bookmark) => bookmark.post).filter(Boolean);
    return sendSuccess(res, await formatPosts(posts, req.user._id), 200, {
        pagination: paginationMetadata(page, limit, total),
    });
});
