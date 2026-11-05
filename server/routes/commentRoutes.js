import { Router } from "express";
import {
    deleteComment,
    likeComment,
    unlikeComment,
    updateComment,
} from "../controllers/commentController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();
router.put("/:id/like", authenticate, likeComment);
router.delete("/:id/like", authenticate, unlikeComment);
router.put("/:id", authenticate, updateComment);
router.delete("/:id", authenticate, deleteComment);

export default router;
