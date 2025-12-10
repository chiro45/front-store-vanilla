// DTOs que vienen del backend de SpringBoot
// Estos tipos mapean exactamente lo que retorna el backend

export interface UsuarioDto {
  id: number;
  nombre: string;
  apellido: string;
  mail: string;
  celular: string;
  rol: "ADMIN" | "USUARIO";
}

export interface UsuarioCreate {
  nombre: string;
  apellido: string;
  mail: string;
  celular: string;
  contraseña: string;
}

export interface CategoriaDto {
  id: number;
  nombre: string;
  descipcion: string; // Nota: typo en backend
}

export interface ProductoDto {
  id?: number; // Algunos endpoints pueden incluir el id
  nombre: string;
  precio: number;
  descripcion?: string;
  stock: number;
  imagen: string;
  disponible: boolean;
  categoria: CategoriaDto;
}

export interface ProductoCreate {
  nombre: string;
  precio: number;
  descripcion?: string;
  stock: number;
  imagen: string;
  disponible: boolean;
  idCategoria: number;
}

export interface ProductoEdit {
  nombre: string;
  precio: number;
  descripcion?: string;
  stock: number;
  imagen: string;
  disponible: boolean;
  idCategoria: number;
}

export interface DetallePedidoDto {
  cantidad: number;
  subtotal: number;
  productoDto: ProductoDto;
}

export interface DetallePedidoCreate {
  cantidad: number;
  idProducto: number;
}

export type EstadoPedido = "PENDIENTE" | "CONFIRMADO" | "TERMINADO" | "CANCELADO";
export type FormaPago = "TARJETA" | "TRANSFERENCIA" | "EFECTIVO";

export interface PedidoDto {
  id: number;
  fecha: string; // LocalDate en formato YYYY-MM-DD
  estado: EstadoPedido;
  total: number;
  formaPago: FormaPago;
  detalles: DetallePedidoDto[];
}

export interface PedidoCreate {
  estado: EstadoPedido;
  formaPago: FormaPago;
  detallePedido: DetallePedidoCreate[];
  idUsuario: number;
}
