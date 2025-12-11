import type { CategoriaDto, ProductoDto } from "../../../types/IBackendDtos";
import { getCategories, getProducts } from "../../../utils/api";
import {
  getStoredUser,
  isAdmin,
  logout,
  requireAuth,
} from "../../../utils/auth";
import { getCartItemCount } from "../../../utils/cart";

let allProducts: ProductoDto[] = [];
let allCategories: CategoriaDto[] = [];
let filteredProducts: ProductoDto[] = [];
let currentCategory: number | null = null;
let searchQuery: string = "";
let sortBy: string = "";
let availabilityFilter: string = "all";

const updateCartCount = (): void => {
  const count = getCartItemCount();
  const cartCountEl = document.getElementById("cartCount");
  if (cartCountEl) cartCountEl.textContent = count.toString();
};

const loadCategories = async (): Promise<void> => {
  try {
    allCategories = await getCategories();
    renderCategoryMenu();
  } catch (error) {
    console.error("Error al cargar categorías:", error);
  }
};

const renderCategoryMenu = (): void => {
  const menuEl = document.getElementById("categoryMenu");
  if (!menuEl) return;

  const categoriesHTML = allCategories
    .map(
      (cat) => `
      <li>
        <a href="#" data-category="${cat.id}" class="category-link">
          <span class="icon">-</span>
          <span>${cat.nombre}</span>
        </a>
      </li>
    `
    )
    .join("");

  // Mantener el "Todos los productos" al inicio
  const allLink = menuEl.querySelector('[data-category="all"]')?.parentElement;
  menuEl.innerHTML = "";
  if (allLink) menuEl.appendChild(allLink);
  menuEl.insertAdjacentHTML("beforeend", categoriesHTML);

  // Agregar event listeners
  menuEl.querySelectorAll(".category-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const category = (e.currentTarget as HTMLElement).getAttribute(
        "data-category"
      );
      handleCategoryChange(category);
    });
  });
};

const handleCategoryChange = (categoryId: string | null): void => {
  // Actualizar clase active
  document.querySelectorAll(".category-link").forEach((link) => {
    link.classList.remove("active");
  });

  const activeLink = document.querySelector(`[data-category="${categoryId}"]`);
  if (activeLink) activeLink.classList.add("active");

  // Actualizar filtro
  if (categoryId === "all") {
    currentCategory = null;
  } else {
    currentCategory = Number(categoryId);
  }

  // Actualizar título
  const titleEl = document.getElementById("sectionTitle");
  if (titleEl) {
    if (currentCategory === null) {
      titleEl.textContent = "Todos los Productos";
    } else {
      const category = allCategories.find((c) => c.id === currentCategory);
      titleEl.textContent = category ? category.nombre : "Productos";
    }
  }

  filterAndRenderProducts();
};

const loadProducts = async (): Promise<void> => {
  try {
    allProducts = await getProducts();
    filterAndRenderProducts();
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
};

const filterAndRenderProducts = (): void => {
  filteredProducts = allProducts.filter((product) => {
    // Filtro por categoría
    if (currentCategory !== null && product.categoria.id !== currentCategory) {
      return false;
    }

    // Filtro por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = product.nombre.toLowerCase().includes(query);
      const matchDesc = product.descripcion?.toLowerCase().includes(query);
      if (!matchName && !matchDesc) return false;
    }

    // Filtro por disponibilidad
    if (availabilityFilter === "available" && !product.disponible) {
      return false;
    }
    if (availabilityFilter === "unavailable" && product.disponible) {
      return false;
    }

    return true;
  });

  // Ordenar productos
  if (sortBy) {
    filteredProducts.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.nombre.localeCompare(b.nombre);
        case "name-desc":
          return b.nombre.localeCompare(a.nombre);
        case "price-asc":
          return a.precio - b.precio;
        case "price-desc":
          return b.precio - a.precio;
        default:
          return 0;
      }
    });
  }

  renderProducts();
};

const renderProducts = (): void => {
  const grid = document.getElementById("productsGrid");
  const noProducts = document.getElementById("noProducts");
  const productCount = document.getElementById("productCount");

  if (!grid || !noProducts || !productCount) return;

  if (filteredProducts.length === 0) {
    grid.style.display = "none";
    noProducts.style.display = "block";
    productCount.textContent = "0 productos";
    return;
  }

  grid.style.display = "grid";
  noProducts.style.display = "none";
  productCount.textContent = `${filteredProducts.length} producto${
    filteredProducts.length !== 1 ? "s" : ""
  }`;

  grid.innerHTML = filteredProducts
    .map((prod) => {
      return `
        <div class="grid-item clickable"
             onclick="window.location.href='/src/pages/store/productDetail/productDetail.html?id=${
               prod.id
             }'"
             style="cursor: pointer;">
          <img src="${prod.imagen || "https://via.placeholder.com/400"}"
               alt="${prod.nombre}">
          <div class="grid-item-content">
            <span class="badge" style="background: var(--light); color: var(--dark); margin-bottom: 0.5rem;">
              ${prod.categoria ? prod.categoria.nombre : "Sin categoría"}
            </span>
            <h3>${prod.nombre}</h3>
            <p>${prod.descripcion || "Sin descripción"}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
              <div class="price">${prod.precio.toFixed(2)}</div>
              <span class="badge ${
                prod.disponible ? "badge-success" : "badge-danger"
              }">
                ${prod.disponible ? "Disponible" : "No disponible"}
              </span>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
};

const handleSearch = (query: string): void => {
  searchQuery = query;
  filterAndRenderProducts();
};

const handleSort = (sort: string): void => {
  sortBy = sort;
  filterAndRenderProducts();
};

const handleAvailabilityFilter = (filter: string): void => {
  availabilityFilter = filter;
  filterAndRenderProducts();
};

const toggleSidebar = (): void => {
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");

  if (sidebar && mainContent) {
    sidebar.classList.toggle("active");
    if (window.innerWidth > 1024) {
      mainContent.classList.toggle("full-width");
      sidebar.classList.toggle("hidden");
    }
  }
};

const initPage = async (): Promise<void> => {
  const user = getStoredUser();
  const userNameEl = document.getElementById("userName");
  const logoutBtn = document.getElementById("logoutBtn");
  const searchInput = document.getElementById(
    "searchInput"
  ) as HTMLInputElement;
  const sortSelect = document.getElementById("sortSelect") as HTMLSelectElement;
  const availabilitySelect = document.getElementById(
    "availabilityFilter"
  ) as HTMLSelectElement;
  const sidebarToggle = document.getElementById("sidebarToggle");

  if (user && userNameEl) {
    userNameEl.textContent = `${user.nombre} ${user.apellido}`;
  }

  if (isAdmin()) {
    const adminLink = document.getElementById("adminLink");
    if (adminLink) adminLink.style.display = "block";
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      handleSearch((e.target as HTMLInputElement).value);
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      handleSort((e.target as HTMLSelectElement).value);
    });
  }

  if (availabilitySelect) {
    availabilitySelect.addEventListener("change", (e) => {
      handleAvailabilityFilter((e.target as HTMLSelectElement).value);
    });
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", toggleSidebar);
  }

  updateCartCount();
  await loadCategories();
  await loadProducts();
};

requireAuth(() => {
  initPage();
});
