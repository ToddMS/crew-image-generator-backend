import pool from "../models/db.js";
import { User, ClubSettings, CreateUserData, UpdateClubSettingsData } from "../types/user.types.js";

class UserService {
  // User management
  async createUser(userData: CreateUserData): Promise<number> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert user
      const userResult = await client.query(
        `INSERT INTO Users (google_id, email, name, profile_picture, club_name, password_hash) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [
          userData.google_id || null, 
          userData.email, 
          userData.name, 
          userData.profile_picture || null, 
          userData.club_name || null,
          userData.password_hash || null
        ]
      );

      const userId = userResult.rows[0].id;

      // Create default club settings
      await client.query(
        `INSERT INTO ClubSettings (user_id, primary_color, secondary_color) 
         VALUES ($1, '#5E98C2', '#ffffff')`,
        [userId]
      );

      await client.query('COMMIT');
      return userId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM Users WHERE email = $1",
        [email]
      );
      return result.rows.length > 0 ? (result.rows[0] as User) : null;
    } finally {
      client.release();
    }
  }

  async getUserByGoogleId(googleId: string): Promise<User | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM Users WHERE google_id = $1",
        [googleId]
      );
      return result.rows.length > 0 ? (result.rows[0] as User) : null;
    } finally {
      client.release();
    }
  }

  async getUserById(id: number): Promise<User | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM Users WHERE id = $1",
        [id]
      );
      return result.rows.length > 0 ? (result.rows[0] as User) : null;
    } finally {
      client.release();
    }
  }

  async updateUser(id: number, userData: Partial<CreateUserData>): Promise<boolean> {
    const client = await pool.connect();
    try {
      const fields = Object.keys(userData).map((key, index) => `${key} = $${index + 1}`).join(', ');
      const values = Object.values(userData);
      
      const result = await client.query(
        `UPDATE Users SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length + 1}`,
        [...values, id]
      );
      
      return (result.rowCount ?? 0) > 0;
    } finally {
      client.release();
    }
  }

  // Club settings management
  async getClubSettings(userId: number): Promise<ClubSettings | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM ClubSettings WHERE user_id = $1",
        [userId]
      );
      return result.rows.length > 0 ? (result.rows[0] as ClubSettings) : null;
    } finally {
      client.release();
    }
  }

  async updateClubSettings(userId: number, settings: UpdateClubSettingsData): Promise<boolean> {
    const client = await pool.connect();
    try {
      const fields = Object.keys(settings).map((key, index) => `${key} = $${index + 1}`).join(', ');
      const values = Object.values(settings);
      
      const result = await client.query(
        `UPDATE ClubSettings SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE user_id = $${values.length + 1}`,
        [...values, userId]
      );
      
      return (result.rowCount ?? 0) > 0;
    } finally {
      client.release();
    }
  }

  // Session management
  async createSession(sessionId: string, userId: number, expiresAt: Date): Promise<boolean> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "INSERT INTO Sessions (id, user_id, expires_at) VALUES ($1, $2, $3)",
        [sessionId, userId, expiresAt]
      );
      
      return (result.rowCount ?? 0) > 0;
    } finally {
      client.release();
    }
  }

  async getSession(sessionId: string): Promise<{ user_id: number } | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT user_id FROM Sessions WHERE id = $1 AND expires_at > NOW()",
        [sessionId]
      );
      return result.rows.length > 0 ? (result.rows[0] as { user_id: number }) : null;
    } finally {
      client.release();
    }
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "DELETE FROM Sessions WHERE id = $1",
        [sessionId]
      );
      
      return (result.rowCount ?? 0) > 0;
    } finally {
      client.release();
    }
  }
}

export default new UserService();