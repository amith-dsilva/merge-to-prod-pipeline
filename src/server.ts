import type { Server } from "http";

import app from "./app.js";
import { env } from "./config/env.js";

import {
  checkDatabaseConnection,
  closeDatabaseConnection
} from "./database/postgres.js";

let server: Server | undefined;

async function startServer(): Promise<void> {
  try {
    await checkDatabaseConnection();

    server = app.listen(env.PORT, () => {
      console.log(
        `Server running in ${env.NODE_ENV} mode on port ${env.PORT}`
      );

      console.log(
        `Health: http://localhost:${env.PORT}/api/v1/health`
      );
    });
  } catch (error) {
    console.error("Failed to start application:", error);
    process.exit(1);
  }
}

async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`${signal} received. Shutting down...`);

  if (!server) {
    await closeDatabaseConnection();
    process.exit(0);
  }

  server.close(async () => {
    await closeDatabaseConnection();

    console.log("Application shut down successfully");

    process.exit(0);
  });
}

process.on("SIGTERM", () => {
  void gracefulShutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void gracefulShutdown("SIGINT");
});

void startServer();