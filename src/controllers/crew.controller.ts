import { Request, Response } from "express";
import CrewService from "../services/crew.service.js";
import { fileURLToPath } from "url";
import { generateCrewImage } from "../services/image.service.js";

const __filename = fileURLToPath(import.meta.url);

export const generateCrewImageHandler = async (req: Request, res: Response) => {
    try {

        
        const { crewId } = req.body;
        console.log('crewId: ', crewId);

        if (!crewId) {
            return res.status(400).json({ error: "Crew ID is required" });
        }

        console.log(`Fetching crew with ID: ${crewId}`);
        const crew = await CrewService.getCrewById(crewId);
        if (!crew) {
            return res.status(404).json({ error: "Crew not found" });
        }

        const { buffer } = await generateCrewImage(crew);

        res.setHeader("Content-Type", "image/png");
        res.send(buffer);
    } catch (error) {
        console.error("Error generating crew image:", error);
        res.status(500).json({ error: "Server error" });
    }
};


export const getAllCrews = async (req: Request, res: Response) => {
    try {
        const crews = await CrewService.getCrews();
        res.json(crews);
    } catch (error) {
        console.error("Error fetching crews:", error);
        res.status(500).json({ error: "Failed to fetch crews" });
    }
};

// export const getCrew = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const crewId = parseInt(req.params.id, 10);
//         if (isNaN(crewId)) {
//             res.status(400).json({ message: "Invalid crew ID" });
//             return;
//         }

//         const crew = await getCrewById(crewId);
//         if (!crew) {
//             res.status(404).json({ message: "Crew not found" });
//             return;
//         }

//         res.status(200).json(crew);
//     } catch (error) {
//         res.status(500).json({ error: "Error fetching crew" });
//     }
// };

export const createCrew = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, crewNames, boatType, clubName, raceName } = req.body;

        if (!name || !crewNames || !boatType || !clubName || !raceName) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

        const crewId = await CrewService.addCrew(req.body);
        res.status(201).json({ id: crewId, ...req.body });
    } catch (error) {
        console.error("Server error creating crew:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const updateCrewHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const crewId = parseInt(req.params.id, 10);
        if (isNaN(crewId)) {
            res.status(400).json({ message: "Invalid crew ID" });
            return;
        }

        const updatedCrew = await CrewService.updateCrew(crewId, req.body);
        if (!updatedCrew) {
            res.status(404).json({ message: "Crew not found" });
            return;
        }

        res.status(200).json(updatedCrew);
    } catch (error) {
        res.status(500).json({ error: "Error updating crew" });
    }
};

export const removeCrew = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id;

        if (!id) {
            res.status(400).json({ message: "No ID provided" });
            return;
        }

        const crewId = parseInt(id);

        if (isNaN(crewId)) {
            res.status(400).json({ message: "Invalid crew ID" });
            return;
        }

        await CrewService.deleteCrew(crewId);

        res.status(200).json({ message: "Crew deleted successfully" });
    } catch (error) {
        console.error("Error deleting crew:", error);
        res.status(500).json({ error: "Error deleting crew" });
    }
};

