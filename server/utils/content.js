export function stripMarkdown(markdown = "") {
    return String(markdown)
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        .replace(/^\s{0,3}#{1,6}\s+/gm, "")
        .replace(/^\s*>\s?/gm, "")
        .replace(/[*_~]/g, "")
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export function generateExcerpt(content = "", maxLength = 250) {
    const plainText = stripMarkdown(content);
    if (plainText.length <= maxLength) return plainText;
    return `${plainText.slice(0, maxLength - 1).trimEnd()}…`;
}

export function calculateReadingTime(content = "") {
    const words = stripMarkdown(content).split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
}

export function isHttpUrl(value, { allowEmpty = false } = {}) {
    if (allowEmpty && (value === undefined || value === null || value === "")) return true;
    if (typeof value !== "string" || !value.trim()) return false;

    try {
        const parsed = new URL(value);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
}

export function normalizeTagName(value) {
    return String(value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

export function normalizeTagInput(tags) {
    if (tags === undefined || tags === null) return [];
    if (!Array.isArray(tags)) return [tags];

    const byKey = new Map();

    for (const value of tags) {
        const rawName = typeof value === "string"
            ? value
            : value?.name ?? value?.slug ?? "";
        const name = String(rawName).trim().replace(/\s+/g, " ");
        if (!name) continue;
        const key = normalizeTagName(name);
        if (!byKey.has(key)) byKey.set(key, value);
    }

    return [...byKey.values()];
}

export function makeDraftSlug(authorId) {
    const safeId = String(authorId ?? "user").slice(-8).replace(/[^a-z0-9]/gi, "") || "user";
    return `draft-${safeId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parsePagination(query = {}, defaults = {}) {
    const defaultLimit = defaults.limit ?? 9;
    const maxLimit = defaults.maxLimit ?? 50;
    const page = Number.parseInt(query.page, 10);
    const requestedLimit = Number.parseInt(query.limit, 10);
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit = Number.isFinite(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, maxLimit)
        : defaultLimit;

    return { page: safePage, limit: safeLimit, skip: (safePage - 1) * safeLimit };
}

export function paginationMetadata(page, limit, total) {
    const totalPages = Math.ceil(total / limit);
    return {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
    };
}
