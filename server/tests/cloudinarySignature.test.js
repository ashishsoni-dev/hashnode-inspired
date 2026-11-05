import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createCloudinarySignature } from "../utils/cloudinarySignature.js";

test("Cloudinary signature sorts parameters before hashing", () => {
    const parameters = {
        timestamp: 1700000000,
        folder: "hashnode-clone/covers",
    };
    const secret = "test-secret";
    const expected = createHash("sha1")
        .update("folder=hashnode-clone/covers&timestamp=1700000000test-secret")
        .digest("hex");

    assert.equal(createCloudinarySignature(parameters, secret), expected);
});

test("Cloudinary signature includes allowed upload formats when supplied", () => {
    const parameters = {
        timestamp: 1700000000,
        folder: "hashnode-clone/avatars",
        allowed_formats: "jpg,png,webp,gif",
    };
    const secret = "test-secret";
    const expected = createHash("sha1")
        .update(
            "allowed_formats=jpg,png,webp,gif&folder=hashnode-clone/avatars&timestamp=1700000000test-secret"
        )
        .digest("hex");

    assert.equal(createCloudinarySignature(parameters, secret), expected);
});
