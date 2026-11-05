import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateToken from "../utils/generateToken.js";
import { createUniqueUsername } from "../utils/createSlug.js";
import { sendSuccess } from "../utils/response.js";

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body ?? {};

    if (typeof name !== "string" || !name.trim()) throw new ApiError(400, "Name is required.");
    if (name.trim().length > 80) throw new ApiError(400, "Name must be 80 characters or fewer.");
    if (typeof email !== "string" || email.trim().length > 254 || !validateEmail(email.trim())) {
        throw new ApiError(400, "Enter a valid email address.");
    }
    if (typeof password !== "string" || password.length < 8 || password.length > 128) {
        throw new ApiError(400, "Password must contain between 8 and 128 characters.");
    }
    if (Buffer.byteLength(password, "utf8") > 72) {
        throw new ApiError(400, "Password must not exceed 72 UTF-8 bytes (bcrypt limit).");
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
        throw new ApiError(409, "An account with this email address already exists.");
    }

    const username = await createUniqueUsername(User, name.trim());
    const user = await User.create({ name: name.trim(), username, email: normalizedEmail, password });
    const token = generateToken(user._id);

    return sendSuccess(res, { token, user: user.toPublicJSON() }, 201);
});

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body ?? {};
    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
        throw new ApiError(400, "Email and password are required.");
    }
    if (email.trim().length > 254) throw new ApiError(400, "Enter a valid email address.");
    if (password.length > 128 || Buffer.byteLength(password, "utf8") > 72) {
        throw new ApiError(400, "Password is too long.");
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    const passwordMatches = user ? await user.comparePassword(password) : false;
    if (!user || !passwordMatches) {
        throw new ApiError(401, "Invalid email or password.");
    }

    return sendSuccess(res, {
        token: generateToken(user._id),
        user: user.toPublicJSON(),
    });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    return sendSuccess(res, { user: req.user.toPublicJSON() });
});
