export interface IOrderItem {
  name: string;
  price: number;
  quantity: number;
}
export type StatusOrder = "pending" | "processing" | "completed" | "cancelled";
export interface IOrder {
  id: string;
  userName: string;
  phone: string;
  address: string;
  paymentMethod: "cash" | "card" | "transfer";
  notes?: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: StatusOrder;
  createdAt: string;
  items: IOrderItem[];
}

export interface ICreateOrder {
  userName: string;
  phone: string;
  address: string;
  paymentMethod: "cash" | "card" | "transfer";
  notes?: string;
  items: IOrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
}

export interface IUpdateOrder {
  id: string;
  status?: StatusOrder;
  notes?: string;
}
