import {
  NextFunction,
  Request,
  Response
} from "express";

import { ProductRepository } from "../repositories/product.repository";
import { ProductService } from "../services/product.service";
import { createProductSchema } from "../validators/product.validator";

const productRepository = new ProductRepository();

const productService = new ProductService(
  productRepository
);

export async function getProducts(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const products = await productService.getProducts();

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid product id"
      });

      return;
    }

    const product =
      await productService.getProductById(id);

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
}

export async function createProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validation =
      createProductSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten().fieldErrors
      });

      return;
    }

    const product =
      await productService.createProduct(
        validation.data
      );

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
}