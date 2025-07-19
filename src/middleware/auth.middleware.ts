import { Request, Response, NextFunction } from "express";
import UserService from "../services/user.service.js";

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const sessionId = authHeader.replace('Bearer ', '');
    const session = await UserService.getSession(sessionId);

    if (!session) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    // Add userId to request object
    (req as any).userId = session.user_id;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Authentication error" });
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const sessionId = authHeader.replace('Bearer ', '');
      const session = await UserService.getSession(sessionId);
      
      if (session) {
        (req as any).userId = session.user_id;
      }
    }
    
    next();
  } catch (error) {
    console.error("Optional auth middleware error:", error);
    next(); // Continue without authentication
  }
};