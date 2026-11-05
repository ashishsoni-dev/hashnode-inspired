import api, { getData, getPagination } from "./axios";

export async function getPublicProfile(identifier, params = {}) {
    const response = await api.get(`/users/${encodeURIComponent(identifier)}`, { params });
    const data = getData(response);
    return {
        user: data.user,
        posts: data.posts ?? [],
        pagination: data.pagination ?? getPagination(response),
    };
}

export async function updateMyProfile(details) {
    const response = await api.put("/users/me", details);
    return getData(response).user;
}

export async function followUser(identifier) {
    const response = await api.put(`/users/${encodeURIComponent(identifier)}/follow`);
    return getData(response);
}

export async function unfollowUser(identifier) {
    const response = await api.delete(`/users/${encodeURIComponent(identifier)}/follow`);
    return getData(response);
}

export async function getMyBookmarks(params = {}) {
    const response = await api.get("/users/me/bookmarks", { params });
    return { posts: getData(response) ?? [], pagination: getPagination(response) };
}

export async function getMyFollowing(params = {}) {
    const response = await api.get("/users/me/following", { params });
    return { users: getData(response) ?? [], pagination: getPagination(response) };
}

export async function getMyFollowers(params = {}) {
    const response = await api.get("/users/me/followers", { params });
    return { users: getData(response) ?? [], pagination: getPagination(response) };
}
