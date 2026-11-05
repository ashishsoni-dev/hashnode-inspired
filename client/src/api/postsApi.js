import api, { getData, getPagination } from "./axios";

export async function getPosts(params = {}) {
    const response = await api.get("/posts", { params });
    return { posts: getData(response) ?? [], pagination: getPagination(response) };
}

export async function getFeaturedPosts() {
    const response = await api.get("/posts/featured");
    return getData(response) ?? [];
}

export async function getPostBySlug(slug) {
    const response = await api.get(`/posts/${encodeURIComponent(slug)}`);
    return getData(response);
}

export async function getMyPosts() {
    const response = await api.get("/posts/mine");
    return getData(response) ?? [];
}

export async function getMyPostById(id) {
    const response = await api.get(`/posts/mine/${id}`);
    return getData(response);
}

export async function createPost(details) {
    const response = await api.post("/posts", details);
    return getData(response);
}

export async function updatePost(id, details) {
    const response = await api.put(`/posts/${id}`, details);
    return getData(response);
}

export async function deletePost(id) {
    await api.delete(`/posts/${id}`);
}
