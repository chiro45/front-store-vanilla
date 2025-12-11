import type { ProductoDto } from "./IBackendDtos";

// Producto dentro del carrito (agrega cantidad)
export interface ICartItem extends ProductoDto {
  cantidad: number;
}

// Estructura completa del carrito
export interface ICart {
  items: ICartItem[];
  total: number;
}
