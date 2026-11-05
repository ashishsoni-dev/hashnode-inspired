import { Router } from "express";
import { createTag, listPostsByTag, listTags } from "../controllers/tagController.js";
import { authenticate, optionalAuthenticate } from "../middleware/authMiddleware.js";

const router = Router();
router.get("/", listTags);
router.post("/", authenticate, createTag);
router.get("/:slug/posts", optionalAuthenticate, listPostsByTag);

export default router;
