import { getCategories, getProducts } from "../../../utils/api";
import { getStoredUser, logout, requireAdmin } from "../../../utils/auth";

const loadStats = async (): Promise<void> => {
  try {
    const [categories, products] = await Promise.all([
      getCategories(),
      getProducts(),
    ]);

    const available = products.filter((p) => p.activo).length;

    const statsEl = document.getElementById("stats");
    if (!statsEl) {
      console.error("No se encontró el elemento 'stats' en el DOM.");
      return;
    }

    statsEl.innerHTML = `
      <p><strong>Total categorías:</strong> ${categories.length}</p>
      <p><strong>Total productos:</strong> ${products.length}</p>
      <p><strong>Productos disponibles:</strong> ${available}</p>
    `;
  } catch (error) {
    console.error("Error al cargar las estadísticas:", error);
  }
};

const initPage = async (): Promise<void> => {
  const user = getStoredUser();
  const userNameEl = document.getElementById("userName");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!userNameEl || !logoutBtn) {
    console.error("No se encontró el elemento userName o logoutBtn en el DOM.");
    return;
  }

  userNameEl.textContent = user?.name ?? "Invitado";
  logoutBtn.addEventListener("click", logout);

  await loadStats();
};
requireAdmin(() => {
  initPage();
});
