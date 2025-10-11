export interface IProduct {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoriaId: number;
  activo: boolean;
  imagen: string;
}

export interface ICreateProduct {
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoriaId: number;
  imagen: string;
}

export interface IUpdateProduct {
  id: number;
  nombre?: string;
  descripcion?: string;
  precio?: number;
  stock?: number;
  categoriaId?: number;
  activo?: boolean;
  imagen: string;
}
