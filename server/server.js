import "dotenv/config";
import app from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/db.js";

const port = Number.parseInt(process.env.PORT, 10) || 5000;

async function startServer() {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
        throw new Error("JWT_SECRET must be configured with at least 32 characters.");
    }

    await connectDatabase();

    const server = app.listen(port, () => {
        console.log(`Hasnode Clone API listening at http://localhost:${port}`);
        console.log(`Health check: http://localhost:${port}/api/health`);
    });

    const shutdown = async (signal) => {
        console.log(`${signal} received. Closing server...`);
        server.close(async () => {
            await disconnectDatabase();
            process.exit(0);
        });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
}

startServer().catch((error) => {
    console.error("Could not start the API server:", error.message);
    process.exit(1);
});
