import type { ICart } from "../types/ICart";
import type {
  ICategory,
  ICreateCategory,
  IUpdateCategory,
} from "../types/ICategoria";
import type {
  ICreateProduct,
  IProduct,
  IUpdateProduct,
} from "../types/IProduct";
import type { IUser, IUserRegister } from "../types/IUser";
import type { ICreateOrder } from "../types/IOrders";
import type {
  CategoriaDto,
  ProductoDto,
  PedidoDto,
  PedidoCreate,
  DetallePedidoCreate,
  UsuarioDto,
  UsuarioCreate,
} from "../types/IBackendDtos";
import {
  mapCategoriaDtoToICategory,
  mapProductoDtoToIProduct,
  mapPedidoDtoToIOrder,
  mapPaymentMethodToFormaPago,
  mapEstadoFrontendToBackend,
  mapUsuarioDtoToIUser,
} from "./mappers";
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

// Authentication API
// NOTA: El backend no tiene un endpoint específico de login
// Por ahora usaremos GET /usuario para buscar el usuario por email
export const loginUser = async (
  email: string,
  password: string
): Promise<IUser | null> => {
  try {
    // Obtener todos los usuarios
    const usuarios = await fetchAPI<UsuarioDto[]>("/usuario");

    // Buscar usuario por email
    // IMPORTANTE: Esto no es seguro, solo para propósitos de desarrollo
    // El backend debería tener un endpoint /auth/login dedicado
    const usuario = usuarios.find((u) => u.mail === email);

    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    // Como el backend no devuelve la contraseña, no podemos validarla aquí
    // Esto es una limitación del backend actual
    return mapUsuarioDtoToIUser(usuario);
  } catch (error) {
    console.error("Error en login:", error);
    return null;
  }
};

export const registerUser = async (userData: IUser): Promise<IUser | null> => {
  try {
    // Separar nombre y apellido
    const [nombre, ...apellidoParts] = userData.name.split(" ");
    const apellido = apellidoParts.join(" ") || "";

    const body: UsuarioCreate = {
      nombre,
      apellido,
      mail: userData.email,
      celular: userData.phone || "",
      contraseña: userData.password || "",
    };

    const usuario = await fetchAPI<UsuarioDto>("/usuario", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return mapUsuarioDtoToIUser(usuario);
  } catch (error) {
    console.error("Error en registro:", error);
    return null;
  }
};

// Categories API
export const getCategories = async (): Promise<ICategory[]> => {
  const categorias = await fetchAPI<CategoriaDto[]>("/categoria");
  return categorias.map(mapCategoriaDtoToICategory);
};

export const getCategoryById = async (
  id: string
): Promise<ICategory | null> => {
  const categoria = await fetchAPI<CategoriaDto>(`/categoria/${id}`);
  return mapCategoriaDtoToICategory(categoria);
};

export const createCategory = async (
  category: ICreateCategory
): Promise<ICategory> => {
  const body = {
    nombre: category.nombre,
    descripcion: category.descripcion || "",
  };

  const categoria = await fetchAPI<CategoriaDto>("/categoria", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return mapCategoriaDtoToICategory(categoria);
};

export const updateCategory = async (
  id: number | string,
  category: IUpdateCategory
): Promise<ICategory> => {
  const body = {
    nombre: category.nombre,
    descripcion: category.descripcion,
  };

  const categoria = await fetchAPI<CategoriaDto>(`/categoria/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

  return mapCategoriaDtoToICategory(categoria);
};

export const deleteCategory = async (id: number): Promise<void> => {
  await fetchAPI<void>(`/categoria/${id}`, {
    method: "DELETE",
  });
};

// Products API
export const getProducts = async (): Promise<IProduct[]> => {
  const productos = await fetchAPI<ProductoDto[]>("/producto");
  return productos.map((p, index) => mapProductoDtoToIProduct(p, index + 1));
};

export const getProductById = async (id: string): Promise<IProduct> => {
  const producto = await fetchAPI<ProductoDto>(`/producto/${id}`);
  return mapProductoDtoToIProduct(producto, Number(id));
};

export const getProductsByCategory = async (
  categoryId: string
): Promise<IProduct[]> => {
  const productos = await fetchAPI<ProductoDto[]>(
    `/producto/findByCategoria/${categoryId}`
  );
  return productos.map((p, index) => mapProductoDtoToIProduct(p, index + 1));
};

export const createProduct = async (
  product: ICreateProduct
): Promise<IProduct> => {
  const body = {
    nombre: product.nombre,
    precio: product.precio,
    descripcion: product.descripcion || "",
    stock: product.stock,
    imagen: product.imagen,
    disponible: true,
    idCategoria: product.categoriaId,
  };

  const producto = await fetchAPI<ProductoDto>("/producto", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return mapProductoDtoToIProduct(producto);
};

export const updateProduct = async (
  id: number,
  product: IUpdateProduct
): Promise<IProduct> => {
  const body = {
    nombre: product.nombre,
    precio: product.precio,
    descripcion: product.descripcion || "",
    stock: product.stock,
    imagen: product.imagen,
    disponible: product.activo ?? true,
    idCategoria: product.categoriaId,
  };

  const producto = await fetchAPI<ProductoDto>(`/producto/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

  return mapProductoDtoToIProduct(producto, id);
};

export const clearCart = async (): Promise<void> => {};

export const deleteProduct = async (id: number): Promise<void> => {
  await fetchAPI<void>(`/producto/${id}`, {
    method: "DELETE",
  });
};

export const updateQuantity = (itemId: string, newQuantity: any) => {
  console.log(itemId, newQuantity);
};

export const removeFromCart = (itemId: string) => {
  console.log(itemId);
};

export const addToCart = (product: IProduct) => {
  console.log(product);
};
export const getCart = (): ICart => {
  return {
    items: [
      {
        id: 1,
        nombre: "Auriculares Bluetooth",
        descripcion: "Auriculares inalámbricos con cancelación de ruido",
        precio: 25000,
        stock: 10,
        categoriaId: 3,
        activo: true,
        imagen:
          "https://http2.mlstatic.com/D_NQ_NP_2X_852686-MLA82382440528_022025-F.webp",
        cantidad: 2,
      },
      {
        id: 2,
        nombre: "Mouse Gamer",
        descripcion: "Mouse RGB de alta precisión",
        precio: 15000,
        stock: 8,
        categoriaId: 3,
        activo: true,
        imagen:
          "https://http2.mlstatic.com/D_NQ_NP_2X_852686-MLA82382440528_022025-F.webp",
        cantidad: 1,
      },
    ],
    total: 65000,
  };
};
export const getCartItemCount = () => {
  return [];
};

// Orders API
export const createOrder = async (orderData: ICreateOrder): Promise<void> => {
  const user = getStoredUser();

  if (!user || !user.id) {
    throw new Error("Usuario no autenticado");
  }

  const detallePedido: DetallePedidoCreate[] = orderData.items.map((item) => ({
    cantidad: item.quantity,
    idProducto: item.productId ?? 0,
  }));

  const body: PedidoCreate = {
    estado: "PENDIENTE",
    formaPago: mapPaymentMethodToFormaPago(orderData.paymentMethod),
    detallePedido,
    idUsuario: user.id,
  };

  await fetchAPI<PedidoDto>("/pedido", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const getOrders = async (): Promise<any[]> => {
  const pedidos = await fetchAPI<PedidoDto[]>("/pedido");
  return pedidos.map(mapPedidoDtoToIOrder);
};

export const updateOrderStatus = async (
  orderId: string,
  newStatus: string
): Promise<void> => {
  const estadoBackend = mapEstadoFrontendToBackend(newStatus as any);

  // Para actualizar el estado, necesitamos enviar el pedido completo
  // Por ahora solo enviamos el estado
  const body: Partial<PedidoCreate> = {
    estado: estadoBackend,
  };

  await fetchAPI<PedidoDto>(`/pedido/${orderId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
};
