import express, { Request, Response } from "express";
import { getAllCrews, createCrew, updateCrewHandler, removeCrew } from "../controllers/crew.controller.js";
const router = express.Router();

router.get("/", getAllCrews);
// router.get("/:id", (req: Request, res: Response) => getCrew(req, res)); 
router.post("/", (req: Request, res: Response) => createCrew(req, res)); 
router.put("/:id", (req: Request, res: Response) => updateCrewHandler(req, res)); 
router.delete("/:id", removeCrew); 

export default router;