import {
  NextFunction,
  Request,
  Response
} from "express";

import { HealthService } from "../services/health.service";

const healthService = new HealthService();

export async function healthCheck(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const health =
      await healthService.checkHealth();

    res.status(200).json(health);
  } catch (error) {
    next(error);
  }
}