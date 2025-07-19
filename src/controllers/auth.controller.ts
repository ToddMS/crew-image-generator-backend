import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { v4 as uuidv4 } from "uuid";
import UserService from "../services/user.service.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: "Google credential is required" });
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ error: "Invalid Google token" });
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email || !name) {
      return res.status(400).json({ error: "Required user information not available" });
    }

    // Check if user already exists
    let user = await UserService.getUserByGoogleId(googleId);
    
    if (!user) {
      // Check if user exists with email (for linking accounts)
      user = await UserService.getUserByEmail(email);
      
      if (user) {
        // Link Google account to existing user
        await UserService.updateUser(user.id, { google_id: googleId });
      } else {
        // Create new user
        const userId = await UserService.createUser({
          google_id: googleId,
          email,
          name,
          profile_picture: picture,
        });
        user = await UserService.getUserById(userId);
      }
    }

    if (!user) {
      return res.status(500).json({ error: "Failed to create or retrieve user" });
    }

    // Create session
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    await UserService.createSession(sessionId, user.id, expiresAt);

    // Get club settings
    const clubSettings = await UserService.getClubSettings(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profile_picture: user.profile_picture,
        club_name: user.club_name,
      },
      clubSettings,
      sessionId,
    });

  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    
    if (sessionId) {
      await UserService.deleteSession(sessionId);
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId; // Set by auth middleware
    
    const user = await UserService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const clubSettings = await UserService.getClubSettings(userId);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profile_picture: user.profile_picture,
        club_name: user.club_name,
      },
      clubSettings,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to get profile" });
  }
};