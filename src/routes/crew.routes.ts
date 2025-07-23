import express from "express";
import { getAllCrews, createCrew, updateCrewHandler, removeCrew, generateCrewImageHandler } from "../controllers/crew.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Public routes (no auth required)
router.post("/generate-image", asyncHandler(generateCrewImageHandler));

// Protected routes (require authentication)
router.get("/", authenticateUser, asyncHandler(getAllCrews));
router.post("/", authenticateUser, asyncHandler(createCrew));
router.put("/:id", authenticateUser, asyncHandler(updateCrewHandler));
router.delete("/:id", authenticateUser, asyncHandler(removeCrew));

export default router;
