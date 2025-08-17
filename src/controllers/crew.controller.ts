import { Request, Response } from "express";
import CrewService from "../services/crew.service.js";
import { fileURLToPath } from "url";
import { generateCrewImage, ClubIconData } from "../services/image.service.js";
// import { TemplateGeneratorService, TemplateConfig } from "../services/template-generator/index.js";
import fs from "fs";
import path from "path";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);

export const generateCrewImageHandler = async (req: Request, res: Response) => {
    try {
        const { crewId, templateId, imageName, colors, clubIcon, clubIconType } = req.body;
        const clubIconFile = req.file;
        if (!crewId) {
            return res.status(400).json({ error: "Crew ID is required" });
        }
        const crew = await CrewService.getCrewById(crewId);
        if (!crew) {
            return res.status(404).json({ error: "Crew not found" });
        }

        let clubIconData: ClubIconData | undefined = undefined;
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
        res.setHeader("Content-Disposition", "inline");
        res.send(buffer);
    } catch (error) {
        console.error("Error generating crew image:", error);
        res.status(500).json({ error: "Server error" });
    }
};

export const generateCustomCrewImageHandler = async (req: Request, res: Response) => {
    try {
        const { crewId, crew: crewData, templateConfig, imageName, clubIcon, clubIconType } = req.body;
        const clubIconFile = req.file;

        if (!templateConfig) {
            return res.status(400).json({ error: "Template configuration is required" });
        }

        let crew;
        if (crewId) {
            crew = await CrewService.getCrewById(crewId);
            if (!crew) {
                return res.status(404).json({ error: "Crew not found" });
            }
        } else if (crewData) {
            crew = crewData;
        } else {
            return res.status(400).json({ error: "Either crew ID or crew data is required" });
        }

        let clubIconData: ClubIconData | undefined = undefined;
        
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
        } else if (clubIcon && clubIcon.type === 'upload' && clubIcon.base64) {

            clubIconData = {
                type: 'upload',
                // @ts-expect-error: base64 is used for preview uploads, not persisted
                base64: clubIcon.base64 // todo this needs fixing
            };
        }

        // const templateGenerator = new TemplateGeneratorService();
        // const imageBuffer = await templateGenerator.generateTemplate(crew, templateConfig as TemplateConfig, clubIconData);
        
        // Temporary: Return a placeholder response while template generator is being fixed
        return res.status(501).json({ error: "Template generator temporarily disabled during deployment" });
    } catch (error) {
        console.error("Error generating custom crew image:", error);
        res.status(500).json({ error: "Server error" });
        return;
    }
};

export const getTemplateComponents = async (req: Request, res: Response) => {
    try {
        const components = {
            backgrounds: [
                { id: 'geometric', name: 'Geometric Pattern', description: 'Hexagonal pattern with gradient overlay' },
                { id: 'diagonal', name: 'Diagonal Sections', description: 'Bold diagonal cuts with thick white lines' },
                { id: 'radial-burst', name: 'Radial Burst', description: 'Sunburst pattern with radial gradient' }
            ],
            nameDisplays: [
                { id: 'basic', name: 'Basic Names', description: 'Simple white text with dark background' },
                { id: 'labeled', name: 'Labeled Names', description: 'Names with seat labels (B, S, 2, 3, etc.)' }
            ],
            boatStyles: [
                { id: 'centered', name: 'Centered', description: 'Boat centered in the middle' },
                { id: 'offset', name: 'Offset', description: 'Boat positioned for diagonal backgrounds' },
                { id: 'showcase', name: 'Showcase', description: 'Smaller boat for showcasing components' }
            ],
            textLayouts: [
                { id: 'header-left', name: 'Header Left', description: 'Race name and boat name on the left' },
                { id: 'header-center', name: 'Header Center', description: 'Centered text layout' },
                { id: 'minimal', name: 'Minimal', description: 'Minimal text styling' }
            ],
            logoPositions: [
                { id: 'bottom-right', name: 'Bottom Right', description: 'Logo in bottom right corner' },
                { id: 'top-right', name: 'Top Right', description: 'Logo in top right corner' },
                { id: 'bottom-left', name: 'Bottom Left', description: 'Logo in bottom left corner' },
                { id: 'none', name: 'No Logo', description: 'No logo displayed' }
            ]
        };

        res.json(components);
    } catch (error) {
        console.error("Error fetching template components:", error);
        res.status(500).json({ error: "Server error" });
    }
};

export const getSavedTemplates = async (req: Request, res: Response) => {
    try {       
        const defaultTemplates = [
            {
                id: 'template1',
                name: 'Classic Layout',
                description: 'Geometric pattern with centered boat',
                config: {
                    background: 'geometric',
                    nameDisplay: 'basic',
                    boatStyle: 'centered',
                    textLayout: 'header-left',
                    logo: 'bottom-right',
                    dimensions: { width: 1080, height: 1350 },
                    colors: { primary: '#DAA520', secondary: '#2C3E50' }
                },
                isDefault: true
            },
            {
                id: 'template2',
                name: 'Modern Style',
                description: 'Diagonal sections with offset boat',
                config: {
                    background: 'diagonal',
                    nameDisplay: 'labeled',
                    boatStyle: 'offset',
                    textLayout: 'header-left',
                    logo: 'bottom-right',
                    dimensions: { width: 1080, height: 1350 },
                    colors: { primary: '#DAA520', secondary: '#2C3E50' }
                },
                isDefault: true
            },
            {
                id: 'template3',
                name: 'Minimal Design',
                description: 'Radial burst with showcase boat',
                config: {
                    background: 'radial-burst',
                    nameDisplay: 'basic',
                    boatStyle: 'showcase',
                    textLayout: 'header-center',
                    logo: 'bottom-right',
                    dimensions: { width: 1080, height: 1350 },
                    colors: { primary: '#DAA520', secondary: '#2C3E50' }
                },
                isDefault: true
            }
        ];

        res.json({ templates: defaultTemplates });
    } catch (error) {
        console.error("Error fetching saved templates:", error);
        res.status(500).json({ error: "Server error" });
    }
};

export const getAllCrews = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const crews = await CrewService.getCrewsByUserId(userId);
        res.json(crews);
    } catch (error) {
        console.error("Error fetching crews:", error);
        res.status(500).json({ error: "Failed to fetch crews" });
    }
};

export const createCrew = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, crewNames, boatType, clubName, raceName } = req.body;
        const userId = (req as any).userId;

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
        const userId = (req as any).userId;
        
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
        const userId = (req as any).userId;

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

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadsDir = path.join(process.cwd(), 'src', 'assets', 'saved-images');
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
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
});

const clubIconStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const tempDir = path.join(process.cwd(), 'temp', 'club-icons');
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
    limits: { fileSize: 5 * 1024 * 1024 },
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

        const crew = await CrewService.getCrewById(crewId);
        if (!crew || (crew as any).userId !== userId) {
            res.status(404).json({ error: "Crew not found or not authorized" });
            return;
        }

        let parsedColors = null;
        if (colors) {
            try {
                parsedColors = typeof colors === 'string' ? JSON.parse(colors) : colors;
            } catch (error) {
                console.error('Error parsing colors:', error);
            }
        }

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
