import type { IProduct } from "./IProduct";

// Producto dentro del carrito (agrega cantidad)
export interface ICartItem extends IProduct {
  cantidad: number;
}

// Estructura completa del carrito
export interface ICart {
  items: ICartItem[];
  total: number;
}
