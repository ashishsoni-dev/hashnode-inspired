import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import ApiError from "./utils/ApiError.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import tagRoutes from "./routes/tagRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { errorMiddleware, notFoundMiddleware } from "./middleware/errorMiddleware.js";

const app = express();
app.disable("x-powered-by");

const configuredOrigins = String(process.env.CLIENT_URL ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        // Requests from tools such as Postman do not include an Origin header.
        if (!origin || configuredOrigins.includes(origin)) return callback(null, true);
        return callback(new ApiError(403, "This origin is not allowed by the server CORS policy."));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || "2mb" }));
app.use(express.urlencoded({ extended: false, limit: process.env.JSON_BODY_LIMIT || "2mb" }));

app.get("/api/health", (req, res) => {
    const databaseConnected = mongoose.connection.readyState === 1;
    return res.status(databaseConnected ? 200 : 503).json({
        success: databaseConnected,
        data: {
            service: "hasnode-clone-api",
            status: databaseConnected ? "healthy" : "database_unavailable",
            database: databaseConnected ? "connected" : "disconnected",
            timestamp: new Date().toISOString(),
        },
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/uploads", uploadRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
