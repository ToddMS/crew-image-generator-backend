import { Request, Response } from "express";
import CrewService from "../services/crew.service.js";
import { fileURLToPath } from "url";
import { generateCrewImage } from "../services/image.service.js";
import fs from "fs";
import path from "path";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);

export const generateCrewImageHandler = async (req: Request, res: Response) => {
    try {
        const { crewId, templateId, imageName, colors, clubIcon, clubIconType } = req.body;
        const clubIconFile = req.file; // For file uploads

        console.log('Backend: Received club icon data:', { clubIcon, clubIconType, hasFile: !!clubIconFile });

        if (!crewId) {
            return res.status(400).json({ error: "Crew ID is required" });
        }

        console.log(`Fetching crew with ID: ${crewId}`);
        const crew = await CrewService.getCrewById(crewId);
        if (!crew) {
            return res.status(404).json({ error: "Crew not found" });
        }

        // Prepare club icon data for template
        let clubIconData = null;
        if (clubIconType === 'upload' && clubIconFile) {
            clubIconData = {
                type: 'upload',
                filePath: clubIconFile.path
            };
        } else if (clubIcon && clubIcon.type === 'preset' && clubIcon.filename) {
            clubIconData = {
                type: 'preset',
                filename: clubIcon.filename
            };
        }

        const { outputPath } = await generateCrewImage(crew, imageName, templateId, colors, clubIconData);
        const buffer = await fs.promises.readFile(outputPath);

        res.setHeader("Content-Type", "image/png");
        res.send(buffer);
    } catch (error) {
        console.error("Error generating crew image:", error);
        res.status(500).json({ error: "Server error" });
    }
};


export const getAllCrews = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId; // Set by auth middleware
        const crews = await CrewService.getCrewsByUserId(userId);
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
        const userId = (req as any).userId; // Set by auth middleware

        if (!name || !crewNames || !boatType || !clubName || !raceName) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

        const crewData = { ...req.body, userId };
        const crewId = await CrewService.addCrew(crewData);
        res.status(201).json({ id: crewId, ...crewData });
    } catch (error) {
        console.error("Server error creating crew:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const updateCrewHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const crewId = req.params.id;
        const userId = (req as any).userId; // Set by auth middleware
        
        if (!crewId) {
            res.status(400).json({ message: "Invalid crew ID" });
            return;
        }

        const updatedCrew = await CrewService.updateCrew(parseInt(crewId), userId, req.body);
        if (!updatedCrew) {
            res.status(404).json({ message: "Crew not found or not authorized" });
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
        const userId = (req as any).userId; // Set by auth middleware

        if (!id) {
            res.status(400).json({ message: "No ID provided" });
            return;
        }

        const crewId = parseInt(id);

        if (isNaN(crewId)) {
            res.status(400).json({ message: "Invalid crew ID" });
            return;
        }

        const deleted = await CrewService.deleteCrew(crewId, userId);
        if (!deleted) {
            res.status(404).json({ message: "Crew not found or not authorized" });
            return;
        }

        res.status(200).json({ message: "Crew deleted successfully" });
    } catch (error) {
        console.error("Error deleting crew:", error);
        res.status(500).json({ error: "Error deleting crew" });
    }
};

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadsDir = path.join(process.cwd(), 'src', 'assets', 'saved-images');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const crewId = req.body.crewId;
        const imageName = req.body.imageName || 'image';
        const sanitizedName = imageName.replace(/[^a-zA-Z0-9_-]/g, '_');
        cb(null, `crew_${crewId}_${sanitizedName}_${timestamp}.png`);
    }
});

export const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
});

// Configure multer for club icon uploads during image generation
const clubIconStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const tempDir = path.join(process.cwd(), 'temp', 'club-icons');
        // Create directory if it doesn't exist
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `club_icon_${timestamp}${ext}`);
    }
});

export const uploadClubIcon = multer({
    storage: clubIconStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for club icons
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
});

export const saveCrewImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { crewId, imageName, templateId, colors } = req.body;
        const userId = (req as any).userId;
        const file = req.file;

        if (!crewId || !imageName || !templateId || !file) {
            res.status(400).json({ error: "Missing required fields or image file" });
            return;
        }

        // Verify crew belongs to user
        const crew = await CrewService.getCrewById(crewId);
        if (!crew || (crew as any).userId !== userId) {
            res.status(404).json({ error: "Crew not found or not authorized" });
            return;
        }

        // Parse colors if provided
        let parsedColors = null;
        if (colors) {
            try {
                parsedColors = typeof colors === 'string' ? JSON.parse(colors) : colors;
            } catch (error) {
                console.error('Error parsing colors:', error);
            }
        }

        // Save image metadata to database
        const imageData = {
            crewId: parseInt(crewId),
            userId,
            imageName,
            templateId,
            primaryColor: parsedColors?.primary || null,
            secondaryColor: parsedColors?.secondary || null,
            imageFilename: file.filename,
            imageUrl: `/api/saved-images/${file.filename}`,
            fileSize: file.size,
            mimeType: file.mimetype
        };

        const savedImageId = await CrewService.saveCrewImage(imageData);
        
        res.status(201).json({
            id: savedImageId,
            ...imageData
        });
    } catch (error) {
        console.error("Error saving crew image:", error);
        res.status(500).json({ error: "Failed to save image" });
    }
};

export const getSavedImages = async (req: Request, res: Response): Promise<void> => {
    try {
        const crewId = req.params.crewId;
        const userId = (req as any).userId;

        if (!crewId) {
            res.status(400).json({ error: "Crew ID is required" });
            return;
        }

        // Verify crew belongs to user
        const crew = await CrewService.getCrewById(parseInt(crewId));
        if (!crew || (crew as any).userId !== userId) {
            res.status(404).json({ error: "Crew not found or not authorized" });
            return;
        }

        const savedImages = await CrewService.getSavedImagesByCrewId(parseInt(crewId));
        res.json(savedImages);
    } catch (error) {
        console.error("Error fetching saved images:", error);
        res.status(500).json({ error: "Failed to fetch saved images" });
    }
};

export const deleteSavedImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const imageId = req.params.imageId;
        const userId = (req as any).userId;

        if (!imageId) {
            res.status(400).json({ error: "Image ID is required" });
            return;
        }

        const deleted = await CrewService.deleteSavedImage(parseInt(imageId), userId);
        if (!deleted) {
            res.status(404).json({ error: "Image not found or not authorized" });
            return;
        }

        res.status(200).json({ message: "Image deleted successfully" });
    } catch (error) {
        console.error("Error deleting saved image:", error);
        res.status(500).json({ error: "Failed to delete image" });
    }
};

