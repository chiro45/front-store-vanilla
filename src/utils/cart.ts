import type { ICart, ICartItem } from "../types/ICart";
import type { ProductoDto } from "../types/IBackendDtos";

const CART_KEY = "shopping_cart";

// Obtener carrito del localStorage
export const getCart = (): ICart => {
  const cartStr = localStorage.getItem(CART_KEY);
  if (!cartStr) {
    return { items: [], total: 0 };
  }
  return JSON.parse(cartStr);
};

// Guardar carrito en localStorage
const saveCart = (cart: ICart): void => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

// Calcular total del carrito
const calculateTotal = (items: ICartItem[]): number => {
  return items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
};

// Agregar producto al carrito
export const addToCart = (product: ProductoDto, quantity: number = 1): void => {
  const cart = getCart();

  // Verificar si el producto ya está en el carrito
  const existingItemIndex = cart.items.findIndex(
    (item) => item.id === product.id
  );

  if (existingItemIndex > -1) {
    // Si ya existe, incrementar cantidad
    cart.items[existingItemIndex].cantidad += quantity;
  } else {
    // Si no existe, agregarlo
    const cartItem: ICartItem = {
      ...product,
      cantidad: quantity,
    };
    cart.items.push(cartItem);
  }

  cart.total = calculateTotal(cart.items);
  saveCart(cart);
};

// Actualizar cantidad de un item
export const updateQuantity = (
  productId: number,
  newQuantity: number
): void => {
  const cart = getCart();
  const itemIndex = cart.items.findIndex((item) => item.id === productId);

  if (itemIndex > -1) {
    if (newQuantity <= 0) {
      // Si la cantidad es 0 o menor, remover el item
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].cantidad = newQuantity;
    }

    cart.total = calculateTotal(cart.items);
    saveCart(cart);
  }
};

// Remover item del carrito
export const removeFromCart = (productId: number): void => {
  const cart = getCart();
  cart.items = cart.items.filter((item) => item.id !== productId);
  cart.total = calculateTotal(cart.items);
  saveCart(cart);
};

// Limpiar carrito
export const clearCart = (): void => {
  const emptyCart: ICart = { items: [], total: 0 };
  saveCart(emptyCart);
};

// Obtener cantidad de items en el carrito
export const getCartItemCount = (): number => {
  const cart = getCart();
  return cart.items.reduce((sum, item) => sum + item.cantidad, 0);
};

// Verificar si un producto está en el carrito
export const isInCart = (productId: number): boolean => {
  const cart = getCart();
  return cart.items.some((item) => item.id === productId);
};

// Obtener cantidad de un producto específico en el carrito
export const getProductQuantityInCart = (productId: number): number => {
  const cart = getCart();
  const item = cart.items.find((item) => item.id === productId);
  return item ? item.cantidad : 0;
};
