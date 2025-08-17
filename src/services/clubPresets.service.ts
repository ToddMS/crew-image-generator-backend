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
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM ClubPresets WHERE user_id = $1 ORDER BY is_default DESC, club_name ASC",
        [userId]
      );
      return result.rows.map(row => ({
        ...row,
        is_default: Boolean(row.is_default)
      })) as ClubPreset[];
    } finally {
      client.release();
    }
  }

  async getPresetById(id: number, userId: number): Promise<ClubPreset | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM ClubPresets WHERE id = $1 AND user_id = $2",
        [id, userId]
      );
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          ...row,
          is_default: Boolean(row.is_default)
        } as ClubPreset;
      }
      return null;
    } finally {
      client.release();
    }
  }

  async createPreset(userId: number, presetData: CreateClubPresetData): Promise<number> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // If this preset is being set as default, remove default from others
      if (presetData.is_default) {
        await client.query(
          "UPDATE ClubPresets SET is_default = FALSE WHERE user_id = $1",
          [userId]
        );
      }

      const result = await client.query(
        `INSERT INTO ClubPresets (user_id, club_name, primary_color, secondary_color, logo_filename, is_default) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [
          userId,
          presetData.club_name,
          presetData.primary_color,
          presetData.secondary_color,
          presetData.logo_filename || null,
          presetData.is_default || false
        ]
      );

      await client.query('COMMIT');
      return result.rows[0].id;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updatePreset(id: number, userId: number, presetData: Partial<CreateClubPresetData>): Promise<boolean> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // If this preset is being set as default, remove default from others
      if (presetData.is_default) {
        await client.query(
          "UPDATE ClubPresets SET is_default = FALSE WHERE user_id = $1 AND id != $2",
          [userId, id]
        );
      }

      const fields = Object.keys(presetData).map((key, index) => `${key} = $${index + 1}`).join(', ');
      const values = Object.values(presetData);

      const result = await client.query(
        `UPDATE ClubPresets SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length + 1} AND user_id = $${values.length + 2}`,
        [...values, id, userId]
      );

      await client.query('COMMIT');
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deletePreset(id: number, userId: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "DELETE FROM ClubPresets WHERE id = $1 AND user_id = $2",
        [id, userId]
      );
      return (result.rowCount ?? 0) > 0;
    } finally {
      client.release();
    }
  }

  async setDefaultPreset(id: number, userId: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Remove default from all user's presets
      await client.query(
        "UPDATE ClubPresets SET is_default = FALSE WHERE user_id = $1",
        [userId]
      );

      // Set the specified preset as default
      const result = await client.query(
        "UPDATE ClubPresets SET is_default = TRUE WHERE id = $1 AND user_id = $2",
        [id, userId]
      );

      await client.query('COMMIT');
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getDefaultPreset(userId: number): Promise<ClubPreset | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM ClubPresets WHERE user_id = $1 AND is_default = TRUE",
        [userId]
      );
      return result.rows.length > 0 ? (result.rows[0] as ClubPreset) : null;
    } finally {
      client.release();
    }
  }
}

export default new ClubPresetsService();