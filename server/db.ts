import { Pool } from 'pg'; // FIX: Changed driver to standard 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'; // FIX: Changed adapter to 'node-postgres'
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure connection pool for PostgreSQL 13+
// SSL is optional - set DATABASE_SSL=true in .env if your host requires it
// For Truehost local connections, SSL is typically not required
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection could not be established
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Test database connection on startup
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

// Initialize Drizzle ORM with standard PostgreSQL adapter
export const db = drizzle(pool, { schema });

// Export a function to test database connectivity
export async function testDatabaseConnection() {
  let client;
  try {
    client = await pool.connect();
    console.log('✅ Database connection successful');
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database query test successful:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  } finally {
    // Always release the client back to the pool
    if (client) {
      client.release();
    }
  }
}