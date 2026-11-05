import api, { getData, getPagination } from "./axios";

export async function getTags() {
    const response = await api.get("/tags");
    return getData(response) ?? [];
}

export async function getPostsByTag(slug, params = {}) {
    const response = await api.get(`/tags/${encodeURIComponent(slug)}/posts`, { params });
    return {
        posts: getData(response) ?? [],
        tag: response.data?.tag ?? null,
        pagination: getPagination(response),
    };
}

export async function createOrGetTag(name) {
    const response = await api.post("/tags", { name });
    return getData(response);
}
