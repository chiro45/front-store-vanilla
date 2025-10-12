import { getCategories, getProducts } from "../../../utils/api";
import {
  getStoredUser,
  isAdmin,
  logout,
  requireAuth,
} from "../../../utils/auth";

let allProducts: any[] = [];
let activeCategoryId: number | null = null;

const loadCategories = async (): Promise<void> => {
  try {
    const categories = await getCategories();
    const grid = document.getElementById("categoriesGrid") as HTMLDivElement;
    if (!grid) return;

    grid.innerHTML = categories
      .map(
        (cat) => `
        <div class="category-item" data-id="${cat.id}">
          <h4>${cat.nombre}</h4>
        </div>
      `
      )
      .join("");

    document.querySelectorAll(".category-item").forEach((item) => {
      item.addEventListener("click", () => {
        const id = Number(item.getAttribute("data-id"));
        setActiveCategory(id);
      });
    });
  } catch (error) {
    console.error("Error al cargar categorías:", error);
  }
};

const loadProducts = async (): Promise<void> => {
  try {
    allProducts = await getProducts();
    renderProducts(allProducts);
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
};

const renderProducts = (products: any[]): void => {
  const grid = document.getElementById("productsGrid") as HTMLDivElement;
  if (!grid) return;

  if (products.length === 0) {
    grid.innerHTML = `<p>No hay productos disponibles para esta categoría.</p>`;
    return;
  }

  grid.innerHTML = products
    .map(
      (prod) => `
      <div class="grid-item product-item" data-id="${prod.id}">
        <img src="${prod.imagen}" alt="${prod.nombre}">
        <div class="grid-item-content">
          <h3>${prod.nombre}</h3>
          <p>${prod.descripcion}</p>
          <div class="price">$${prod.precio}</div>
          <span class="badge ${prod.activo ? "badge-success" : "badge-danger"}">
            ${prod.activo ? "Disponible" : "No disponible"}
          </span>
        </div>
      </div>
    `
    )
    .join("");

  // Agregar click a cada producto para ir al detalle
  document.querySelectorAll(".product-item").forEach((item) => {
    item.addEventListener("click", () => {
      const id = item.getAttribute("data-id");
      if (id) {
        window.location.href = `/src/pages/store/productDetail/productDetail.html?id=${id}`;
      }
    });
  });
};

const setActiveCategory = (id: number): void => {
  activeCategoryId = id;

  // Quitar "active" de todas las categorías
  document.querySelectorAll(".category-item").forEach((item) => {
    item.classList.remove("active");
  });

  // Resaltar la seleccionada
  const selected = document.querySelector(`[data-id="${id}"]`);
  selected?.classList.add("active");

  // Filtrar productos
  const filtered = allProducts.filter((p) => p.categoriaId === id);
  renderProducts(filtered);
};

const initPage = async (): Promise<void> => {
  const user = getStoredUser();
  const userNameEl = document.getElementById("userName") as HTMLElement;
  userNameEl.textContent = user?.name ?? "Invitado";

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
