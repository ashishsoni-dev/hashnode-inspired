import api, { getData } from "./axios";

export async function likePost(postId) {
    const response = await api.put(`/posts/${postId}/like`);
    return getData(response);
}

export async function unlikePost(postId) {
    const response = await api.delete(`/posts/${postId}/like`);
    return getData(response);
}

export async function bookmarkPost(postId) {
    const response = await api.put(`/posts/${postId}/bookmark`);
    return getData(response);
}

export async function unbookmarkPost(postId) {
    const response = await api.delete(`/posts/${postId}/bookmark`);
    return getData(response);
}
