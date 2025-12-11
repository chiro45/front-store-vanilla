import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../../../utils/api";
import { getStoredUser, requireAdmin, logout } from "../../../utils/auth";
import Swal from "sweetalert2";

let currentEditId: number | null = null;

const loadCategories = async (): Promise<void> => {
  try {
    const categories = await getCategories();
    const tbody = document.getElementById(
      "categoriesTable"
    ) as HTMLTableElement;

    tbody.innerHTML = categories
      .map(
        (cat: any) => `
          <tr>
            <td>${cat.id}</td>
            <td>${cat.nombre}</td>
            <td>${
              cat.descripcion.length > 20
                ? `${cat.descripcion.slice(0, 20)}...`
                : cat.descripcion || "-"
            }</td>
            <td>
              <button class="btn btn-secondary" data-id="${
                cat.id
              }" data-action="edit">Editar</button>
              <button class="btn btn-danger" data-id="${
                cat.id
              }" data-action="delete">Eliminar</button>
            </td>
          </tr>
        `
      )
      .join("");

    // Agrego eventos de los botones una vez renderizado
    tbody.querySelectorAll("button").forEach((btn) => {
      const id = Number(btn.getAttribute("data-id"));
      const action = btn.getAttribute("data-action");
      if (action === "edit") btn.addEventListener("click", () => openModal(id));
      if (action === "delete")
        btn.addEventListener("click", () => removeCategory(id));
    });
  } catch (error) {
    console.error("Error:", error);
  }
};

const openModal = (id: number | null = null): void => {
  currentEditId = id;
  const modal = document.getElementById("modal") as HTMLDivElement;
  const form = document.getElementById("categoryForm") as HTMLFormElement;
  const modalTitle = document.getElementById("modalTitle") as HTMLElement;

  form.reset();

  if (id) {
    modalTitle.textContent = "Editar Categoría";
    loadCategoryData(id);
  } else {
    modalTitle.textContent = "Nueva Categoría";
  }

  modal.classList.add("active");
};

const loadCategoryData = async (id: number): Promise<void> => {
  try {
    const categories = await getCategories();
    const category = categories.find((c: any) => c.id === id);

    if (category) {
      (document.getElementById("categoryId") as HTMLInputElement).value =
        String(category.id);
      (document.getElementById("name") as HTMLInputElement).value =
        category.nombre;
      (document.getElementById("description") as HTMLInputElement).value =
        category.descripcion || "";
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

const closeModal = (): void => {
  const modal = document.getElementById("modal") as HTMLDivElement;
  modal.classList.remove("active");
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

  if (!nombre) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "warning",
      title: "El nombre es obligatorio",
      showConfirmButton: false,
      timer: 2500,
    });
    return;
  }

  try {
    if (currentEditId) {
      await updateCategory(currentEditId, nombre, descripcion);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Categoría actualizada",
        showConfirmButton: false,
        timer: 2000,
      });
    } else {
      await createCategory(nombre, descripcion);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Categoría creada",
        showConfirmButton: false,
        timer: 2000,
      });
    }

    closeModal();
    loadCategories();
  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "error",
      title: "Error al guardar la categoría",
      showConfirmButton: false,
      timer: 3000,
    });
  }
};

const removeCategory = async (id: number): Promise<void> => {
  try {
    await deleteCategory(id);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Categoría eliminada correctamente",
      showConfirmButton: false,
      timer: 2000,
    });
    loadCategories();
  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "error",
      title: "Error al eliminar la categoría",
      showConfirmButton: false,
      timer: 3000,
    });
  }
};
const initPage = (): void => {
  const user = getStoredUser();
  (document.getElementById("userName") as HTMLLIElement).textContent = `${
    user!.nombre
  } ${user!.apellido}`;

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

  (document.getElementById("categoryForm") as HTMLFormElement).addEventListener(
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

  loadCategories();
};

requireAdmin(() => {
  initPage();
});
