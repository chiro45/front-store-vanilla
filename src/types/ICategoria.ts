export interface ICategory {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  image:string,
  
}

export interface ICreateCategory {
  nombre: string;
  descripcion?: string;
}

export interface IUpdateCategory {
  id: number;
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}
