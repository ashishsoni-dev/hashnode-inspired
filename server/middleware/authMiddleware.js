import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

function getBearerToken(req) {
    const header = req.headers.authorization;
    if (!header) return null;
    const parts = header.trim().split(/\s+/);
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer" || !parts[1]) {
        throw new ApiError(401, "Authorization header must use Bearer token format.");
    }
    return parts[1];
}

async function resolveAuthenticatedUser(token) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not configured.");

    let payload;
    try {
        payload = jwt.verify(token, secret, { algorithms: ["HS256"], issuer: "hasnode-clone-api", audience: "hasnode-clone-client" });
    } catch {
        throw new ApiError(401, "Your session is invalid or has expired. Please log in again.");
    }

    if (!payload?.sub || !/^[a-f0-9]{24}$/i.test(payload.sub)) {
        throw new ApiError(401, "Invalid authentication token.");
    }

    const user = await User.findById(payload.sub).select("name username email bio avatarUrl createdAt updatedAt");
    if (!user) throw new ApiError(401, "The account associated with this session no longer exists.");
    return user;
}

export const authenticate = asyncHandler(async (req, res, next) => {
    const token = getBearerToken(req);
    if (!token) throw new ApiError(401, "Authentication is required.");
    req.user = await resolveAuthenticatedUser(token);
    next();
});

export const optionalAuthenticate = asyncHandler(async (req, res, next) => {
    const token = getBearerToken(req);
    req.user = token ? await resolveAuthenticatedUser(token) : null;
    next();
});
