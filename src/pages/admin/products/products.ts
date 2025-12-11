import type { CategoriaDto, ProductoDto } from "../../../types/IBackendDtos";
import {
  createProduct,
  deleteProduct,
  getCategories,
  getProducts,
  updateProduct,
} from "../../../utils/api";
import { getStoredUser, logout, requireAdmin } from "../../../utils/auth";

let currentEditId: number | null = null;
let categories: CategoriaDto[] = [];

const initPage = async (): Promise<void> => {
  const user = getStoredUser();
  (document.getElementById("userName") as HTMLElement).textContent = `${user!.nombre} ${user!.apellido}`;

  (document.getElementById("logoutBtn") as HTMLButtonElement).addEventListener(
    "click",
    logout
  );

  (document.getElementById("addBtn") as HTMLButtonElement).addEventListener(
    "click",
    () => openModal()
  );

  (document.getElementById("closeModal") as HTMLButtonElement).addEventListener(
    "click",
    closeModal
  );

  (document.getElementById("productForm") as HTMLFormElement).addEventListener(
    "submit",
    handleSubmit
  );

  (document.getElementById("modal") as HTMLElement).addEventListener(
    "click",
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.id === "modal") closeModal();
    }
  );

  categories = await getCategories();
  loadProducts();
};

const loadProducts = async (): Promise<void> => {
  try {
    const products: ProductoDto[] = await getProducts();
    const tbody = document.getElementById("productsTable") as HTMLElement;

    tbody.innerHTML = products
      .map((prod) => {
        return `
          <tr>
            <td>${prod.id}</td>
            <td>
              <img src="${prod.imagen}" alt="${prod.nombre}"
                   style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">
            </td>
            <td>${prod.nombre}</td>
            <td>${prod.descripcion ?? "-"}</td>
            <td>$${prod.precio.toFixed(2)}</td>
            <td>${prod.categoria ? prod.categoria.nombre : "N/A"}</td>
            <td>${prod.stock}</td>
            <td>
              <span class="badge ${
                prod.disponible ? "badge-success" : "badge-danger"
              }">
                ${prod.disponible ? "Disponible" : "No disponible"}
              </span>
            </td>
            <td>
              <button class="btn btn-secondary" data-id="${
                prod.id
              }" data-action="edit">Editar</button>
              <button class="btn btn-danger" data-id="${
                prod.id
              }" data-action="delete">Eliminar</button>
            </td>
          </tr>
        `;
      })
      .join("");

    // Asigno eventos a los botones después del render
    tbody.querySelectorAll("button").forEach((btn) => {
      const id = Number(btn.getAttribute("data-id"));
      const action = btn.getAttribute("data-action");
      if (action === "edit") btn.addEventListener("click", () => openModal(id));
      if (action === "delete")
        btn.addEventListener("click", () => removeProduct(id));
    });
  } catch (error) {
    console.error("Error:", error);
  }
};

const openModal = (id: number | null = null): void => {
  currentEditId = id;
  const modal = document.getElementById("modal") as HTMLDivElement;
  const form = document.getElementById("productForm") as HTMLFormElement;
  const categorySelect = document.getElementById(
    "categoryId"
  ) as HTMLSelectElement;
  const modalTitle = document.getElementById("modalTitle") as HTMLElement;

  form.reset();
  categorySelect.innerHTML = categories
    .map((cat) => `<option value="${cat.id}">${cat.nombre}</option>`)
    .join("");

  (document.getElementById("available") as HTMLInputElement).checked = true;

  if (id) {
    modalTitle.textContent = "Editar Producto";
    loadProductData(id);
  } else {
    modalTitle.textContent = "Nuevo Producto";
  }

  modal.classList.add("active");
};

const loadProductData = async (id: number): Promise<void> => {
  try {
    const products: ProductoDto[] = await getProducts();
    const product = products.find((p) => p.id === id);

    if (product) {
      (document.getElementById("productId") as HTMLInputElement).value = String(
        product.id
      );
      (document.getElementById("name") as HTMLInputElement).value =
        product.nombre;
      (document.getElementById("description") as HTMLInputElement).value =
        product.descripcion ?? "";
      (document.getElementById("price") as HTMLInputElement).value = String(
        product.precio
      );
      (document.getElementById("stock") as HTMLInputElement).value = String(
        product.stock
      );
      (document.getElementById("categoryId") as HTMLSelectElement).value =
        String(product.categoria.id);
      (document.getElementById("image") as HTMLInputElement).value =
        product.imagen ?? "";
      (document.getElementById("available") as HTMLInputElement).checked =
        product.disponible;
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

const closeModal = (): void => {
  (document.getElementById("modal") as HTMLElement).classList.remove("active");
  currentEditId = null;
};

const handleSubmit = async (e: SubmitEvent): Promise<void> => {
  e.preventDefault();

  const nombre = (
    document.getElementById("name") as HTMLInputElement
  ).value.trim();
  const descripcion = (
    document.getElementById("description") as HTMLInputElement
  ).value.trim();
  const precio = parseFloat(
    (document.getElementById("price") as HTMLInputElement).value
  );
  const categoriaId = Number(
    (document.getElementById("categoryId") as HTMLSelectElement).value
  );
  const stock = Number(
    (document.getElementById("stock") as HTMLInputElement).value
  );
  const imagen = (
    document.getElementById("image") as HTMLInputElement
  ).value.trim();
  const activo = (document.getElementById("available") as HTMLInputElement)
    .checked;

  if (!nombre || isNaN(precio) || !categoriaId) {
    alert("Faltan datos obligatorios.");
    return;
  }

  try {
    if (currentEditId) {
      await updateProduct(currentEditId, nombre, precio, descripcion, stock, imagen, activo, categoriaId);
      alert("Producto actualizado correctamente");
    } else {
      await createProduct(nombre, precio, descripcion, stock, imagen, categoriaId);
      alert("Producto creado correctamente");
    }

    closeModal();
    loadProducts();
  } catch (error) {
    console.error("Error:", error);
    alert("Error al guardar el producto");
  }
};

const removeProduct = async (id: number): Promise<void> => {
  if (!confirm("¿Estás seguro de eliminar este producto?")) return;

  try {
    await deleteProduct(id);
    alert("Producto eliminado correctamente");
    loadProducts();
  } catch (error) {
    console.error("Error:", error);
    alert("Error al eliminar el producto");
  }
};

requireAdmin(() => {
  initPage();
});
