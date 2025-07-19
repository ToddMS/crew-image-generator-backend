import { Router } from "express";
import { googleAuth, logout, getProfile } from "../controllers/auth.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = Router();

// Authentication routes
router.post("/google", googleAuth);
router.post("/logout", logout);

// Protected routes
router.get("/profile", authenticateUser, getProfile);

export default router;