import mongoose from "mongoose";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Follow from "../models/Follow.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { isHttpUrl, paginationMetadata, parsePagination } from "../utils/content.js";
import { formatPosts, getFollowStats } from "../utils/formatters.js";
import { sendSuccess } from "../utils/response.js";

function userLookup(identifier) {
    return mongoose.isObjectIdOrHexString(identifier)
        ? { _id: identifier }
        : { username: String(identifier).toLowerCase() };
}

export const getPublicProfile = asyncHandler(async (req, res) => {
    const user = await User.findOne(userLookup(req.params.id)).select("name username bio avatarUrl createdAt");
    if (!user) throw new ApiError(404, "Author profile not found.");

    const { page, limit, skip } = parsePagination(req.query, { limit: 9, maxLimit: 50 });
    const query = { author: user._id, status: "published" };
    const [posts, total, stats, isFollowing] = await Promise.all([
        Post.find(query).sort({ publishedAt: -1 }).skip(skip).limit(limit)
            .populate([
                { path: "author", select: "name username bio avatarUrl" },
                { path: "tags", select: "name slug" },
            ]).lean(),
        Post.countDocuments(query),
        getFollowStats(user._id),
        req.user ? Follow.exists({ follower: req.user._id, following: user._id }) : null,
    ]);

    return sendSuccess(res, {
        user: {
            ...user.toPublicJSON(),
            followers: stats.followers,
            following: stats.following,
            postCount: total,
            isFollowing: Boolean(isFollowing),
        },
        posts: await formatPosts(posts, req.user?._id),
        pagination: paginationMetadata(page, limit, total),
    });
});

export const updateMyProfile = asyncHandler(async (req, res) => {
    const { name, bio, avatarUrl } = req.body ?? {};

    if (name !== undefined) {
        if (typeof name !== "string" || !name.trim()) throw new ApiError(400, "Display name is required.");
        if (name.trim().length > 80) throw new ApiError(400, "Display name must be 80 characters or fewer.");
        req.user.name = name.trim();
    }
    if (bio !== undefined) {
        if (typeof bio !== "string") throw new ApiError(400, "Bio must be a string.");
        if (bio.trim().length > 200) throw new ApiError(400, "Bio must be 200 characters or fewer.");
        req.user.bio = bio.trim();
    }
    if (avatarUrl !== undefined) {
        if (typeof avatarUrl !== "string") throw new ApiError(400, "Avatar URL must be a string.");
        const cleanUrl = avatarUrl.trim();
        if (cleanUrl && !isHttpUrl(cleanUrl)) throw new ApiError(400, "Avatar URL must use HTTP or HTTPS.");
        req.user.avatarUrl = cleanUrl;
    }

    await req.user.save();
    const stats = await getFollowStats(req.user._id);
    return sendSuccess(res, {
        user: { ...req.user.toPublicJSON(), followers: stats.followers, following: stats.following },
    });
});

async function findTargetUser(identifier) {
    const user = await User.findOne(userLookup(identifier)).select("_id name username bio avatarUrl");
    if (!user) throw new ApiError(404, "User not found.");
    return user;
}

export const followUser = asyncHandler(async (req, res) => {
    const target = await findTargetUser(req.params.id);
    if (target._id.equals(req.user._id)) throw new ApiError(400, "You cannot follow yourself.");

    await Follow.updateOne(
        { follower: req.user._id, following: target._id },
        { $setOnInsert: { follower: req.user._id, following: target._id } },
        { upsert: true }
    );

    const stats = await getFollowStats(target._id);
    return sendSuccess(res, { following: true, followers: stats.followers, followingCount: stats.following });
});

export const unfollowUser = asyncHandler(async (req, res) => {
    const target = await findTargetUser(req.params.id);
    if (target._id.equals(req.user._id)) throw new ApiError(400, "You cannot unfollow yourself.");
    await Follow.deleteOne({ follower: req.user._id, following: target._id });
    const stats = await getFollowStats(target._id);
    return sendSuccess(res, { following: false, followers: stats.followers, followingCount: stats.following });
});

async function listRelationships(req, res, field) {
    const { page, limit, skip } = parsePagination(req.query, { limit: 20, maxLimit: 100 });
    const query = { [field]: req.user._id };
    const [relationships, total] = await Promise.all([
        Follow.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)
            .populate({ path: field === "follower" ? "following" : "follower", select: "name username bio avatarUrl" }).lean(),
        Follow.countDocuments(query),
    ]);
    const key = field === "follower" ? "following" : "follower";
    const users = relationships.map((item) => {
        const user = item[key];
        return {
            id: user._id.toString(),
            name: user.name,
            username: user.username,
            bio: user.bio,
            avatarUrl: user.avatarUrl,
        };
    });
    return sendSuccess(res, users, 200, { pagination: paginationMetadata(page, limit, total) });
}

export const listMyFollowing = asyncHandler(async (req, res) => listRelationships(req, res, "follower"));
export const listMyFollowers = asyncHandler(async (req, res) => listRelationships(req, res, "following"));
