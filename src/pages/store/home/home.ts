import { getCategories, getProducts } from "../../../utils/api";
import {
  getStoredUser,
  isAdmin,
  logout,
  requireAuth,
} from "../../../utils/auth";

const loadCategories = async (): Promise<void> => {
  try {
    const categories = await getCategories();
    const grid = document.getElementById("categoriesGrid") as HTMLDivElement;

    if (!grid) return;

    grid.innerHTML = categories
      .map(
        (cat) => `
        <div class="grid-item">
          <img src="${cat.image}" alt="${cat.nombre}">
          <div class="grid-item-content">
            <h3>${cat.nombre}</h3>
            <p>${cat.descripcion}</p>
          </div>
        </div>
      `
      )
      .join("");
  } catch (error) {
    console.error("Error al cargar categorías:", error);
  }
};

const loadProducts = async (): Promise<void> => {
  try {
    const products = await getProducts();
    const grid = document.getElementById("productsGrid") as HTMLDivElement;

    if (!grid) return;

    grid.innerHTML = products
      .map(
        (prod) => `
        <div class="grid-item">
          <img src="${prod.imagen}" alt="${prod.nombre}">
          <div class="grid-item-content">
            <h3>${prod.nombre}</h3>
            <p>${prod.descripcion}</p>
            <div class="price">$${prod.precio}</div>
            <span class="badge ${
              prod.activo ? "badge-success" : "badge-danger"
            }">
              ${prod.activo ? "Disponible" : "No disponible"}
            </span>
          </div>
        </div>
      `
      )
      .join("");
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
};

const initPage = async (): Promise<void> => {
  const user = getStoredUser();
  const userNameEl = document.getElementById("userName") as HTMLElement;
  userNameEl.textContent = user?.name ?? "Invitado";
  console.log(isAdmin());
  if (isAdmin()) {
    const adminLink = document.getElementById("adminLink") as HTMLElement;
    adminLink.style.display = "block";
  }

  const logoutBtn = document.getElementById("logoutBtn") as HTMLButtonElement;
  logoutBtn.addEventListener("click", logout);

  await loadCategories();
  await loadProducts();
};

requireAuth(() => {
  initPage();
});
