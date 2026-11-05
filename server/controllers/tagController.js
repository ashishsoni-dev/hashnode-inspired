import Tag from "../models/Tag.js";
import Post from "../models/Post.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { createSlug, createUniqueTagSlug } from "../utils/createSlug.js";
import { paginationMetadata, parsePagination } from "../utils/content.js";
import { formatPosts } from "../utils/formatters.js";
import { sendSuccess } from "../utils/response.js";

export const listTags = asyncHandler(async (req, res) => {
    const tags = await Tag.find().sort({ name: 1 }).lean();
    const counts = await Post.aggregate([
        { $match: { status: "published" } },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((item) => [item._id.toString(), item.count]));

    return sendSuccess(res, tags.map((tag) => ({
        id: tag._id.toString(),
        name: tag.name,
        slug: tag.slug,
        count: countMap.get(tag._id.toString()) ?? 0,
    })));
});

export const listPostsByTag = asyncHandler(async (req, res) => {
    const tag = await Tag.findOne({ slug: req.params.slug.toLowerCase() }).select("_id name slug").lean();
    if (!tag) throw new ApiError(404, "Topic not found.");

    const { page, limit, skip } = parsePagination(req.query, { limit: 9, maxLimit: 50 });
    const query = { status: "published", tags: tag._id };
    const [posts, total] = await Promise.all([
        Post.find(query).sort({ publishedAt: -1 }).skip(skip).limit(limit)
            .populate([
                { path: "author", select: "name username bio avatarUrl" },
                { path: "tags", select: "name slug" },
            ]).lean(),
        Post.countDocuments(query),
    ]);

    return sendSuccess(res, await formatPosts(posts, req.user?._id), 200, {
        tag: { id: tag._id.toString(), name: tag.name, slug: tag.slug },
        pagination: paginationMetadata(page, limit, total),
    });
});

export const createTag = asyncHandler(async (req, res) => {
    const name = typeof req.body?.name === "string" ? req.body.name.trim().replace(/\s+/g, " ").toLowerCase() : "";
    if (!name) throw new ApiError(400, "Tag name is required.");
    if (name.length > 40) throw new ApiError(400, "Tag names must be 40 characters or fewer.");

    let tag = await Tag.findOne({ name });
    if (!tag) {
        const slugBase = createSlug(name);
        if (!slugBase) throw new ApiError(400, "Tag name must contain letters or numbers.");
        const slug = await createUniqueTagSlug(Tag, name);
        try {
            tag = await Tag.create({ name, slug });
        } catch (error) {
            if (error.code !== 11000) throw error;
            tag = await Tag.findOne({ name });
            if (!tag) throw error;
        }
    }

    return sendSuccess(res, {
        id: tag._id.toString(),
        name: tag.name,
        slug: tag.slug,
    }, 201);
});
