import type { ICart } from "../types/ICart";
import type {
  CategoriaDto,
  ProductoDto,
  PedidoDto,
  PedidoCreate,
  UsuarioDto,
  UsuarioCreate,
  EstadoPedido,
  FormaPago,
} from "../types/IBackendDtos";
import { getStoredUser } from "./auth";

// Configuración del backend
const API_BASE_URL = "http://localhost:8080";

// Helper para hacer peticiones HTTP
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP Error ${response.status}: ${errorText || response.statusText}`
      );
    }

    // Si la respuesta es 204 No Content o está vacía, retornar objeto vacío
    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error en petición a ${endpoint}:`, error);
    throw error;
  }
}

// ============ Authentication API ============

// ⚠️ LIMITACIÓN DEL BACKEND: No existe endpoint /auth/login
// El backend debería implementar un endpoint POST /auth/login que:
// 1. Reciba { mail, password }
// 2. Valide la contraseña con BCrypt
// 3. Retorne el usuario autenticado o un error 401
//
// SOLUCIÓN TEMPORAL: Buscar usuario por email sin validar password
export const loginUser = async (
  mail: string,
  _password: string
): Promise<UsuarioDto | null> => {
  try {
    // Obtener todos los usuarios
    const usuarios = await fetchAPI<UsuarioDto[]>("/usuario");

    // Buscar usuario por mail
    const usuario = usuarios.find((u) => u.mail === mail);

    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    // ⚠️ ADVERTENCIA: No se valida la contraseña porque el backend:
    // - No devuelve la contraseña en el DTO (correcto por seguridad)
    // - No tiene endpoint de login que valide credenciales
    // TODO: El backend debe implementar POST /auth/login
    console.warn("⚠️ LOGIN SIN VALIDACIÓN DE CONTRASEÑA - Solo verificando que el usuario existe");

    return usuario;
  } catch (error) {
    console.error("Error en login:", error);
    return null;
  }
};

export const registerUser = async (userData: UsuarioCreate): Promise<UsuarioDto | null> => {
  try {
    const usuario = await fetchAPI<UsuarioDto>("/usuario", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    return usuario;
  } catch (error) {
    console.error("Error en registro:", error);
    return null;
  }
};

// ============ Categories API ============

export const getCategories = async (): Promise<CategoriaDto[]> => {
  return await fetchAPI<CategoriaDto[]>("/categoria");
};

export const getCategoryById = async (
  id: string
): Promise<CategoriaDto | null> => {
  return await fetchAPI<CategoriaDto>(`/categoria/${id}`);
};

export const createCategory = async (
  nombre: string,
  descripcion: string
): Promise<CategoriaDto> => {
  const body = {
    nombre,
    descripcion: descripcion || "",
  };

  return await fetchAPI<CategoriaDto>("/categoria", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const updateCategory = async (
  id: number | string,
  nombre: string,
  descripcion: string
): Promise<CategoriaDto> => {
  const body = {
    nombre,
    descripcion,
  };

  return await fetchAPI<CategoriaDto>(`/categoria/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
};

export const deleteCategory = async (id: number): Promise<void> => {
  await fetchAPI<void>(`/categoria/${id}`, {
    method: "DELETE",
  });
};

// ============ Products API ============

export const getProducts = async (): Promise<ProductoDto[]> => {
  return await fetchAPI<ProductoDto[]>("/producto");
};

export const getProductById = async (id: string): Promise<ProductoDto> => {
  return await fetchAPI<ProductoDto>(`/producto/${id}`);
};

export const getProductsByCategory = async (
  categoryId: string
): Promise<ProductoDto[]> => {
  return await fetchAPI<ProductoDto[]>(`/producto/categoria/${categoryId}`);
};

export const createProduct = async (
  nombre: string,
  precio: number,
  descripcion: string,
  stock: number,
  imagen: string,
  idCategoria: number
): Promise<ProductoDto> => {
  const body = {
    nombre,
    precio,
    descripcion: descripcion || "",
    stock,
    imagen,
    disponible: true,
    idCategoria,
  };

  return await fetchAPI<ProductoDto>("/producto", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const updateProduct = async (
  id: number,
  nombre: string,
  precio: number,
  descripcion: string,
  stock: number,
  imagen: string,
  disponible: boolean,
  idCategoria: number
): Promise<ProductoDto> => {
  const body = {
    nombre,
    precio,
    descripcion: descripcion || "",
    stock,
    imagen,
    disponible,
    idCategoria,
  };

  return await fetchAPI<ProductoDto>(`/producto/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
};

export const deleteProduct = async (id: number): Promise<void> => {
  await fetchAPI<void>(`/producto/${id}`, {
    method: "DELETE",
  });
};

// ============ Cart API (Temporal - Mock) ============

export const clearCart = async (): Promise<void> => {};

export const updateQuantity = (itemId: string, newQuantity: any) => {
  console.log(itemId, newQuantity);
};

export const removeFromCart = (itemId: string) => {
  console.log(itemId);
};

export const addToCart = (product: ProductoDto) => {
  console.log(product);
};

export const getCart = (): ICart => {
  return {
    items: [],
    total: 0,
  };
};

export const getCartItemCount = () => {
  return [];
};

// ============ Orders API ============

// Helper para convertir FormaPago del frontend al backend
function mapPaymentMethodToFormaPago(method: "cash" | "card" | "transfer"): FormaPago {
  const methodMap: Record<string, FormaPago> = {
    cash: "EFECTIVO",
    card: "TARJETA",
    transfer: "TRANSFERENCIA",
  };
  return methodMap[method];
}

export const createOrder = async (
  paymentMethod: "cash" | "card" | "transfer",
  items: Array<{ cantidad: number; idProducto: number }>
): Promise<void> => {
  const user = getStoredUser();

  if (!user || !user.id) {
    throw new Error("Usuario no autenticado");
  }

  const body: PedidoCreate = {
    estado: "PENDIENTE",
    formaPago: mapPaymentMethodToFormaPago(paymentMethod),
    detallePedido: items,
    idUsuario: user.id,
  };

  await fetchAPI<PedidoDto>("/pedido", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const getOrders = async (): Promise<PedidoDto[]> => {
  return await fetchAPI<PedidoDto[]>("/pedido");
};

export const updateOrderStatus = async (
  orderId: number,
  newStatus: EstadoPedido
): Promise<void> => {
  const body: Partial<PedidoCreate> = {
    estado: newStatus,
  };

  await fetchAPI<PedidoDto>(`/pedido/${orderId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
};
