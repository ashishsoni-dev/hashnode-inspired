import { Router } from "express";
import {
    followUser,
    getPublicProfile,
    listMyFollowers,
    listMyFollowing,
    unfollowUser,
    updateMyProfile,
} from "../controllers/userController.js";
import { listMyBookmarks } from "../controllers/bookmarkController.js";
import { authenticate, optionalAuthenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/me/following", authenticate, listMyFollowing);
router.get("/me/followers", authenticate, listMyFollowers);
router.get("/me/bookmarks", authenticate, listMyBookmarks);
router.put("/me", authenticate, updateMyProfile);
router.put("/:id/follow", authenticate, followUser);
router.delete("/:id/follow", authenticate, unfollowUser);
router.get("/:id", optionalAuthenticate, getPublicProfile);

export default router;
