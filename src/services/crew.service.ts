import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { Crew, BoatType, CrewDB } from '../types/crew.types.js';
import pool from '../models/db.js';

interface CrewQueryResult extends RowDataPacket {
    id: number;
    name: string;
    club_name: string;
    race_name: string;
    user_id: number;
    boatTypeId: number;
    boatTypeValue: string;
    boatTypeSeats: number;
    boatTypeName: string;
    crewNames: string | null;
}

export class CrewService {
    private static instance: CrewService;

    private constructor() {}

    static getInstance(): CrewService {
        if (!CrewService.instance) {
            CrewService.instance = new CrewService();
        }
        return CrewService.instance;
    }

    private mapToCrewResponse(row: CrewQueryResult): Crew & { userId?: number } {
        return {
            id: row.id.toString(),
            name: row.name,
            clubName: row.club_name,
            raceName: row.race_name,
            userId: row.user_id,
            boatType: {
                id: row.boatTypeId,
                value: row.boatTypeValue,
                seats: row.boatTypeSeats,
                name: row.boatTypeName
            },
            crewNames: row.crewNames ? row.crewNames.split(',') : []
        };
    }

    async getCrews(): Promise<Crew[]> {
        console.log("Getting all Crews (deprecated - use getCrewsByUserId)");
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query<CrewQueryResult[]>(`
                SELECT 
                    c.id, 
                    c.name, 
                    c.club_name, 
                    c.race_name,
                    c.user_id,
                    b.id as boatTypeId, 
                    b.value as boatTypeValue, 
                    b.seats as boatTypeSeats, 
                    b.name as boatTypeName,
                    GROUP_CONCAT(cm.name ORDER BY cm.seat_number) as crewNames
                FROM Crews c
                JOIN BoatTypes b ON c.boat_type_id = b.id
                LEFT JOIN CrewMembers cm ON c.id = cm.crew_id
                GROUP BY c.id
            `);

            return rows.map(row => this.mapToCrewResponse(row));
        } catch (error) {
            console.error('Database error:', error);
            throw new Error('Failed to fetch crews');
        } finally {
            connection.release();
        }
    }

    async getCrewsByUserId(userId: number): Promise<Crew[]> {
        console.log(`Getting crews for user: ${userId}`);
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query<CrewQueryResult[]>(`
                SELECT 
                    c.id, 
                    c.name, 
                    c.club_name, 
                    c.race_name,
                    c.user_id,
                    b.id as boatTypeId, 
                    b.value as boatTypeValue, 
                    b.seats as boatTypeSeats, 
                    b.name as boatTypeName,
                    GROUP_CONCAT(cm.name ORDER BY cm.seat_number) as crewNames
                FROM Crews c
                JOIN BoatTypes b ON c.boat_type_id = b.id
                LEFT JOIN CrewMembers cm ON c.id = cm.crew_id
                WHERE c.user_id = ?
                GROUP BY c.id
                ORDER BY c.created_at DESC
            `, [userId]);

            return rows.map(row => this.mapToCrewResponse(row));
        } catch (error) {
            console.error('Database error:', error);
            throw new Error('Failed to fetch user crews');
        } finally {
            connection.release();
        }
    }

    async getCrewById(crewId: number): Promise<Crew | null> {
        console.log(`Fetching crew with ID: ${crewId}`);
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query<CrewQueryResult[]>(`
                SELECT 
                    c.id, 
                    c.name, 
                    c.club_name, 
                    c.race_name,
                    c.user_id,
                    b.id as boatTypeId, 
                    b.value as boatTypeValue, 
                    b.seats as boatTypeSeats, 
                    b.name as boatTypeName,
                    GROUP_CONCAT(cm.name ORDER BY cm.seat_number) as crewNames
                FROM Crews c
                JOIN BoatTypes b ON c.boat_type_id = b.id
                LEFT JOIN CrewMembers cm ON c.id = cm.crew_id
                WHERE c.id = ?
                GROUP BY c.id
            `, [crewId]);
    
            if (rows.length === 0) return null;
            return this.mapToCrewResponse(rows[0]);
        } catch (error) {
            console.error('Database error:', error);
            throw new Error('Failed to fetch crew');
        } finally {
            connection.release();
        }
    }    

    async addCrew(crew: any): Promise<number> {
        console.log("Adding crew: ", crew);
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [crewResult] = await connection.query<ResultSetHeader>(
                "INSERT INTO Crews (name, club_name, race_name, boat_type_id, user_id) VALUES (?, ?, ?, ?, ?)",
                [crew.name, crew.clubName, crew.raceName, crew.boatType.id, crew.userId]
            );

            const crewId = crewResult.insertId;

            if (crew.crewNames && crew.crewNames.length > 0) {
                const crewMemberValues = crew.crewNames.map((name: string, index: number) => [crewId, name, index]);
                await connection.query(
                    "INSERT INTO CrewMembers (crew_id, name, seat_number) VALUES ?",
                    [crewMemberValues]
                );
            }

            await connection.commit();
            return crewId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async updateCrew(id: number, userId: number, crew: Crew): Promise<boolean> {
        console.log("Updating crew: ", id, crew);
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Only update crews owned by the user
            const [result] = await connection.query<ResultSetHeader>(
                "UPDATE Crews SET name = ?, club_name = ?, race_name = ?, boat_type_id = ? WHERE id = ? AND user_id = ?",
                [crew.name, crew.clubName, crew.raceName, crew.boatType.id, id, userId]
            );

            if (result.affectedRows === 0) {
                await connection.rollback();
                return false;
            }

            await connection.query("DELETE FROM CrewMembers WHERE crew_id = ?", [id]);

            if (crew.crewNames.length > 0) {
                const crewMemberValues = crew.crewNames.map((name, index) => [id, name, index]);
                await connection.query(
                    "INSERT INTO CrewMembers (crew_id, name, seat_number) VALUES ?",
                    [crewMemberValues]
                );
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async deleteCrew(id: number, userId: number): Promise<boolean> {
        console.log("Deleting crew: ", id);
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            // Only delete crews owned by the user
            const [result] = await connection.query<ResultSetHeader>(
                "DELETE FROM Crews WHERE id = ? AND user_id = ?", 
                [id, userId]
            );
            
            if (result.affectedRows === 0) {
                await connection.rollback();
                return false;
            }
            
            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async saveCrewImage(imageData: any): Promise<number> {
        console.log("Saving crew image:", imageData);
        const connection = await pool.getConnection();
        try {
            const [result] = await connection.query<ResultSetHeader>(
                `INSERT INTO SavedImages 
                (crew_id, user_id, image_name, template_id, primary_color, secondary_color, 
                 image_filename, image_url, file_size, mime_type) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    imageData.crewId,
                    imageData.userId,
                    imageData.imageName,
                    imageData.templateId,
                    imageData.primaryColor,
                    imageData.secondaryColor,
                    imageData.imageFilename,
                    imageData.imageUrl,
                    imageData.fileSize,
                    imageData.mimeType
                ]
            );
            return result.insertId;
        } catch (error) {
            console.error('Database error saving image:', error);
            throw new Error('Failed to save image');
        } finally {
            connection.release();
        }
    }

    async getSavedImagesByCrewId(crewId: number): Promise<any[]> {
        console.log(`Getting saved images for crew: ${crewId}`);
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query<RowDataPacket[]>(
                `SELECT 
                    id, crew_id, user_id, image_name, template_id, 
                    primary_color, secondary_color, image_filename, 
                    image_url, file_size, mime_type, created_at
                FROM SavedImages 
                WHERE crew_id = ? 
                ORDER BY created_at DESC`,
                [crewId]
            );
            return rows;
        } catch (error) {
            console.error('Database error fetching saved images:', error);
            throw new Error('Failed to fetch saved images');
        } finally {
            connection.release();
        }
    }

    async deleteSavedImage(imageId: number, userId: number): Promise<boolean> {
        console.log(`Deleting saved image: ${imageId} for user: ${userId}`);
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Get image info to delete file
            const [imageRows] = await connection.query<RowDataPacket[]>(
                'SELECT image_filename FROM SavedImages WHERE id = ? AND user_id = ?',
                [imageId, userId]
            );

            if (imageRows.length === 0) {
                await connection.rollback();
                return false;
            }

            // Delete from database
            const [result] = await connection.query<ResultSetHeader>(
                'DELETE FROM SavedImages WHERE id = ? AND user_id = ?',
                [imageId, userId]
            );

            if (result.affectedRows === 0) {
                await connection.rollback();
                return false;
            }

            // Delete physical file
            try {
                const fs = await import('fs');
                const path = await import('path');
                const filename = imageRows[0].image_filename;
                const filePath = path.join(process.cwd(), 'src', 'assets', 'saved-images', filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (fileError) {
                console.error('Error deleting image file:', fileError);
                // Continue even if file deletion fails
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            console.error('Database error deleting saved image:', error);
            throw new Error('Failed to delete saved image');
        } finally {
            connection.release();
        }
    }
}

export default CrewService.getInstance();