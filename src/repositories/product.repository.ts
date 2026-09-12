import { pool } from "../database/postgres";
import {
  CreateProductInput,
  Product
} from "../models/product.model";

interface ProductRow {
  id: number;
  name: string;
  price: string;
  stock: number;
  created_at: Date;
}

export class ProductRepository {
  async findAll(): Promise<Product[]> {
    const result = await pool.query<ProductRow>(
      `
      SELECT
        id,
        name,
        price,
        stock,
        created_at
      FROM products
      ORDER BY id DESC
      `
    );

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      price: Number(row.price),
      stock: row.stock,
      createdAt: row.created_at
    }));
  }

  async findById(id: number): Promise<Product | null> {
    const result = await pool.query<ProductRow>(
      `
      SELECT
        id,
        name,
        price,
        stock,
        created_at
      FROM products
      WHERE id = $1
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return null;
    }

    const row = result.rows[0];

    return {
      id: row.id,
      name: row.name,
      price: Number(row.price),
      stock: row.stock,
      createdAt: row.created_at
    };
  }

  async create(data: CreateProductInput): Promise<Product> {
    const result = await pool.query<ProductRow>(
      `
      INSERT INTO products (
        name,
        price,
        stock
      )
      VALUES ($1, $2, $3)
      RETURNING
        id,
        name,
        price,
        stock,
        created_at
      `,
      [
        data.name,
        data.price,
        data.stock
      ]
    );

    const row = result.rows[0];

    return {
      id: row.id,
      name: row.name,
      price: Number(row.price),
      stock: row.stock,
      createdAt: row.created_at
    };
  }
}