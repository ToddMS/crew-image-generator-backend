import { Router } from "express";
import {
  getUserPresets,
  getPresetById,
  createPreset,
  updatePreset,
  deletePreset,
  setDefaultPreset,
  getDefaultPreset,
  serveLogo,
  upload
} from "../controllers/clubPresets.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = Router();

// Serve logo files (public access for images - no auth required)
router.get("/logos/:filename", serveLogo);

// All other club preset routes require authentication
router.use(authenticateUser);

// Get all user's presets
router.get("/", getUserPresets);

// Get default preset
router.get("/default", getDefaultPreset);

// Get specific preset
router.get("/:id", getPresetById);

// Create new preset (with optional logo upload)
router.post("/", upload.single('logo'), createPreset);

// Update preset (with optional logo upload)
router.put("/:id", upload.single('logo'), updatePreset);

// Delete preset
router.delete("/:id", deletePreset);

// Set preset as default
router.patch("/:id/default", setDefaultPreset);

export default router;