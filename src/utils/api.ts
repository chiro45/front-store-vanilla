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
    role: "admin",
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
      image: "",
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
    image: "",
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
    image: "",
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
    image: "",
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
      imagen: "",
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
    imagen: "",
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
      imagen: "",
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
    imagen: "",
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
    imagen: "",
  };
};

export const deleteProduct = async (id: number): Promise<void> => {
  console.log(id);
};
