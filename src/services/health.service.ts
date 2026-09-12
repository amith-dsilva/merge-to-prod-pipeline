import { pool } from "../database/postgres";

export class HealthService {
  async checkHealth(): Promise<{
    status: string;
    database: string;
    timestamp: string;
  }> {
    await pool.query("SELECT 1");

    return {
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString()
    };
  }
}