import { Router } from "express";
import { createUploadSignature } from "../controllers/uploadController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/signature", authenticate, createUploadSignature);

export default router;
