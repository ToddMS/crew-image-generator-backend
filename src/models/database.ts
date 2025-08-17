import mysql from "mysql2/promise";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// Database type detection
const isDatabaseUrl = !!process.env.DATABASE_URL;
const isPostgreSQL = isDatabaseUrl || process.env.DB_TYPE === 'postgresql';

// PostgreSQL configuration
let pgPool: pg.Pool | null = null;
if (isPostgreSQL) {
  pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL || undefined,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
}

// MySQL configuration
let mysqlPool: mysql.Pool | null = null;
if (!isPostgreSQL) {
  mysqlPool = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || undefined,
    database: process.env.DB_NAME || "CrewManagement",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

// Database abstraction interface
export interface DatabaseResult {
  rows?: any[];
  insertId?: number;
  affectedRows?: number;
}

// Unified database interface
export class Database {
  static async query(sql: string, params: any[] = []): Promise<DatabaseResult> {
    if (isPostgreSQL && pgPool) {
      try {
        // Convert MySQL-style placeholders (?) to PostgreSQL-style ($1, $2, etc.)
        let pgSql = sql;
        let paramIndex = 1;
        pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);

        const result = await pgPool.query(pgSql, params);
        return {
          rows: result.rows,
          insertId: result.rows[0]?.id,
          affectedRows: result.rowCount || 0,
        };
      } catch (error) {
        console.error('PostgreSQL query error:', error);
        throw error;
      }
    } else if (mysqlPool) {
      try {
        const [result] = await mysqlPool.execute(sql, params);
        if (Array.isArray(result)) {
          return { rows: result };
        } else {
          return {
            insertId: (result as any).insertId,
            affectedRows: (result as any).affectedRows,
          };
        }
      } catch (error) {
        console.error('MySQL query error:', error);
        throw error;
      }
    } else {
      throw new Error('No database connection available');
    }
  }

  static async getConnection() {
    if (isPostgreSQL && pgPool) {
      return await pgPool.connect();
    } else if (mysqlPool) {
      return await mysqlPool.getConnection();
    } else {
      throw new Error('No database connection available');
    }
  }

  static getDatabaseType(): 'postgresql' | 'mysql' {
    return isPostgreSQL ? 'postgresql' : 'mysql';
  }
}

// Export the pools for backward compatibility
export const pool = mysqlPool;
export const pgPoolExport = pgPool;

export default Database;