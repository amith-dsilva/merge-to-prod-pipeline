import { Router } from "express";

import healthRoutes from "./health.routes";
import productRoutes from "./product.routes";

const router = Router();

router.use("/health", healthRoutes);

router.use("/products", productRoutes);

export default router;