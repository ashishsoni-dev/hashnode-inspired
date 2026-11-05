function slugifyTag(value) {
    return value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");
}

export function getPostTags(post) {
    const source = Array.isArray(post?.tags)
        ? post.tags
        : post?.tag
            ? [post.tag]
            : [];

    return source
        .map((tag) => {
            if (typeof tag === "string") {
                return {
                    id: slugifyTag(tag),
                    name: tag,
                    slug: slugifyTag(tag),
                };
            }

            if (!tag || typeof tag !== "object") {
                return null;
            }

            const name = tag.name || tag.label || "";
            const slug = tag.slug || (name ? slugifyTag(name) : "");

            if (!name || !slug) {
                return null;
            }

            return {
                id: tag.id || tag._id || slug,
                name,
                slug,
            };
        })
        .filter(Boolean);
}