import type { IProduct } from "../../../types/IProduct";
import { getProductById } from "../../../utils/api";
import {
  getStoredUser,
  isAdmin,
  logout,
  requireAuth,
} from "../../../utils/auth";
import { addToCart, getCartItemCount } from "../../../utils/cart";

let currentProduct: IProduct | null = null;

const updateCartCount = (): void => {
  const count = getCartItemCount();
  const cartCountEl = document.getElementById("cartCount");
  if (cartCountEl) cartCountEl.textContent = count.toString();
};

const getProductIdFromUrl = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
};

const loadProduct = async (): Promise<void> => {
  const productId = getProductIdFromUrl();

  if (!productId) {
    showError();
    return;
  }

  try {
    const product = await getProductById(productId);

    if (!product) {
      showError();
      return;
    }

    currentProduct = product;
    renderProduct(product);
  } catch (error) {
    console.error("Error al cargar producto:", error);
    showError();
  }
};

const renderProduct = (product: IProduct): void => {
  const loadingEl = document.getElementById("loadingProduct");
  const contentEl = document.getElementById("productContent");
  const imageEl = document.getElementById("productImage") as HTMLImageElement;
  const nameEl = document.getElementById("productName");
  const priceEl = document.getElementById("productPrice");
  const statusEl = document.getElementById("productStatus");
  const descriptionEl = document.getElementById("productDescription");
  const addToCartBtn = document.getElementById("addToCartBtn");

  if (loadingEl) loadingEl.style.display = "none";
  if (contentEl) contentEl.style.display = "block";

  if (imageEl) {
    imageEl.src = product.imagen || "https://via.placeholder.com/500";
    imageEl.alt = product.nombre;
  }

  if (nameEl) nameEl.textContent = product.nombre;
  if (priceEl) priceEl.textContent = `$${product.precio.toFixed(2)}`;
  if (descriptionEl) {
    descriptionEl.textContent =
      product.descripcion || "Sin descripción disponible.";
  }

  if (statusEl) {
    if (product.activo && product.stock > 0) {
      statusEl.textContent = `Disponible (Stock: ${product.stock})`;
      statusEl.className = "badge badge-success";
    } else if (!product.activo) {
      statusEl.textContent = "No disponible";
      statusEl.className = "badge badge-danger";
    } else {
      statusEl.textContent = "Sin stock";
      statusEl.className = "badge badge-danger";
    }
  }

  // Deshabilitar botón si no está disponible
  if (addToCartBtn) {
    if (!product.activo || product.stock <= 0) {
      (addToCartBtn as HTMLButtonElement).disabled = true;
      addToCartBtn.textContent = "No disponible";
      addToCartBtn.style.opacity = "0.5";
      addToCartBtn.style.cursor = "not-allowed";
    }
  }
};

const showError = (): void => {
  const loadingEl = document.getElementById("loadingProduct");
  const contentEl = document.getElementById("productContent");
  const errorEl = document.getElementById("errorProduct");

  if (loadingEl) loadingEl.style.display = "none";
  if (contentEl) contentEl.style.display = "none";
  if (errorEl) errorEl.style.display = "block";
};

const handleQuantityChange = (delta: number): void => {
  const quantityInput = document.getElementById("quantity") as HTMLInputElement;
  if (!quantityInput || !currentProduct) return;

  let currentQuantity = parseInt(quantityInput.value);
  const newQuantity = currentQuantity + delta;

  if (newQuantity >= 1 && newQuantity <= currentProduct.stock) {
    quantityInput.value = newQuantity.toString();
  }
};

const handleAddToCart = (): void => {
  if (!currentProduct) return;

  const quantityInput = document.getElementById("quantity") as HTMLInputElement;
  const quantity = parseInt(quantityInput.value);

  addToCart(currentProduct, quantity);
  updateCartCount();

  // Mostrar mensaje de éxito
  const successMsg = document.getElementById("successMessage");
  if (successMsg) {
    successMsg.style.display = "block";
    setTimeout(() => {
      successMsg.style.display = "none";
    }, 3000);
  }

  // Resetear cantidad a 1
  quantityInput.value = "1";
};

const initPage = async (): Promise<void> => {
  const user = getStoredUser();
  const userNameEl = document.getElementById("userName");
  const logoutBtn = document.getElementById("logoutBtn");
  const backBtn = document.getElementById("backBtn");
  const increaseBtn = document.getElementById("increaseBtn");
  const decreaseBtn = document.getElementById("decreaseBtn");
  const addToCartBtn = document.getElementById("addToCartBtn");

  if (user && userNameEl) userNameEl.textContent = user.name;

  if (isAdmin()) {
    const adminLink = document.getElementById("adminLink");
    if (adminLink) adminLink.style.display = "block";
  }

  if (logoutBtn) logoutBtn.addEventListener("click", logout);
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.history.back();
    });
  }

  if (increaseBtn)
    increaseBtn.addEventListener("click", () => handleQuantityChange(1));
  if (decreaseBtn)
    decreaseBtn.addEventListener("click", () => handleQuantityChange(-1));
  if (addToCartBtn) addToCartBtn.addEventListener("click", handleAddToCart);

  updateCartCount();
  await loadProduct();
};

requireAuth(() => {
  initPage();
});
