import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";

export default function validateObjectId(value, fieldName = "id") {
    if (!mongoose.isObjectIdOrHexString(value)) {
        throw new ApiError(400, `Invalid ${fieldName}.`);
    }
    return value;
}
