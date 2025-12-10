// Funciones para convertir entre los DTOs del backend y las interfaces del frontend

import type { IUser } from "../types/IUser";
import type { ICategory } from "../types/ICategoria";
import type { IProduct } from "../types/IProduct";
import type {
  UsuarioDto,
  CategoriaDto,
  ProductoDto,
  PedidoDto,
  EstadoPedido,
  FormaPago,
} from "../types/IBackendDtos";
import type { IOrder, StatusOrder } from "../types/IOrders";

// ============ MAPPERS DE USUARIO ============

export function mapUsuarioDtoToIUser(dto: UsuarioDto): IUser {
  return {
    id: dto.id,
    name: `${dto.nombre} ${dto.apellido}`,
    email: dto.mail,
    role: dto.rol === "ADMIN" ? "admin" : "cliente",
  };
}

// ============ MAPPERS DE CATEGORÍA ============

export function mapCategoriaDtoToICategory(dto: CategoriaDto): ICategory {
  return {
    id: dto.id,
    nombre: dto.nombre,
    descripcion: dto.descipcion || "", // Nota: el backend tiene typo "descipcion"
    activo: true, // El backend no devuelve este campo en el GET
    image: "", // El backend no maneja imágenes aún
  };
}

// ============ MAPPERS DE PRODUCTO ============

export function mapProductoDtoToIProduct(dto: ProductoDto, id?: number): IProduct {
  return {
    id: dto.id ?? id ?? 0,
    nombre: dto.nombre,
    descripcion: dto.descripcion,
    precio: dto.precio,
    stock: dto.stock,
    categoriaId: dto.categoria.id,
    activo: dto.disponible,
    imagen: dto.imagen,
  };
}

// ============ MAPPERS DE PEDIDO ============

// Mapear estados del backend a estados del frontend
export function mapEstadoBackendToFrontend(estado: EstadoPedido): StatusOrder {
  const estadoMap: Record<EstadoPedido, StatusOrder> = {
    PENDIENTE: "pending",
    CONFIRMADO: "processing",
    TERMINADO: "completed",
    CANCELADO: "cancelled",
  };
  return estadoMap[estado];
}

// Mapear estados del frontend a estados del backend
export function mapEstadoFrontendToBackend(status: StatusOrder): EstadoPedido {
  const statusMap: Record<StatusOrder, EstadoPedido> = {
    pending: "PENDIENTE",
    processing: "CONFIRMADO",
    completed: "TERMINADO",
    cancelled: "CANCELADO",
  };
  return statusMap[status];
}

// Mapear forma de pago del frontend al backend
export function mapPaymentMethodToFormaPago(
  method: "cash" | "card" | "transfer"
): FormaPago {
  const methodMap: Record<string, FormaPago> = {
    cash: "EFECTIVO",
    card: "TARJETA",
    transfer: "TRANSFERENCIA",
  };
  return methodMap[method];
}

// Mapear forma de pago del backend al frontend
export function mapFormaPagoToPaymentMethod(
  formaPago: FormaPago
): "cash" | "card" | "transfer" {
  const pagoMap: Record<FormaPago, "cash" | "card" | "transfer"> = {
    EFECTIVO: "cash",
    TARJETA: "card",
    TRANSFERENCIA: "transfer",
  };
  return pagoMap[formaPago];
}

// Mapear pedido del backend al frontend
export function mapPedidoDtoToIOrder(dto: PedidoDto): IOrder {
  return {
    id: dto.id.toString(),
    userName: "", // El backend no incluye info del usuario en el DTO del pedido
    phone: "",
    address: "",
    paymentMethod: mapFormaPagoToPaymentMethod(dto.formaPago),
    notes: "",
    subtotal: dto.total, // El backend solo tiene total
    shipping: 0,
    total: dto.total,
    status: mapEstadoBackendToFrontend(dto.estado),
    createdAt: dto.fecha,
    items: dto.detalles.map((detalle) => ({
      name: detalle.productoDto.nombre,
      price: detalle.productoDto.precio,
      quantity: detalle.cantidad,
    })),
  };
}
