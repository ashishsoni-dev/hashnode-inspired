import Like from "../models/Like.js";
import Bookmark from "../models/Bookmark.js";
import Comment from "../models/Comment.js";
import Follow from "../models/Follow.js";

function plainId(value) {
    if (value === undefined || value === null) return null;
    if (value?._id && value._id !== value) return value._id.toString();
    if (typeof value.toHexString === "function") return value.toHexString();
    return value.toString();
}

export function formatAuthor(author) {
    if (!author) return null;
    return {
        id: plainId(author),
        name: author.name,
        username: author.username,
        bio: author.bio ?? "",
        avatarUrl: author.avatarUrl ?? "",
    };
}

export async function formatPosts(posts, viewerId = null, { includeContent = false } = {}) {
    if (!posts.length) return [];

    const ids = posts.map((post) => post._id);
    const match = { post: { $in: ids } };
    const [likes, bookmarks, comments, viewerLikes, viewerBookmarks] = await Promise.all([
        Like.aggregate([{ $match: match }, { $group: { _id: "$post", count: { $sum: 1 } } }]),
        Bookmark.aggregate([{ $match: match }, { $group: { _id: "$post", count: { $sum: 1 } } }]),
        Comment.aggregate([{ $match: { ...match, parentComment: null } }, { $group: { _id: "$post", count: { $sum: 1 } } }]),
        viewerId ? Like.find({ ...match, user: viewerId }).select("post").lean() : [],
        viewerId ? Bookmark.find({ ...match, user: viewerId }).select("post").lean() : [],
    ]);

    const toMap = (items) => new Map(items.map((item) => [plainId(item._id), item.count]));
    const likeCounts = toMap(likes);
    const bookmarkCounts = toMap(bookmarks);
    const commentCounts = toMap(comments);
    const liked = new Set(viewerLikes.map((item) => plainId(item.post)));
    const bookmarked = new Set(viewerBookmarks.map((item) => plainId(item.post)));

    return posts.map((post) => {
        const id = plainId(post);
        const author = formatAuthor(post.author);
        const tags = (post.tags ?? []).filter(Boolean).map((tag) => ({
            id: plainId(tag),
            name: tag.name,
            slug: tag.slug,
        }));
        const likesCount = likeCounts.get(id) ?? 0;
        const bookmarksCount = bookmarkCounts.get(id) ?? 0;

        return {
            id,
            slug: post.slug,
            title: post.title,
            ...(includeContent ? { content: post.content } : {}),
            excerpt: post.excerpt,
            description: post.excerpt,
            coverImage: post.coverImage,
            thumbnail: post.coverImage,
            status: post.status,
            author: author?.name ?? "Unknown author",
            authorId: author?.username ?? author?.id,
            authorProfile: author,
            tags,
            tag: tags[0]?.name ?? "",
            featured: Boolean(post.featured),
            readTime: post.readTime ?? 1,
            publishedAt: post.publishedAt,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            likes: likesCount,
            likesCount,
            commentCount: commentCounts.get(id) ?? 0,
            bookmarks: bookmarksCount,
            bookmarksCount,
            isLiked: liked.has(id),
            isBookmarked: bookmarked.has(id),
        };
    });
}

export async function getFollowStats(userId) {
    const [followers, following] = await Promise.all([
        Follow.countDocuments({ following: userId }),
        Follow.countDocuments({ follower: userId }),
    ]);
    return { followers, following };
}
