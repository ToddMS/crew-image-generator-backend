import { Crew, BoatType, CrewDB } from '../types/crew.types.js';
import pool from '../models/db.js';

interface CrewQueryResult {
    id: number;
    name: string;
    club_name: string;
    race_name: string;
    coach_name: string | null;
    user_id: number;
    boattypeid: number;
    boattypevalue: string;
    boattypeseats: number;
    boattypename: string;
    crewnames: string | null;
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
            coachName: row.coach_name || undefined,
            userId: row.user_id,
            boatType: {
                id: row.boattypeid,
                value: row.boattypevalue,
                seats: row.boattypeseats,
                name: row.boattypename
            },
            crewNames: row.crewnames ? row.crewnames.split(',') : []
        };
    }

    async getCrews(): Promise<Crew[]> {
        console.info("Getting all Crews (deprecated - use getCrewsByUserId)");
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    c.id, 
                    c.name, 
                    c.club_name, 
                    c.race_name,
                    c.coach_name,
                    c.user_id,
                    b.id as boatTypeId, 
                    b.value as boatTypeValue, 
                    b.seats as boatTypeSeats, 
                    b.name as boatTypeName,
                    STRING_AGG(cm.name, ',' ORDER BY cm.seat_number) as crewNames
                FROM Crews c
                JOIN BoatTypes b ON c.boat_type_id = b.id
                LEFT JOIN CrewMembers cm ON c.id = cm.crew_id
                GROUP BY c.id, b.id
                ORDER BY c.created_at DESC
            `);

            return result.rows.map(row => this.mapToCrewResponse(row));
        } catch (error) {
            console.error('Database error:', error);
            throw new Error('Failed to fetch crews');
        } finally {
            client.release();
        }
    }

    async getCrewsByUserId(userId: number): Promise<Crew[]> {
        console.info("Getting Crews for user:", userId);
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    c.id, 
                    c.name, 
                    c.club_name, 
                    c.race_name,
                    c.coach_name,
                    c.user_id,
                    b.id as boatTypeId, 
                    b.value as boatTypeValue, 
                    b.seats as boatTypeSeats, 
                    b.name as boatTypeName,
                    STRING_AGG(cm.name, ',' ORDER BY cm.seat_number) as crewNames
                FROM Crews c
                JOIN BoatTypes b ON c.boat_type_id = b.id
                LEFT JOIN CrewMembers cm ON c.id = cm.crew_id
                WHERE c.user_id = $1
                GROUP BY c.id, b.id
                ORDER BY c.created_at DESC
            `, [userId]);

            return result.rows.map(row => this.mapToCrewResponse(row));
        } catch (error) {
            console.error('Database error:', error);
            throw new Error('Failed to fetch crews for user');
        } finally {
            client.release();
        }
    }

    async getCrewById(id: string | number): Promise<Crew | null> {
        console.info("Getting Crew by ID:", id);
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    c.id, 
                    c.name, 
                    c.club_name, 
                    c.race_name,
                    c.coach_name,
                    c.user_id,
                    b.id as boatTypeId, 
                    b.value as boatTypeValue, 
                    b.seats as boatTypeSeats, 
                    b.name as boatTypeName,
                    STRING_AGG(cm.name, ',' ORDER BY cm.seat_number) as crewNames
                FROM Crews c
                JOIN BoatTypes b ON c.boat_type_id = b.id
                LEFT JOIN CrewMembers cm ON c.id = cm.crew_id
                WHERE c.id = $1
                GROUP BY c.id, b.id
            `, [id]);

            if (result.rows.length === 0) {
                return null;
            }

            return this.mapToCrewResponse(result.rows[0]);
        } catch (error) {
            console.error('Database error:', error);
            throw new Error('Failed to fetch crew by ID');
        } finally {
            client.release();
        }
    }

    async addCrew(crewData: CrewDB): Promise<number> {
        console.info("Adding new crew:", crewData.name);
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            // Insert crew
            const crewResult = await client.query(`
                INSERT INTO Crews (user_id, name, club_name, race_name, boat_type_id, coach_name)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
            `, [
                (crewData as any).userId,
                crewData.name,
                crewData.club_name,
                crewData.race_name,
                crewData.boat_type_id,
                crewData.coach_name || null
            ]);

            const crewId = crewResult.rows[0].id;

            // Insert crew members
            if ((crewData as any).crewNames && (crewData as any).crewNames.length > 0) {
                for (let i = 0; i < (crewData as any).crewNames.length; i++) {
                    if ((crewData as any).crewNames[i].trim()) {
                        await client.query(`
                            INSERT INTO CrewMembers (crew_id, name, seat_number)
                            VALUES ($1, $2, $3)
                        `, [crewId, (crewData as any).crewNames[i].trim(), i + 1]);
                    }
                }
            }

            await client.query('COMMIT');
            return crewId;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Database error:', error);
            throw new Error('Failed to add crew');
        } finally {
            client.release();
        }
    }

    async updateCrew(id: number, userId: number, updateData: Partial<CrewDB>): Promise<Crew | null> {
        console.info("Updating crew:", id);
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            // Update crew basic info
            const crewResult = await client.query(`
                UPDATE Crews 
                SET name = COALESCE($1, name),
                    club_name = COALESCE($2, club_name),
                    race_name = COALESCE($3, race_name),
                    boat_type_id = COALESCE($4, boat_type_id),
                    coach_name = COALESCE($5, coach_name),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $6 AND user_id = $7
                RETURNING id
            `, [
                updateData.name,
                updateData.club_name,
                updateData.race_name,
                updateData.boat_type_id,
                updateData.coach_name,
                id,
                userId
            ]);

            if (crewResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return null;
            }

            // Update crew members if provided
            if ((updateData as any).crewNames) {
                // Delete existing crew members
                await client.query('DELETE FROM CrewMembers WHERE crew_id = $1', [id]);

                // Insert new crew members
                for (let i = 0; i < (updateData as any).crewNames.length; i++) {
                    if ((updateData as any).crewNames[i].trim()) {
                        await client.query(`
                            INSERT INTO CrewMembers (crew_id, name, seat_number)
                            VALUES ($1, $2, $3)
                        `, [id, (updateData as any).crewNames[i].trim(), i + 1]);
                    }
                }
            }

            await client.query('COMMIT');
            return await this.getCrewById(id);
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Database error:', error);
            throw new Error('Failed to update crew');
        } finally {
            client.release();
        }
    }

    async deleteCrew(id: number, userId: number): Promise<boolean> {
        console.info("Deleting crew:", id);
        const client = await pool.connect();
        try {
            const result = await client.query(
                'DELETE FROM Crews WHERE id = $1 AND user_id = $2',
                [id, userId]
            );
            return (result.rowCount ?? 0) > 0;
        } catch (error) {
            console.error('Database error:', error);
            throw new Error('Failed to delete crew');
        } finally {
            client.release();
        }
    }

    async getBoatTypes(): Promise<BoatType[]> {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT * FROM BoatTypes ORDER BY seats DESC');
            return result.rows;
        } catch (error) {
            console.error('Database error:', error);
            throw new Error('Failed to fetch boat types');
        } finally {
            client.release();
        }
    }

    // Image-related methods
    async saveCrewImage(imageData: any): Promise<number> {
        console.info("Saving crew image for crew:", imageData.crewId);
        const client = await pool.connect();
        try {
            const result = await client.query(`
                INSERT INTO SavedImages (
                    crew_id, user_id, image_name, template_id,
                    primary_color, secondary_color, image_filename,
                    image_url, file_size, mime_type
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id
            `, [
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
            ]);

            return result.rows[0].id;
        } catch (error) {
            console.error('Database error:', error);
            throw new Error('Failed to save crew image');
        } finally {
            client.release();
        }
    }

    async getSavedImagesByCrewId(crewId: number): Promise<any[]> {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT * FROM SavedImages 
                WHERE crew_id = $1 
                ORDER BY created_at DESC
            `, [crewId]);

            return result.rows;
        } catch (error) {
            console.error('Database error:', error);
            throw new Error('Failed to fetch saved images');
        } finally {
            client.release();
        }
    }

    async deleteSavedImage(imageId: number, userId: number): Promise<boolean> {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                DELETE FROM SavedImages 
                WHERE id = $1 AND user_id = $2
            `, [imageId, userId]);

            return (result.rowCount ?? 0) > 0;
        } catch (error) {
            console.error('Database error:', error);
            throw new Error('Failed to delete saved image');
        } finally {
            client.release();
        }
    }
}

export default CrewService.getInstance();