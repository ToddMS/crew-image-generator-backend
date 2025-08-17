import express from "express";
import { getAllCrews, createCrew, updateCrewHandler, removeCrew, generateCrewImageHandler, generateCustomCrewImageHandler, getTemplateComponents, getSavedTemplates, saveCrewImage, getSavedImages, deleteSavedImage, upload, uploadClubIcon } from "../controllers/crew.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Public routes (no auth required)
router.post("/generate-image", uploadClubIcon.single('clubIconFile'), asyncHandler(generateCrewImageHandler));
router.post("/generate-custom-image", uploadClubIcon.single('clubIconFile'), asyncHandler(generateCustomCrewImageHandler));
router.get("/template-components", asyncHandler(getTemplateComponents));
router.get("/saved-templates", asyncHandler(getSavedTemplates));

// Protected routes (require authentication)
router.get("/", authenticateUser, asyncHandler(getAllCrews));
router.post("/", authenticateUser, asyncHandler(createCrew));
router.put("/:id", authenticateUser, asyncHandler(updateCrewHandler));
router.delete("/:id", authenticateUser, asyncHandler(removeCrew));

// Saved images routes
router.post("/save-image", authenticateUser, upload.single('image'), asyncHandler(saveCrewImage));
router.get("/:crewId/saved-images", authenticateUser, asyncHandler(getSavedImages));
router.delete("/saved-images/:imageId", authenticateUser, asyncHandler(deleteSavedImage));

export default router;
