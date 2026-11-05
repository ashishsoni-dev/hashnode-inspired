import api, { getData, getPagination } from "./axios";

export async function getPostComments(postId, page = 1) {
    const response = await api.get(`/posts/${postId}/comments`, {
        params: { page, limit: 20 },
    });
    return { comments: getData(response) ?? [], pagination: getPagination(response) };
}

export async function addComment(postId, content, parentCommentId) {
    const response = await api.post(`/posts/${postId}/comments`, {
        content,
        ...(parentCommentId ? { parentCommentId } : {}),
    });
    return getData(response);
}

export async function updateComment(commentId, content) {
    const response = await api.put(`/comments/${commentId}`, { content });
    return getData(response);
}

export async function deleteComment(commentId) {
    await api.delete(`/comments/${commentId}`);
}

export async function likeComment(commentId) {
    const response = await api.put(`/comments/${commentId}/like`);
    return getData(response);
}

export async function unlikeComment(commentId) {
    const response = await api.delete(`/comments/${commentId}/like`);
    return getData(response);
}
