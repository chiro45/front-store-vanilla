import type { ICart } from "../../../types/ICart";
import { createOrder } from "../../../utils/api";
import Swal from "sweetalert2";
import {
  getStoredUser,
  isAdmin,
  logout,
  requireAuth,
} from "../../../utils/auth";
import {
  getCart,
  updateQuantity,
  removeFromCart,
  clearCart as clearCartUtil,
  getCartItemCount,
} from "../../../utils/cart";

const SHIPPING_COST = 500;
let currentCart: ICart = { items: [], total: 0 };

const updateCartCount = (): void => {
  const count = getCartItemCount();
  const cartCountEl = document.getElementById("cartCount");
  if (cartCountEl) cartCountEl.textContent = count.toString();
};

const renderCart = (): void => {
  currentCart = getCart();
  const emptyCartEl = document.getElementById("emptyCart");
  const cartContentEl = document.getElementById("cartContent");
  const cartItemsEl = document.getElementById("cartItems");

  if (currentCart.items.length === 0) {
    if (emptyCartEl) emptyCartEl.style.display = "block";
    if (cartContentEl) cartContentEl.style.display = "none";
    return;
  }

  if (emptyCartEl) emptyCartEl.style.display = "none";
  if (cartContentEl) cartContentEl.style.display = "grid";

  if (cartItemsEl) {
    cartItemsEl.innerHTML = currentCart.items
      .map(
        (item) => `
        <div class="cart-item">
          <img src="${item.imagen || "https://via.placeholder.com/80"}" 
               alt="${item.nombre}">
          <div class="cart-item-info">
            <h3>${item.nombre}</h3>
            <p>${item.descripcion || ""}</p>
            <div class="price">$${item.precio.toFixed(2)} c/u</div>
          </div>
          <div class="cart-item-actions">
            <div class="quantity-control">
              <button data-id="${item.id}" data-action="decrease">-</button>
              <span>${item.cantidad}</span>
              <button data-id="${item.id}" data-action="increase">+</button>
            </div>
            <div class="price">$${(item.precio * item.cantidad).toFixed(
              2
            )}</div>
            <button class="btn btn-danger" data-id="${item.id}" 
                    data-action="remove" style="padding: 0.5rem 1rem;">
              🗑️
            </button>
          </div>
        </div>
      `
      )
      .join("");

    // Agregar event listeners a los botones
    cartItemsEl.querySelectorAll("button").forEach((btn) => {
      const id = Number(btn.getAttribute("data-id"));
      const action = btn.getAttribute("data-action");

      if (action === "increase") {
        btn.addEventListener("click", () => handleQuantityChange(id, 1));
      } else if (action === "decrease") {
        btn.addEventListener("click", () => handleQuantityChange(id, -1));
      } else if (action === "remove") {
        btn.addEventListener("click", () => handleRemoveItem(id));
      }
    });
  }

  updateSummary();
  updateCartCount();
};

const handleQuantityChange = (productId: number, delta: number): void => {
  const item = currentCart.items.find((i) => i.id === productId);
  if (!item) return;

  const newQuantity = item.cantidad + delta;

  if (newQuantity > 0 && newQuantity <= item.stock) {
    updateQuantity(productId, newQuantity);
    renderCart();
  } else if (newQuantity <= 0) {
    handleRemoveItem(productId);
  } else {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "warning",
      title: `Stock máximo disponible: ${item.stock}`,
      showConfirmButton: false,
      timer: 2500,
    });
  }
};

const handleRemoveItem = (productId: number): void => {
  removeFromCart(productId);
  renderCart();
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "info",
    title: "Producto eliminado",
    showConfirmButton: false,
    timer: 2000,
  });
};

const updateSummary = (): void => {
  const subtotalEl = document.getElementById("subtotal");
  const shippingEl = document.getElementById("shipping");
  const totalEl = document.getElementById("total");
  const modalTotalEl = document.getElementById("modalTotal");

  const subtotal = currentCart.total;
  const shipping = currentCart.items.length > 0 ? SHIPPING_COST : 0;
  const total = subtotal + shipping;

  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (shippingEl) shippingEl.textContent = `$${shipping.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
  if (modalTotalEl) modalTotalEl.textContent = `$${total.toFixed(2)}`;
};

const handleClearCart = (): void => {
  clearCartUtil();
  renderCart();
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "info",
    title: "Carrito vaciado",
    showConfirmButton: false,
    timer: 2000,
  });
};

const openCheckoutModal = (): void => {
  const modal = document.getElementById("checkoutModal");
  if (modal) modal.classList.add("active");
};

const closeCheckoutModal = (): void => {
  const modal = document.getElementById("checkoutModal");
  if (modal) modal.classList.remove("active");
};

const handleCheckout = async (e: Event): Promise<void> => {
  e.preventDefault();

  const user = getStoredUser();
  if (!user) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "info",
      title: "Debes iniciar sesión para realizar un pedido",
      showConfirmButton: false,
      timer: 2500,
    });
    return;
  }

  const paymentMethod = (
    document.getElementById("paymentMethod") as HTMLSelectElement
  ).value as "cash" | "card" | "transfer";

  if (!paymentMethod) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "warning",
      title: "Por favor completa todos los campos requeridos",
      showConfirmButton: false,
      timer: 2500,
    });
    return;
  }

  try {
    await createOrder(
      paymentMethod,
      currentCart.items.map((item) => ({
        cantidad: item.cantidad,
        idProducto: item.id!,
      }))
    );
    clearCartUtil();
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "¡Pedido realizado con éxito! Recibirás una confirmación pronto.",
      showConfirmButton: false,
      timer: 2500,
    });
    closeCheckoutModal();

    // Redirigir a la página de inicio después de un momento
    setTimeout(() => {
      window.location.href = "/src/pages/store/home/home.html";
    }, 1500);
  } catch (error) {
    console.error("Error al crear pedido:", error);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "error",
      title:
        "Hubo un error al procesar tu pedido. Por favor intenta nuevamente.",
      showConfirmButton: false,
      timer: 3000,
    });
  }
};

const initPage = (): void => {
  const user = getStoredUser();
  const userNameEl = document.getElementById("userName");
  const logoutBtn = document.getElementById("logoutBtn");
  const clearCartBtn = document.getElementById("clearCartBtn");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const closeModalBtn = document.getElementById("closeModal");
  const checkoutForm = document.getElementById("checkoutForm");
  const modal = document.getElementById("checkoutModal");

  if (user && userNameEl)
    userNameEl.textContent = `${user.nombre} ${user.apellido}`;

  if (isAdmin()) {
    const adminLink = document.getElementById("adminLink");
    if (adminLink) adminLink.style.display = "block";
  }

  if (logoutBtn) logoutBtn.addEventListener("click", logout);
  if (clearCartBtn) clearCartBtn.addEventListener("click", handleClearCart);
  if (checkoutBtn) checkoutBtn.addEventListener("click", openCheckoutModal);
  if (closeModalBtn)
    closeModalBtn.addEventListener("click", closeCheckoutModal);
  if (checkoutForm) checkoutForm.addEventListener("submit", handleCheckout);

  if (modal) {
    modal.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).id === "checkoutModal") {
        closeCheckoutModal();
      }
    });
  }

  renderCart();
};

requireAuth(() => {
  initPage();
});
