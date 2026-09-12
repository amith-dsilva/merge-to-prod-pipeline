import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProductService } from "../src/services/product.service.js";
import { ProductRepository } from "../src/repositories/product.repository.js";


describe("ProductService", () => {
  let repository: ProductRepository;
  let service: ProductService;

  beforeEach(() => {
    repository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn()
    } as unknown as ProductRepository;

    service = new ProductService(repository);
  });

  describe("getProducts", () => {
    it("should return all products", async () => {
      const products = [
        {
          id: 1,
          name: "Laptop",
          price: 85000,
          stock: 10,
          createdAt: new Date()
        },
        {
          id: 2,
          name: "Keyboard",
          price: 5000,
          stock: 20,
          createdAt: new Date()
        }
      ];

      vi.mocked(repository.findAll).mockResolvedValue(products);

      const result = await service.getProducts();

      expect(result).toEqual(products);
      expect(repository.findAll).toHaveBeenCalledOnce();
    });
  });

  describe("getProductById", () => {
    it("should return product when product exists", async () => {
      const product = {
        id: 1,
        name: "Laptop",
        price: 85000,
        stock: 10,
        createdAt: new Date()
      };

      vi.mocked(repository.findById).mockResolvedValue(product);

      const result = await service.getProductById(1);

      expect(result).toEqual(product);

      expect(repository.findById)
        .toHaveBeenCalledWith(1);
    });

    it("should throw 404 when product does not exist", async () => {
      vi.mocked(repository.findById).mockResolvedValue(null);

      await expect(
        service.getProductById(999)
      ).rejects.toEqual(
        expect.objectContaining({
          statusCode: 404,
          message: "Product not found"
        })
      );
    });
  });

  describe("createProduct", () => {
    it("should create a product", async () => {
      const input = {
        name: "Mouse",
        price: 2000,
        stock: 15
      };

      const createdProduct = {
        id: 3,
        ...input,
        createdAt: new Date()
      };

      vi.mocked(repository.create)
        .mockResolvedValue(createdProduct);

      const result =
        await service.createProduct(input);

      expect(result).toEqual(createdProduct);

      expect(repository.create)
        .toHaveBeenCalledWith(input);
    });
  });
});