import { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "../models/db.js";
import { User, ClubSettings, CreateUserData, UpdateClubSettingsData } from "../types/user.types.js";

class UserService {
  // User management
  async createUser(userData: CreateUserData): Promise<number> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Insert user
      const [userResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO Users (google_id, email, name, profile_picture, club_name) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          userData.google_id, 
          userData.email, 
          userData.name, 
          userData.profile_picture || null, 
          userData.club_name || null
        ]
      );

      const userId = userResult.insertId;

      // Create default club settings
      await connection.execute(
        `INSERT INTO ClubSettings (user_id, primary_color, secondary_color) 
         VALUES (?, '#5E98C2', '#ffffff')`,
        [userId]
      );

      await connection.commit();
      return userId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM Users WHERE email = ?",
      [email]
    );
    return rows.length > 0 ? (rows[0] as User) : null;
  }

  async getUserByGoogleId(googleId: string): Promise<User | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM Users WHERE google_id = ?",
      [googleId]
    );
    return rows.length > 0 ? (rows[0] as User) : null;
  }

  async getUserById(id: number): Promise<User | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM Users WHERE id = ?",
      [id]
    );
    return rows.length > 0 ? (rows[0] as User) : null;
  }

  async updateUser(id: number, userData: Partial<CreateUserData>): Promise<boolean> {
    const fields = Object.keys(userData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(userData);
    
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE Users SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, id]
    );
    
    return result.affectedRows > 0;
  }

  // Club settings management
  async getClubSettings(userId: number): Promise<ClubSettings | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM ClubSettings WHERE user_id = ?",
      [userId]
    );
    return rows.length > 0 ? (rows[0] as ClubSettings) : null;
  }

  async updateClubSettings(userId: number, settings: UpdateClubSettingsData): Promise<boolean> {
    const fields = Object.keys(settings).map(key => `${key} = ?`).join(', ');
    const values = Object.values(settings);
    
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE ClubSettings SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
      [...values, userId]
    );
    
    return result.affectedRows > 0;
  }

  // Session management
  async createSession(sessionId: string, userId: number, expiresAt: Date): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO Sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
      [sessionId, userId, expiresAt]
    );
    
    return result.affectedRows > 0;
  }

  async getSession(sessionId: string): Promise<{ user_id: number } | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT user_id FROM Sessions WHERE id = ? AND expires_at > NOW()",
      [sessionId]
    );
    return rows.length > 0 ? (rows[0] as { user_id: number }) : null;
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      "DELETE FROM Sessions WHERE id = ?",
      [sessionId]
    );
    
    return result.affectedRows > 0;
  }
}

export default new UserService();