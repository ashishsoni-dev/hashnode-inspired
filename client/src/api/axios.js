import axios from "axios";

export const TOKEN_KEY = "hashnode-auth-token";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add the saved JWT to requests automatically. Public requests work without it.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && error.config?.headers?.Authorization) {
            window.dispatchEvent(new Event("hashnode:session-expired"));
        }

        return Promise.reject(error);
    }
);

export function getData(response) {
    return response.data?.data;
}

export function getPagination(response) {
    return response.data?.pagination ?? null;
}

export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
    const serverMessage =
        error?.response?.data?.error?.message || error?.response?.data?.message;

    if (serverMessage) {
        return serverMessage;
    }

    if (error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT") {
        return "The request took too long. Please try again.";
    }

    if (!error?.response && (error?.request || error?.code === "ERR_NETWORK")) {
        return "Unable to connect to the server. Check your connection and try again.";
    }

    if (error?.response?.status >= 500) {
        return "The server encountered a problem. Please try again shortly.";
    }

    return fallback;
}

export default api;
