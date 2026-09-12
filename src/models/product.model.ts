export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  createdAt: Date;
}

export interface CreateProductInput {
  name: string;
  price: number;
  stock: number;
}