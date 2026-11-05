import mongoose from "mongoose";
import Tag from "../models/Tag.js";
import ApiError from "./ApiError.js";
import { createSlug, createUniqueTagSlug } from "./createSlug.js";
import { normalizeTagInput, normalizeTagName } from "./content.js";

export async function resolveTags(input) {
    const values = normalizeTagInput(input);
    const resolved = [];

    for (const value of values) {
        if (typeof value === "object" && value !== null && value._id && mongoose.isObjectIdOrHexString(value._id)) {
            const existing = await Tag.findById(value._id);
            if (!existing) throw new ApiError(400, `Unknown tag identifier: ${value._id}`);
            resolved.push(existing._id);
            continue;
        }

        if (typeof value === "string" && mongoose.isObjectIdOrHexString(value)) {
            const byId = await Tag.findById(value);
            if (byId) {
                resolved.push(byId._id);
                continue;
            }
            throw new ApiError(400, `Unknown tag identifier: ${value}`);
        }

        const rawName = typeof value === "string" ? value : value?.name ?? value?.slug;
        const name = String(rawName ?? "").trim().replace(/\s+/g, " ");
        const normalized = normalizeTagName(name);
        if (!normalized) continue;
        if (name.length > 40) throw new ApiError(400, "Tag names must be 40 characters or fewer.");

        let tag = await Tag.findOne({ name: normalized });
        if (!tag) {
            const slugBase = createSlug(normalized);
            if (!slugBase) throw new ApiError(400, `Invalid tag name: ${name}`);
            const slug = await createUniqueTagSlug(Tag, normalized);
            try {
                tag = await Tag.create({ name: normalized, slug });
            } catch (error) {
                if (error.code !== 11000) throw error;
                tag = await Tag.findOne({ name: normalized });
                if (!tag) throw error;
            }
        }

        if (!resolved.some((id) => id.toString() === tag._id.toString())) {
            resolved.push(tag._id);
        }
    }

    return resolved;
}
