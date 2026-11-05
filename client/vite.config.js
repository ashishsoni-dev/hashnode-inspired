import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, ".", "VITE_");

    if (mode === "production" && !env.VITE_API_BASE_URL?.trim()) {
        throw new Error(
            "VITE_API_BASE_URL is required for production builds. Set it to the deployed API URL ending in /api."
        );
    }

    return {
        plugins: [react()],
    };
});
