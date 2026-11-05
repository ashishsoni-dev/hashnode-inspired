import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";

export function notFoundMiddleware(req, res, next) {
    next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorMiddleware(error, req, res, next) {
    let statusCode = error.statusCode || 500;
    let message = error.message || "An unexpected server error occurred.";
    let details = error.details;

    if (error?.type === "entity.parse.failed" || error instanceof SyntaxError && "body" in error) {
        statusCode = 400;
        message = "Request body contains invalid JSON.";
    } else if (error instanceof mongoose.Error.ValidationError) {
        statusCode = 400;
        message = "Request data failed validation.";
        details = Object.values(error.errors).map((item) => ({ field: item.path, message: item.message }));
    } else if (error instanceof mongoose.Error.CastError) {
        statusCode = 400;
        message = `Invalid value for ${error.path}.`;
    } else if (error?.code === 11000) {
        statusCode = 409;
        const field = Object.keys(error.keyPattern ?? {})[0] ?? "value";
        message = `A record with this ${field} already exists.`;
    } else if (error?.type === "entity.too.large") {
        statusCode = 413;
        message = "Request body is too large.";
    }

    if (statusCode >= 500) {
        console.error(error);
        if (process.env.NODE_ENV === "production") {
            message = "An unexpected server error occurred.";
            details = undefined;
        }
    }

    res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(details ? { details } : {}),
            ...(process.env.NODE_ENV !== "production" && statusCode >= 500 ? { requestId: req.headers["x-request-id"] } : {}),
        },
    });
}
