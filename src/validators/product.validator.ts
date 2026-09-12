import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Product name is required")
    .max(255),

  price: z
    .number()
    .positive("Price must be greater than 0"),

  stock: z
    .number()
    .int()
    .min(0, "Stock cannot be negative")
});