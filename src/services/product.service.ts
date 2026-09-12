import {
  CreateProductInput,
  Product
} from "../models/product.model";

import { ProductRepository } from "../repositories/product.repository";
import { AppError } from "../utils/app-error";

export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository
  ) {}

  async getProducts(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  async getProductById(id: number): Promise<Product> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new AppError(404, "Product not found");
    }

    return product;
  }

  async createProduct(
    data: CreateProductInput
  ): Promise<Product> {
    return this.productRepository.create(data);
  }
}