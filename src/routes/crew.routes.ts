import express from "express";
import { getAllCrews, createCrew, updateCrewHandler, removeCrew, generateCrewImageHandler } from "../controllers/crew.controller.js";

const router = express.Router();

const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

router.get("/", asyncHandler(getAllCrews));
router.post("/", asyncHandler(createCrew));
router.put("/:id", asyncHandler(updateCrewHandler));
router.delete("/:id", asyncHandler(removeCrew));
router.post("/generate-image", asyncHandler(generateCrewImageHandler));

export default router;
