import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import CommentLike from "../models/CommentLike.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import validateObjectId from "../middleware/validateObjectId.js";
import { sendSuccess } from "../utils/response.js";
import { paginationMetadata, parsePagination } from "../utils/content.js";

function plainComment(comment, likeCounts, likedByViewer) {
    const author = comment.author;
    const id = comment._id.toString();
    return {
        id,
        postId: comment.post.toString(),
        userId: author?.username ?? author?.name ?? "Unknown user",
        author: author ? {
            id: author._id.toString(),
            name: author.name,
            username: author.username,
            avatarUrl: author.avatarUrl ?? "",
        } : null,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        likes: likeCounts.get(id) ?? 0,
        isLiked: likedByViewer.has(id),
    };
}

async function ensurePublishedPost(postId) {
    validateObjectId(postId, "post id");
    const post = await Post.findOne({ _id: postId, status: "published" }).select("_id");
    if (!post) throw new ApiError(404, "Published article not found.");
    return post;
}

export const listPostComments = asyncHandler(async (req, res) => {
    const post = await ensurePublishedPost(req.params.id);
    const { page, limit, skip } = parsePagination(req.query, { limit: 20, maxLimit: 100 });
    const rootQuery = { post: post._id, parentComment: null };

    const [roots, total] = await Promise.all([
        Comment.find(rootQuery).sort({ createdAt: 1 }).skip(skip).limit(limit)
            .populate({ path: "author", select: "name username avatarUrl" }).lean(),
        Comment.countDocuments(rootQuery),
    ]);

    const rootIds = roots.map((item) => item._id);
    const replies = rootIds.length
        ? await Comment.find({ post: post._id, parentComment: { $in: rootIds } })
            .sort({ createdAt: 1 })
            .populate({ path: "author", select: "name username avatarUrl" }).lean()
        : [];
    const allComments = [...roots, ...replies];
    const commentIds = allComments.map((item) => item._id);
    const [counts, viewerLikes] = await Promise.all([
        CommentLike.aggregate([
            { $match: { comment: { $in: commentIds } } },
            { $group: { _id: "$comment", count: { $sum: 1 } } },
        ]),
        req.user && commentIds.length
            ? CommentLike.find({ user: req.user._id, comment: { $in: commentIds } }).select("comment").lean()
            : [],
    ]);

    const likeCounts = new Map(counts.map((item) => [item._id.toString(), item.count]));
    const likedByViewer = new Set(viewerLikes.map((item) => item.comment.toString()));
    const repliesByParent = new Map();
    for (const reply of replies) {
        const parentId = reply.parentComment.toString();
        if (!repliesByParent.has(parentId)) repliesByParent.set(parentId, []);
        repliesByParent.get(parentId).push(plainComment(reply, likeCounts, likedByViewer));
    }

    const data = roots.map((root) => ({
        ...plainComment(root, likeCounts, likedByViewer),
        replies: repliesByParent.get(root._id.toString()) ?? [],
    }));

    return sendSuccess(res, data, 200, { pagination: paginationMetadata(page, limit, total) });
});

export const createPostComment = asyncHandler(async (req, res) => {
    const post = await ensurePublishedPost(req.params.id);
    const content = typeof req.body?.content === "string" ? req.body.content.trim() : "";
    if (!content) throw new ApiError(400, "Comment content is required.");
    if (content.length > 1000) throw new ApiError(400, "Comments must be 1,000 characters or fewer.");

    let parentComment = null;
    if (req.body?.parentCommentId) {
        validateObjectId(req.body.parentCommentId, "parent comment id");
        const parent = await Comment.findOne({
            _id: req.body.parentCommentId,
            post: post._id,
            parentComment: null,
        }).select("_id");
        if (!parent) throw new ApiError(400, "A reply must reference an existing top-level comment on this article.");
        parentComment = parent._id;
    }

    const comment = await Comment.create({ post: post._id, author: req.user._id, content, parentComment });
    const populated = await Comment.findById(comment._id)
        .populate({ path: "author", select: "name username avatarUrl" }).lean();
    return sendSuccess(res, {
        ...plainComment(populated, new Map(), new Set()),
        ...(parentComment ? {} : { replies: [] }),
    }, 201);
});

export const updateComment = asyncHandler(async (req, res) => {
    validateObjectId(req.params.id, "comment id");
    const content = typeof req.body?.content === "string" ? req.body.content.trim() : "";
    if (!content) throw new ApiError(400, "Comment content is required.");
    if (content.length > 1000) throw new ApiError(400, "Comments must be 1,000 characters or fewer.");

    const comment = await Comment.findOneAndUpdate(
        { _id: req.params.id, author: req.user._id },
        { $set: { content } },
        { new: true, runValidators: true }
    ).populate({ path: "author", select: "name username avatarUrl" }).lean();
    if (!comment) throw new ApiError(404, "Your comment was not found.");
    const likes = await CommentLike.countDocuments({ comment: comment._id });
    return sendSuccess(res, { ...plainComment(comment, new Map([[comment._id.toString(), likes]]), new Set()) });
});

export const deleteComment = asyncHandler(async (req, res) => {
    validateObjectId(req.params.id, "comment id");
    const comment = await Comment.findOneAndDelete({ _id: req.params.id, author: req.user._id });
    if (!comment) throw new ApiError(404, "Your comment was not found.");

    const ids = [comment._id];
    if (comment.parentComment === null) {
        const replies = await Comment.find({ parentComment: comment._id }).select("_id").lean();
        ids.push(...replies.map((reply) => reply._id));
        await Comment.deleteMany({ parentComment: comment._id });
    }
    await CommentLike.deleteMany({ comment: { $in: ids } });
    return res.status(204).send();
});

async function findComment(commentId) {
    validateObjectId(commentId, "comment id");
    const comment = await Comment.findById(commentId).select("_id post");
    if (!comment) throw new ApiError(404, "Comment not found.");
    const post = await Post.findOne({ _id: comment.post, status: "published" }).select("_id");
    if (!post) throw new ApiError(404, "Comment not found.");
    return comment;
}

export const likeComment = asyncHandler(async (req, res) => {
    const comment = await findComment(req.params.id);
    await CommentLike.updateOne(
        { user: req.user._id, comment: comment._id },
        { $setOnInsert: { user: req.user._id, comment: comment._id } },
        { upsert: true }
    );
    const likes = await CommentLike.countDocuments({ comment: comment._id });
    return sendSuccess(res, { isLiked: true, likes });
});

export const unlikeComment = asyncHandler(async (req, res) => {
    const comment = await findComment(req.params.id);
    await CommentLike.deleteOne({ user: req.user._id, comment: comment._id });
    const likes = await CommentLike.countDocuments({ comment: comment._id });
    return sendSuccess(res, { isLiked: false, likes });
});
