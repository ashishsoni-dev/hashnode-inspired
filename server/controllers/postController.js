import Post from "../models/Post.js";
import Tag from "../models/Tag.js";
import Like from "../models/Like.js";
import Bookmark from "../models/Bookmark.js";
import Comment from "../models/Comment.js";
import CommentLike from "../models/CommentLike.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import validateObjectId from "../middleware/validateObjectId.js";
import { createUniquePostSlug } from "../utils/createSlug.js";
import { calculateReadingTime, escapeRegex, generateExcerpt, isHttpUrl, makeDraftSlug } from "../utils/content.js";
import { resolveTags } from "../utils/resolveTags.js";
import { paginationMetadata, parsePagination } from "../utils/content.js";
import { formatPosts } from "../utils/formatters.js";
import { sendSuccess } from "../utils/response.js";

const postPopulate = [
    { path: "author", select: "name username bio avatarUrl" },
    { path: "tags", select: "name slug" },
];

function parseStatus(value, fallback = "draft") {
    const status = value ?? fallback;
    if (!["draft", "published"].includes(status)) {
        throw new ApiError(400, "Post status must be either 'draft' or 'published'.");
    }
    return status;
}

function validatePublishPayload({ title, content, coverImage, tags }) {
    if (typeof title !== "string" || !title.trim()) throw new ApiError(400, "A title is required to publish a post.");
    if (title.trim().length > 180) throw new ApiError(400, "Title must be 180 characters or fewer.");
    if (typeof content !== "string" || !content.trim()) throw new ApiError(400, "Article content is required to publish a post.");
    if (content.length > 1000000) throw new ApiError(413, "Article content is too large.");
    if (!isHttpUrl(coverImage)) throw new ApiError(400, "A valid HTTP or HTTPS cover image URL is required to publish a post.");
    if (!Array.isArray(tags) || tags.length === 0) throw new ApiError(400, "At least one tag is required to publish a post.");
}

async function cascadeDeletePost(postId) {
    const comments = await Comment.find({ post: postId }).select("_id").lean();
    const commentIds = comments.map((comment) => comment._id);
    await Promise.all([
        Like.deleteMany({ post: postId }),
        Bookmark.deleteMany({ post: postId }),
        Comment.deleteMany({ post: postId }),
        ...(commentIds.length ? [CommentLike.deleteMany({ comment: { $in: commentIds } })] : []),
    ]);
}

export const listPublishedPosts = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query, { limit: 9, maxLimit: 50 });
    const query = { status: "published" };

    if (typeof req.query.search === "string" && req.query.search.trim()) {
        const search = req.query.search.trim().slice(0, 100);
        query.title = { $regex: escapeRegex(search), $options: "i" };
    }

    if (typeof req.query.tag === "string" && req.query.tag.trim()) {
        const tag = await Tag.findOne({ slug: req.query.tag.trim().toLowerCase() }).select("_id").lean();
        if (!tag) {
            return sendSuccess(res, [], 200, { pagination: paginationMetadata(page, limit, 0) });
        }
        query.tags = tag._id;
    }

    const sort = req.query.sort === "oldest" ? { publishedAt: 1, createdAt: 1 } : { publishedAt: -1, createdAt: -1 };
    const [posts, total] = await Promise.all([
        Post.find(query).sort(sort).skip(skip).limit(limit).populate(postPopulate).lean(),
        Post.countDocuments(query),
    ]);

    return sendSuccess(res, await formatPosts(posts, req.user?._id), 200, {
        pagination: paginationMetadata(page, limit, total),
    });
});

export const getFeaturedPosts = asyncHandler(async (req, res) => {
    const posts = await Post.find({ status: "published", featured: true })
        .sort({ publishedAt: -1 })
        .limit(6)
        .populate(postPopulate)
        .lean();
    return sendSuccess(res, await formatPosts(posts, req.user?._id));
});

export const getPublishedPostBySlug = asyncHandler(async (req, res) => {
    const post = await Post.findOne({ slug: req.params.slug, status: "published" })
        .populate(postPopulate)
        .lean();
    if (!post) throw new ApiError(404, "Published article not found.");
    const [formatted] = await formatPosts([post], req.user?._id, { includeContent: true });
    return sendSuccess(res, formatted);
});

export const createPost = asyncHandler(async (req, res) => {
    const { title = "", content = "", coverImage = "", tags: tagInput = [], status: statusInput = "draft" } = req.body ?? {};
    const status = parseStatus(statusInput);

    if ([title, content, coverImage].some((value) => typeof value !== "string")) {
        throw new ApiError(400, "Title, content and coverImage must be strings.");
    }
    if (content.length > 1000000) throw new ApiError(413, "Article content is too large.");
    if (coverImage.trim() && !isHttpUrl(coverImage.trim())) throw new ApiError(400, "Cover image must be a valid HTTP or HTTPS URL.");

    const tagIds = await resolveTags(tagInput);
    if (status === "published") validatePublishPayload({ title, content, coverImage: coverImage.trim(), tags: tagIds });

    const titleSlug = title.trim()
        ? await createUniquePostSlug(Post, title.trim())
        : null;
    const slug = titleSlug || (status === "draft" ? makeDraftSlug(req.user._id) : null);
    if (!slug) throw new ApiError(400, "A published article title must contain letters or numbers.");

    const post = await Post.create({
        title: title.trim(),
        slug,
        content,
        coverImage: coverImage.trim(),
        status,
        author: req.user._id,
        tags: tagIds,
        publishedAt: status === "published" ? new Date() : null,
        // Never accept a client-supplied featured flag.
        featured: false,
        excerpt: generateExcerpt(content),
        readTime: calculateReadingTime(content),
    });

    const populated = await Post.findById(post._id).populate(postPopulate).lean();
    const [formatted] = await formatPosts([populated], req.user._id, { includeContent: true });
    return sendSuccess(res, formatted, 201);
});

export const listMyPosts = asyncHandler(async (req, res) => {
    const posts = await Post.find({ author: req.user._id })
        .sort({ updatedAt: -1 })
        .populate(postPopulate)
        .lean();
    return sendSuccess(res, await formatPosts(posts, req.user._id));
});

export const getMyPostById = asyncHandler(async (req, res) => {
    validateObjectId(req.params.id, "post id");
    const post = await Post.findOne({ _id: req.params.id, author: req.user._id })
        .populate(postPopulate)
        .lean();
    if (!post) throw new ApiError(404, "Your article was not found.");
    const [formatted] = await formatPosts([post], req.user._id, { includeContent: true });
    return sendSuccess(res, formatted);
});

export const updatePost = asyncHandler(async (req, res) => {
    validateObjectId(req.params.id, "post id");
    const post = await Post.findOne({ _id: req.params.id, author: req.user._id });
    if (!post) throw new ApiError(404, "Your article was not found.");

    const body = req.body ?? {};
    const nextStatus = body.status !== undefined
        ? parseStatus(body.status, post.status)
        : post.status;

    if (body.title !== undefined) {
        if (typeof body.title !== "string") throw new ApiError(400, "Title must be a string.");
        if (body.title.trim().length > 180) throw new ApiError(400, "Title must be 180 characters or fewer.");
        const nextTitle = body.title.trim();
        if (nextTitle && nextTitle !== post.title) {
            const nextSlug = await createUniquePostSlug(Post, nextTitle, { excludeId: post._id });
            if (nextSlug) {
                post.slug = nextSlug;
            } else if (nextStatus === "published") {
                throw new ApiError(400, "A published article title must contain letters or numbers.");
            }
        }
        post.title = nextTitle;
    }
    if (body.content !== undefined) {
        if (typeof body.content !== "string") throw new ApiError(400, "Content must be a string.");
        if (body.content.length > 1000000) throw new ApiError(413, "Article content is too large.");
        post.content = body.content;
    }
    if (body.coverImage !== undefined) {
        if (typeof body.coverImage !== "string") throw new ApiError(400, "Cover image must be a string.");
        const url = body.coverImage.trim();
        if (url && !isHttpUrl(url)) throw new ApiError(400, "Cover image must be a valid HTTP or HTTPS URL.");
        post.coverImage = url;
    }
    if (body.tags !== undefined) post.tags = await resolveTags(body.tags);
    post.status = nextStatus;

    if (post.status === "published") {
        if (post.slug.startsWith("draft-")) {
            const publishSlug = await createUniquePostSlug(Post, post.title, { excludeId: post._id });
            if (!publishSlug) throw new ApiError(400, "A published article title must contain letters or numbers.");
            post.slug = publishSlug;
        }
        validatePublishPayload({ title: post.title, content: post.content, coverImage: post.coverImage, tags: post.tags });
        if (!post.publishedAt) post.publishedAt = new Date();
    } else {
        post.publishedAt = null;
    }

    if (post.isModified("content")) {
        post.excerpt = generateExcerpt(post.content);
        post.readTime = calculateReadingTime(post.content);
    }

    await post.save();
    const populated = await Post.findById(post._id).populate(postPopulate).lean();
    const [formatted] = await formatPosts([populated], req.user._id, { includeContent: true });
    return sendSuccess(res, formatted);
});

export const deletePost = asyncHandler(async (req, res) => {
    validateObjectId(req.params.id, "post id");
    const post = await Post.findOneAndDelete({ _id: req.params.id, author: req.user._id });
    if (!post) throw new ApiError(404, "Your article was not found.");
    await cascadeDeletePost(post._id);
    return res.status(204).send();
});
