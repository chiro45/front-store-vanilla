export interface IUser {
  name: string;
  email: string;
  password?: string;
  id?: number;
  role?: string;
  phone?: string; // celular del backend
  apellido?: string; // apellido del backend
}

export interface IUserRegister {
  nombre: string;
  apellido: string;
  email: string;
  phone: string;
  password: string;
}
