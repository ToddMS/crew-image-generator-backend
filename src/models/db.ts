import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// PostgreSQL pool configuration
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || process.env.USER || "postgres",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "CrewManagement",
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
});

export default pool;
