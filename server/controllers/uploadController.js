import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { createCloudinarySignature } from "../utils/cloudinarySignature.js";

export const createUploadSignature = asyncHandler(async (req, res) => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        throw new ApiError(
            503,
            "Image uploads are not configured. Add your Cloudinary settings to server/.env."
        );
    }

    const purpose = req.body?.purpose;
    const allowedFolders = {
        avatar: "hashnode-clone/avatars",
        cover: "hashnode-clone/covers",
    };

    if (!allowedFolders[purpose]) {
        throw new ApiError(400, "Choose either an avatar or cover image upload.");
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = allowedFolders[purpose];
    const allowedFormats = "jpg,png,webp,gif";
    const parameters = {
        allowed_formats: allowedFormats,
        folder,
        timestamp,
    };
    const signature = createCloudinarySignature(parameters, apiSecret);

    return sendSuccess(res, {
        cloudName,
        apiKey,
        timestamp,
        folder,
        allowedFormats,
        signature,
    });
});
