import { Router } from "express";
import {
    createPost,
    deletePost,
    getFeaturedPosts,
    getMyPostById,
    getPublishedPostBySlug,
    listMyPosts,
    listPublishedPosts,
    updatePost,
} from "../controllers/postController.js";
import { bookmarkPost, likePost, unbookmarkPost, unlikePost } from "../controllers/interactionController.js";
import { createPostComment, listPostComments } from "../controllers/commentController.js";
import { authenticate, optionalAuthenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/mine", authenticate, listMyPosts);
router.get("/mine/:id", authenticate, getMyPostById);
router.get("/featured", optionalAuthenticate, getFeaturedPosts);
router.get("/", optionalAuthenticate, listPublishedPosts);
router.post("/", authenticate, createPost);
router.get("/:id/comments", optionalAuthenticate, listPostComments);
router.post("/:id/comments", authenticate, createPostComment);
router.put("/:id/like", authenticate, likePost);
router.delete("/:id/like", authenticate, unlikePost);
router.put("/:id/bookmark", authenticate, bookmarkPost);
router.delete("/:id/bookmark", authenticate, unbookmarkPost);
router.put("/:id", authenticate, updatePost);
router.delete("/:id", authenticate, deletePost);
router.get("/:slug", optionalAuthenticate, getPublishedPostBySlug);

export default router;
