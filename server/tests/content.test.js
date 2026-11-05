import test from "node:test";
import assert from "node:assert/strict";
import {
    calculateReadingTime,
    escapeRegex,
    generateExcerpt,
    isHttpUrl,
    normalizeTagInput,
    paginationMetadata,
    parsePagination,
    stripMarkdown,
} from "../utils/content.js";
import { createSlug, createUniquePostSlug, createUniqueTagSlug, createUniqueUsername } from "../utils/createSlug.js";

test("createSlug makes readable URL-safe slugs", () => {
    assert.equal(createSlug("  Async & Await: A Beginner's Guide!  "), "async-await-a-beginner-s-guide");
    assert.equal(createSlug("Crème brûlée"), "creme-brulee");
    assert.equal(createSlug("***"), "");
});

test("stripMarkdown removes common markdown syntax without losing readable text", () => {
    const content = "# Hello **world**\n\nRead [this article](https://example.com).\n\n```js\nconst a = 1;\n```";
    assert.equal(stripMarkdown(content), "Hello world Read this article.");
});

test("generateExcerpt respects the configured maximum length", () => {
    const excerpt = generateExcerpt("A ".repeat(200), 30);
    assert.ok(excerpt.length <= 30);
    assert.ok(excerpt.endsWith("…"));
});

test("reading time is at least one minute and scales by 200 words", () => {
    assert.equal(calculateReadingTime("short article"), 1);
    assert.equal(calculateReadingTime(Array(401).fill("word").join(" ")), 3);
});

test("image URL validation accepts only HTTP and HTTPS", () => {
    assert.equal(isHttpUrl("https://images.example.com/cover.png"), true);
    assert.equal(isHttpUrl("http://localhost/image.png"), true);
    assert.equal(isHttpUrl("javascript:alert(1)"), false);
    assert.equal(isHttpUrl("file:///tmp/image.png"), false);
    assert.equal(isHttpUrl("", { allowEmpty: true }), true);
    assert.equal(isHttpUrl(""), false);
});

test("tag inputs are normalized and deduplicated case-insensitively", () => {
    const tags = normalizeTagInput([" JavaScript ", "javascript", "MongoDB", " MongoDB "]);
    assert.deepEqual(tags, [" JavaScript ", "MongoDB"]);
});

test("search terms are escaped before becoming regular expressions", () => {
    const expression = new RegExp(escapeRegex("C++ (advanced)"), "i");
    assert.equal(expression.test("Learn C++ (advanced)"), true);
    assert.equal(expression.test("Learn C advanced"), false);
});

test("pagination applies defaults and maximum page size", () => {
    assert.deepEqual(parsePagination({}), { page: 1, limit: 9, skip: 0 });
    assert.deepEqual(parsePagination({ page: "3", limit: "100" }), { page: 3, limit: 50, skip: 100 });
    assert.deepEqual(parsePagination({ page: "-2", limit: "0" }), { page: 1, limit: 9, skip: 0 });
});

test("pagination metadata reports next and previous pages", () => {
    assert.deepEqual(paginationMetadata(2, 9, 25), {
        page: 2,
        limit: 9,
        total: 25,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
    });
});


test("unique post slugs add a suffix when a title is already used", async () => {
    const existingSlugs = new Set(["same-title", "same-title-2"]);
    const FakePost = { exists: async ({ slug }) => existingSlugs.has(slug) };

    assert.equal(await createUniquePostSlug(FakePost, "Same Title"), "same-title-3");
    assert.equal(await createUniquePostSlug(FakePost, "!!!"), null);
});

test("generated usernames remain unique and within the schema length", async () => {
    const existingUsernames = new Set(["alex-morgan", "alex-morgan2"]);
    const FakeUser = { exists: async ({ username }) => existingUsernames.has(username) };

    assert.equal(await createUniqueUsername(FakeUser, "Alex Morgan"), "alex-morgan3");
});

test("tag slugs are made unique when normalized names collide", async () => {
    const existingSlugs = new Set(["node-js", "node-js-2"]);
    const FakeTag = { exists: async ({ slug }) => existingSlugs.has(slug) };

    assert.equal(await createUniqueTagSlug(FakeTag, "Node.js"), "node-js-3");
});
