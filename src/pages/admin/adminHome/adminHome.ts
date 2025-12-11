import { getCategories, getOrders, getProducts } from "../../../utils/api";
import { getStoredUser, logout, requireAdmin } from "../../../utils/auth";

const loadStats = async (): Promise<void> => {
  try {
    const [categories, products, orders] = await Promise.all([
      getCategories(),
      getProducts(),
      getOrders(),
    ]);

    // Contadores básicos
    const available = products.filter((p) => p.disponible).length;
    const pending = orders.filter((o) => o.estado === "PENDIENTE").length;
    const processing = orders.filter((o) => o.estado === "CONFIRMADO" || o.estado === "EN_PREPARACION").length;
    const completed = orders.filter((o) => o.estado === "TERMINADO").length;

    // Actualizar contadores en las cards
    const categoriesCountEl = document.getElementById("categoriesCount");
    const productsCountEl = document.getElementById("productsCount");
    const ordersCountEl = document.getElementById("ordersCount");
    const availableCountEl = document.getElementById("availableCount");

    if (categoriesCountEl) categoriesCountEl.textContent = categories.length.toString();
    if (productsCountEl) productsCountEl.textContent = products.length.toString();
    if (ordersCountEl) ordersCountEl.textContent = orders.length.toString();
    if (availableCountEl) availableCountEl.textContent = available.toString();

    // Estadísticas detalladas
    const quickStatsEl = document.getElementById("quickStats");
    if (quickStatsEl) {
      const totalRevenue = orders
        .filter((o) => o.estado !== "CANCELADO")
        .reduce((sum, order) => sum + order.total, 0);

      const lowStock = products.filter((p) => p.stock < 10 && p.stock > 0);
      const outOfStock = products.filter((p) => p.stock === 0);

      quickStatsEl.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
          <div style="padding: 1.5rem; background: var(--light); border-radius: 10px; border-left: 4px solid var(--success);">
            <div style="font-size: 0.9rem; color: #636e72; margin-bottom: 0.5rem;">💰 Ingresos Totales</div>
            <div style="font-size: 1.8rem; font-weight: bold; color: var(--success);">$${totalRevenue.toFixed(2)}</div>
          </div>
          <div style="padding: 1.5rem; background: var(--light); border-radius: 10px; border-left: 4px solid #ffeaa7;">
            <div style="font-size: 0.9rem; color: #636e72; margin-bottom: 0.5rem;">⏳ Pedidos Pendientes</div>
            <div style="font-size: 1.8rem; font-weight: bold; color: #fdcb6e;">${pending}</div>
          </div>
          <div style="padding: 1.5rem; background: var(--light); border-radius: 10px; border-left: 4px solid #74b9ff;">
            <div style="font-size: 0.9rem; color: #636e72; margin-bottom: 0.5rem;">👨‍🍳 En Preparación</div>
            <div style="font-size: 1.8rem; font-weight: bold; color: #0984e3;">${processing}</div>
          </div>
          <div style="padding: 1.5rem; background: var(--light); border-radius: 10px; border-left: 4px solid #55efc4;">
            <div style="font-size: 0.9rem; color: #636e72; margin-bottom: 0.5rem;">✅ Completados</div>
            <div style="font-size: 1.8rem; font-weight: bold; color: #00b894;">${completed}</div>
          </div>
        </div>

        <div style="background: var(--light); padding: 1.5rem; border-radius: 10px; margin-bottom: 1rem;">
          <h3 style="margin-bottom: 1rem; color: var(--dark);">📦 Estado del Inventario</h3>
          <div style="display: grid; gap: 0.8rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.8rem; background: white; border-radius: 8px;">
              <span>Total de productos:</span>
              <strong style="color: var(--primary);">${products.length}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.8rem; background: white; border-radius: 8px;">
              <span>Productos disponibles:</span>
              <strong style="color: var(--success);">${available}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.8rem; background: white; border-radius: 8px;">
              <span>⚠️ Stock bajo (< 10):</span>
              <strong style="color: #fdcb6e;">${lowStock.length}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.8rem; background: white; border-radius: 8px;">
              <span>❌ Sin stock:</span>
              <strong style="color: var(--danger);">${outOfStock.length}</strong>
            </div>
          </div>
        </div>

        ${
          lowStock.length > 0
            ? `
          <div style="background: #ffeaa7; padding: 1rem; border-radius: 8px; border-left: 4px solid #fdcb6e; margin-top: 1rem;">
            <h4 style="margin-bottom: 0.5rem; color: #2d3436;">⚠️ Productos con stock bajo:</h4>
            <div style="display: grid; gap: 0.5rem;">
              ${lowStock
                .slice(0, 5)
                .map(
                  (p) => `
                <div style="font-size: 0.9rem; color: #2d3436;">
                  • ${p.nombre} - Stock: ${p.stock}
                </div>
              `
                )
                .join("")}
              ${lowStock.length > 5 ? `<div style="font-size: 0.9rem; color: #636e72; font-style: italic;">+${lowStock.length - 5} más...</div>` : ""}
            </div>
          </div>
        `
            : ""
        }

        ${
          outOfStock.length > 0
            ? `
          <div style="background: #fab1a0; padding: 1rem; border-radius: 8px; border-left: 4px solid #d63031; margin-top: 1rem;">
            <h4 style="margin-bottom: 0.5rem; color: #2d3436;">❌ Productos sin stock:</h4>
            <div style="display: grid; gap: 0.5rem;">
              ${outOfStock
                .slice(0, 5)
                .map(
                  (p) => `
                <div style="font-size: 0.9rem; color: #2d3436;">
                  • ${p.nombre}
                </div>
              `
                )
                .join("")}
              ${outOfStock.length > 5 ? `<div style="font-size: 0.9rem; color: #636e72; font-style: italic;">+${outOfStock.length - 5} más...</div>` : ""}
            </div>
          </div>
        `
            : ""
        }
      `;
    }
  } catch (error) {
    console.error("Error al cargar las estadísticas:", error);
    const quickStatsEl = document.getElementById("quickStats");
    if (quickStatsEl) {
      quickStatsEl.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: var(--danger);">
          <p>Error al cargar las estadísticas. Verifica que el servidor esté corriendo.</p>
        </div>
      `;
    }
  }
};

const initPage = async (): Promise<void> => {
  const user = getStoredUser();
  const userNameEl = document.getElementById("userName");
  const logoutBtn = document.getElementById("logoutBtn");

  if (user && userNameEl) {
    userNameEl.textContent = `${user.nombre} ${user.apellido}`;
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  await loadStats();
};

requireAdmin(() => {
  initPage();
});
