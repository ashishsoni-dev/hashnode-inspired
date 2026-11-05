import api, { getData } from "./axios";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function validateImage(file) {
    if (!file) {
        throw new Error("Choose an image file first.");
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        throw new Error("Choose a JPG, PNG, WEBP or GIF image.");
    }

    if (file.size > MAX_IMAGE_SIZE) {
        throw new Error("The image must be 5 MB or smaller.");
    }
}

// Asked backend for a signed upload. The Cloudinary secret stays on the server.
export async function uploadImage(file, purpose) {
    validateImage(file);

    const signatureResponse = await api.post("/uploads/signature", { purpose });
    const signatureData = getData(signatureResponse);
    const uploadUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signatureData.apiKey);
    formData.append("timestamp", String(signatureData.timestamp));
    formData.append("folder", signatureData.folder);
    formData.append("signature", signatureData.signature);

    const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
    });

    const uploadResult = await uploadResponse.json().catch(() => ({}));

    if (!uploadResponse.ok || !uploadResult.secure_url) {
        throw new Error(uploadResult.error?.message || "Image upload failed. Please try again.");
    }

    return uploadResult.secure_url;
}
