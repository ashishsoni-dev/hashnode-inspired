export function createSlug(value) {
    return String(value ?? "")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 90)
        .replace(/-+$/g, "");
}

export async function createUniquePostSlug(Post, title, { excludeId } = {}) {
    const baseSlug = createSlug(title);

    if (!baseSlug) {
        return null;
    }

    let candidate = baseSlug;
    let suffix = 2;

    while (true) {
        const query = { slug: candidate };
        if (excludeId) query._id = { $ne: excludeId };
        const existing = await Post.exists(query);
        if (!existing) return candidate;
        candidate = `${baseSlug}-${suffix}`;
        suffix += 1;
    }
}

export async function createUniqueUsername(User, name) {
    const rawBase = createSlug(name) || "developer";
    const base = rawBase.length < 3 ? `${rawBase}-user` : rawBase.slice(0, 25);
    let candidate = base;
    let suffix = 2;

    while (await User.exists({ username: candidate })) {
        const suffixText = String(suffix);
        candidate = `${base.slice(0, 30 - suffixText.length)}${suffixText}`;
        suffix += 1;
    }

    return candidate;
}

export async function createUniqueTagSlug(Tag, name) {
    const base = createSlug(name);
    if (!base) return null;

    let candidate = base;
    let suffix = 2;

    while (await Tag.exists({ slug: candidate })) {
        candidate = `${base}-${suffix}`;
        suffix += 1;
    }

    return candidate;
}
