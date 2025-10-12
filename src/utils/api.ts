import type { ICart } from "../types/ICart";
import type {
  ICategory,
  ICreateCategory,
  IUpdateCategory,
} from "../types/ICategoria";
import type { IOrder } from "../types/IOrders";
import type {
  ICreateProduct,
  IProduct,
  IUpdateProduct,
} from "../types/IProduct";
import type { IUser } from "../types/IUser";

export const loginUser = async (
  email: string,
  password: string
): Promise<IUser | null> => {
  console.log(email, password);
  return {
    name: "Juan Pérez",
    email: "juan.perez@example.com",
    id: 1,
    // role: "admin",
  };
};

export const registerUser = async (userData: IUser): Promise<IUser | null> => {
  console.log(userData);
  return {
    name: "Juan Pérez",
    email: "juan.perez@example.com",
    id: 1,
  };
};

// Categories API
export const getCategories = async (): Promise<ICategory[]> => {
  return [
    {
      id: 1,
      nombre: "Electrónica",
      descripcion: "Productos y dispositivos tecnológicos",
      activo: true,
      image:
        "https://http2.mlstatic.com/D_NQ_NP_2X_852686-MLA82382440528_022025-F.webp",
    },
  ];
};

export const getCategoryById = async (
  id: string
): Promise<ICategory | null> => {
  console.log(id);
  return {
    id: 1,
    nombre: "Electrónica",
    descripcion: "Productos y dispositivos tecnológicos",
    activo: true,
    image:
      "https://http2.mlstatic.com/D_NQ_NP_2X_852686-MLA82382440528_022025-F.webp",
  };
};

export const createCategory = async (
  category: ICreateCategory
): Promise<ICategory> => {
  console.log(category);
  return {
    id: 1,
    nombre: "Electrónica",
    descripcion: "Productos y dispositivos tecnológicos",
    activo: true,
    image:
      "https://http2.mlstatic.com/D_NQ_NP_2X_852686-MLA82382440528_022025-F.webp",
  };
};
export const updateCategory = async (
  id: number | string,
  category: IUpdateCategory
): Promise<ICategory> => {
  console.log(id, category);
  return {
    id: 1,
    nombre: "Electrónica",
    descripcion: "Productos y dispositivos tecnológicos",
    activo: true,
    image:
      "https://http2.mlstatic.com/D_NQ_NP_2X_852686-MLA82382440528_022025-F.webp",
  };
};

export const deleteCategory = async (id: number): Promise<void> => {
  console.log(id);
};

// Products API
export const getProducts = async (): Promise<IProduct[]> => {
  return [
    {
      id: 1,
      nombre: "Auriculares Bluetooth",
      descripcion: "Auriculares inalámbricos con cancelación de ruido",
      precio: 25000,
      stock: 30,
      categoriaId: 1,
      activo: true,
      imagen:
        "https://http2.mlstatic.com/D_NQ_NP_2X_852686-MLA82382440528_022025-F.webp",
    },
  ];
};

export const getProductById = async (id: string): Promise<IProduct> => {
  console.log(id);
  return {
    id: 1,
    nombre: "Auriculares Bluetooth",
    descripcion: "Auriculares inalámbricos con cancelación de ruido",
    precio: 25000,
    stock: 30,
    categoriaId: 1,
    activo: true,
    imagen:
      "https://http2.mlstatic.com/D_NQ_NP_2X_852686-MLA82382440528_022025-F.webp",
  };
};

export const getProductsByCategory = async (
  categoryId: string
): Promise<IProduct[]> => {
  console.log(categoryId);
  return [
    {
      id: 1,
      nombre: "Auriculares Bluetooth",
      descripcion: "Auriculares inalámbricos con cancelación de ruido",
      precio: 25000,
      stock: 30,
      categoriaId: 1,
      activo: true,
      imagen:
        "https://http2.mlstatic.com/D_NQ_NP_2X_852686-MLA82382440528_022025-F.webp",
    },
  ];
};
export const createProduct = async (
  product: ICreateProduct
): Promise<IProduct> => {
  console.log(product);
  return {
    id: 1,
    nombre: "Auriculares Bluetooth",
    descripcion: "Auriculares inalámbricos con cancelación de ruido",
    precio: 25000,
    stock: 30,
    categoriaId: 1,
    activo: true,
    imagen:
      "https://http2.mlstatic.com/D_NQ_NP_2X_852686-MLA82382440528_022025-F.webp",
  };
};

export const updateProduct = async (
  id: number,
  product: IUpdateProduct
): Promise<IProduct> => {
  console.log(id, product);
  return {
    id: 1,
    nombre: "Auriculares Bluetooth",
    descripcion: "Auriculares inalámbricos con cancelación de ruido",
    precio: 25000,
    stock: 30,
    categoriaId: 1,
    activo: true,
    imagen:
      "https://http2.mlstatic.com/D_NQ_NP_2X_852686-MLA82382440528_022025-F.webp",
  };
};
export const createOrder = async (orderData: any): Promise<void> => {
  console.log(orderData);
};
export const clearCart = async (): Promise<void> => {};
export const deleteProduct = async (id: number): Promise<void> => {
  console.log(id);
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

export const getOrders = async (): Promise<IOrder[]> => {
  return [];
};

export const updateOrderStatus = async (
  currentOrderId: string,
  newStatus: string
): Promise<void> => {
  console.log(currentOrderId, newStatus);
};
