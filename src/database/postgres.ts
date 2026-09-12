import { Pool } from "pg";
import { env } from "../config/env";

export const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,

  max: 10,

  idleTimeoutMillis: 30_000,

  connectionTimeoutMillis: 5_000
});

pool.on("error", (error: Error) => {
  console.error("Unexpected PostgreSQL pool error:", error);
});

export async function checkDatabaseConnection(): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query("SELECT 1");
    console.log("PostgreSQL connected successfully");
  } finally {
    client.release();
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  await pool.end();

  console.log("PostgreSQL connection pool closed");
}