import { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "../models/db.js";

export interface ClubPreset {
  id: number;
  user_id: number;
  club_name: string;
  primary_color: string;
  secondary_color: string;
  logo_filename?: string;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateClubPresetData {
  club_name: string;
  primary_color: string;
  secondary_color: string;
  logo_filename?: string;
  is_default?: boolean;
}

class ClubPresetsService {
  async getUserPresets(userId: number): Promise<ClubPreset[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM ClubPresets WHERE user_id = ? ORDER BY is_default DESC, club_name ASC",
      [userId]
    );
    // Convert MySQL 0/1 to proper JavaScript booleans
    return rows.map(row => ({
      ...row,
      is_default: Boolean(row.is_default)
    })) as ClubPreset[];
  }

  async getPresetById(id: number, userId: number): Promise<ClubPreset | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM ClubPresets WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    if (rows.length > 0) {
      const row = rows[0];
      return {
        ...row,
        is_default: Boolean(row.is_default)
      } as ClubPreset;
    }
    return null;
  }

  async createPreset(userId: number, presetData: CreateClubPresetData): Promise<number> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // If this preset is being set as default, remove default from others
      if (presetData.is_default) {
        await connection.execute(
          "UPDATE ClubPresets SET is_default = FALSE WHERE user_id = ?",
          [userId]
        );
      }

      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO ClubPresets (user_id, club_name, primary_color, secondary_color, logo_filename, is_default) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId,
          presetData.club_name,
          presetData.primary_color,
          presetData.secondary_color,
          presetData.logo_filename || null,
          presetData.is_default || false
        ]
      );

      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async updatePreset(id: number, userId: number, presetData: Partial<CreateClubPresetData>): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // If this preset is being set as default, remove default from others
      if (presetData.is_default) {
        await connection.execute(
          "UPDATE ClubPresets SET is_default = FALSE WHERE user_id = ? AND id != ?",
          [userId, id]
        );
      }

      const fields = Object.keys(presetData).map(key => `${key} = ?`).join(', ');
      const values = Object.values(presetData);

      const [result] = await connection.execute<ResultSetHeader>(
        `UPDATE ClubPresets SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`,
        [...values, id, userId]
      );

      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async deletePreset(id: number, userId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      "DELETE FROM ClubPresets WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    return result.affectedRows > 0;
  }

  async setDefaultPreset(id: number, userId: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Remove default from all user's presets
      await connection.execute(
        "UPDATE ClubPresets SET is_default = FALSE WHERE user_id = ?",
        [userId]
      );

      // Set the specified preset as default
      const [result] = await connection.execute<ResultSetHeader>(
        "UPDATE ClubPresets SET is_default = TRUE WHERE id = ? AND user_id = ?",
        [id, userId]
      );

      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getDefaultPreset(userId: number): Promise<ClubPreset | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM ClubPresets WHERE user_id = ? AND is_default = TRUE",
      [userId]
    );
    return rows.length > 0 ? (rows[0] as ClubPreset) : null;
  }
}

export default new ClubPresetsService();