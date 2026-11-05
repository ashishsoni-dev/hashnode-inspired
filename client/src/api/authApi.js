import api, { getData } from "./axios";

export async function registerUser(details) {
    const response = await api.post("/auth/register", details);
    return getData(response);
}

export async function loginUser(details) {
    const response = await api.post("/auth/login", details);
    return getData(response);
}

export async function getCurrentUser() {
    const response = await api.get("/auth/me");
    return getData(response).user;
}
