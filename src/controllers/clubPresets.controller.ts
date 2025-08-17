import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import ClubPresetsService from "../services/clubPresets.service.js";

// Configure multer for logo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'src', 'assets', 'club-logos');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: userIdddd_timestamp_originalname
    const userId = (req as any).userId;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `${userId}_${timestamp}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

export const getUserPresets = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const presets = await ClubPresetsService.getUserPresets(userId);
    res.json(presets);
  } catch (error) {
    console.error("Error fetching user presets:", error);
    res.status(500).json({ error: "Failed to fetch presets" });
  }
};

export const getPresetById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const presetId = parseInt(req.params.id);
    
    if (isNaN(presetId)) {
      return res.status(400).json({ error: "Invalid preset ID" });
    }

    const preset = await ClubPresetsService.getPresetById(presetId, userId);
    if (!preset) {
      return res.status(404).json({ error: "Preset not found" });
    }

    res.json(preset);
  } catch (error) {
    console.error("Error fetching preset:", error);
    res.status(500).json({ error: "Failed to fetch preset" });
  }
};

export const createPreset = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { club_name, primary_color, secondary_color, is_default } = req.body;

    if (!club_name || !primary_color || !secondary_color) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Handle logo file if uploaded
    const logo_filename = req.file ? req.file.filename : undefined;

    const presetId = await ClubPresetsService.createPreset(userId, {
      club_name,
      primary_color,
      secondary_color,
      logo_filename,
      is_default: is_default === 'true' || is_default === true
    });

    const newPreset = await ClubPresetsService.getPresetById(presetId, userId);
    res.status(201).json(newPreset);
  } catch (error) {
    console.error("Error creating preset:", error);
    res.status(500).json({ error: "Failed to create preset" });
  }
};

export const updatePreset = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const presetId = parseInt(req.params.id);
    
    if (isNaN(presetId)) {
      return res.status(400).json({ error: "Invalid preset ID" });
    }

    const updateData: any = { ...req.body };
    
    // Handle logo file if uploaded
    if (req.file) {
      // Get old preset to delete old logo file
      const oldPreset = await ClubPresetsService.getPresetById(presetId, userId);
      if (oldPreset?.logo_filename) {
        const oldLogoPath = path.join(process.cwd(), 'src', 'assets', 'club-logos', oldPreset.logo_filename);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }
      updateData.logo_filename = req.file.filename;
    }

    // Convert string boolean to actual boolean
    if (updateData.is_default !== undefined) {
      updateData.is_default = updateData.is_default === 'true' || updateData.is_default === true;
    }

    const updated = await ClubPresetsService.updatePreset(presetId, userId, updateData);
    if (!updated) {
      return res.status(404).json({ error: "Preset not found" });
    }

    const updatedPreset = await ClubPresetsService.getPresetById(presetId, userId);
    res.json(updatedPreset);
  } catch (error) {
    console.error("Error updating preset:", error);
    res.status(500).json({ error: "Failed to update preset" });
  }
};

export const deletePreset = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const presetId = parseInt(req.params.id);
    
    if (isNaN(presetId)) {
      return res.status(400).json({ error: "Invalid preset ID" });
    }

    // Get preset to delete logo file
    const preset = await ClubPresetsService.getPresetById(presetId, userId);
    if (preset?.logo_filename) {
      const logoPath = path.join(process.cwd(), 'src', 'assets', 'club-logos', preset.logo_filename);
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
    }

    const deleted = await ClubPresetsService.deletePreset(presetId, userId);
    if (!deleted) {
      return res.status(404).json({ error: "Preset not found" });
    }

    res.json({ message: "Preset deleted successfully" });
  } catch (error) {
    console.error("Error deleting preset:", error);
    res.status(500).json({ error: "Failed to delete preset" });
  }
};

export const setDefaultPreset = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const presetId = parseInt(req.params.id);
    
    if (isNaN(presetId)) {
      return res.status(400).json({ error: "Invalid preset ID" });
    }

    const updated = await ClubPresetsService.setDefaultPreset(presetId, userId);
    if (!updated) {
      return res.status(404).json({ error: "Preset not found" });
    }

    res.json({ message: "Default preset updated successfully" });
  } catch (error) {
    console.error("Error setting default preset:", error);
    res.status(500).json({ error: "Failed to set default preset" });
  }
};

export const getDefaultPreset = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const preset = await ClubPresetsService.getDefaultPreset(userId);
    
    if (!preset) {
      return res.status(404).json({ error: "No default preset found" });
    }

    res.json(preset);
  } catch (error) {
    console.error("Error fetching default preset:", error);
    res.status(500).json({ error: "Failed to fetch default preset" });
  }
};

// Serve logo files
export const serveLogo = async (req: Request, res: Response) => {
  try {
    const filename = req.params.filename;
    const logoPath = path.join(process.cwd(), 'src', 'assets', 'club-logos', filename);
    
    if (!fs.existsSync(logoPath)) {
      return res.status(404).json({ error: "Logo not found" });
    }

    res.setHeader('Content-Disposition', 'inline');
    res.sendFile(logoPath);
  } catch (error) {
    console.error("Error serving logo:", error);
    res.status(500).json({ error: "Failed to serve logo" });
  }
};