import type { PedidoDto, EstadoPedido } from "../../../types/IBackendDtos";
import { getOrders } from "../../../utils/api";
import {
  getStoredUser,
  isAdmin,
  logout,
  requireAuth,
} from "../../../utils/auth";
import { getCartItemCount } from "../../../utils/cart";

let myOrders: PedidoDto[] = [];
let filteredOrders: PedidoDto[] = [];

const updateCartCount = (): void => {
  const count = getCartItemCount();
  const cartCountEl = document.getElementById("cartCount");
  if (cartCountEl) cartCountEl.textContent = count.toString();
};

const loadMyOrders = async (): Promise<void> => {
  try {
    const user = getStoredUser();
    if (!user || !user.id) return;

    const allOrders = await getOrders();

    // Filtrar solo los pedidos del usuario actual (por ID de usuario)
    myOrders = allOrders.filter((order) => order.idUsuario === user.id || order.usuarioDto?.id === user.id);
    myOrders.sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha));

    filteredOrders = [...myOrders];
    renderOrders();
  } catch (error) {
    console.error("Error al cargar pedidos:", error);
    const container = document.getElementById("ordersContainer");
    if (container) {
      container.innerHTML =
        '<p class="text-center" style="color: var(--danger);">Error al cargar tus pedidos</p>';
    }
  }
};

const filterOrders = (): void => {
  const filter = (document.getElementById("statusFilter") as HTMLSelectElement)
    ?.value;
  if (!filter) return;

  filteredOrders =
    filter === "all"
      ? [...myOrders]
      : myOrders.filter((o) => o.estado === filter);

  renderOrders();
};

const renderOrders = (): void => {
  const container = document.getElementById("ordersContainer");
  const emptyOrders = document.getElementById("emptyOrders");

  if (!container || !emptyOrders) return;

  if (filteredOrders.length === 0) {
    container.style.display = "none";
    emptyOrders.style.display = "block";
    return;
  }

  container.style.display = "block";
  emptyOrders.style.display = "none";

  container.innerHTML = filteredOrders
    .map((order) => {
      const date = new Date(order.fecha);
      const formattedDate = date.toLocaleDateString("es-AR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      return `
        <div class="card order-card clickable" onclick="window.viewOrder(${
          order.id
        })" style="cursor: pointer;">
          <div class="order-header">
            <div>
              <h3>Pedido #${order.id}</h3>
              <p style="color: #636e72; font-size: 0.95rem; margin-top: 0.5rem;">
                📅 ${formattedDate}
              </p>
            </div>
            <span class="status-badge status-${order.estado.toLowerCase()}">
              ${getStatusText(order.estado)}
            </span>
          </div>

          <div style="margin: 1rem 0; padding-top: 1rem; border-top: 1px solid var(--gray);">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.5rem;">
              ${order.detalles
                .slice(0, 3)
                .map(
                  (detalle) => `
                <div style="font-size: 0.9rem; color: #636e72;">
                  • ${detalle.producto.nombre} (x${detalle.cantidad})
                </div>
              `
                )
                .join("")}
              ${
                order.detalles.length > 3
                  ? `
                <div style="font-size: 0.9rem; color: var(--primary); font-weight: 600;">
                  +${order.detalles.length - 3} más
                </div>
              `
                  : ""
              }
            </div>
          </div>

          <div class="order-summary">
            <div>
              <span style="color: #636e72;">📦 ${
                order.detalles.length
              } producto(s)</span>
            </div>
            <div class="price">$${order.total.toFixed(2)}</div>
          </div>
        </div>
      `;
    })
    .join("");
};

const getStatusText = (status: EstadoPedido): string => {
  const map: Record<EstadoPedido, string> = {
    PENDIENTE: "Pendiente",
    CONFIRMADO: "Confirmado",
    EN_PREPARACION: "En Preparación",
    ENVIADO: "Enviado",
    ENTREGADO: "Entregado",
    TERMINADO: "Completado",
    CANCELADO: "Cancelado",
  };
  return map[status] ?? status;
};

const getStatusIcon = (status: EstadoPedido): string => {
  const map: Record<EstadoPedido, string> = {
    PENDIENTE: "⏳",
    CONFIRMADO: "✅",
    EN_PREPARACION: "👨‍🍳",
    ENVIADO: "🚚",
    ENTREGADO: "📦",
    TERMINADO: "🎉",
    CANCELADO: "❌",
  };
  return map[status] ?? "📦";
};

(window as any).viewOrder = (orderId: number): void => {
  const order = myOrders.find((o) => o.id === orderId);
  if (!order) return;

  const orderIdEl = document.getElementById("orderId");
  const orderDetailEl = document.getElementById("orderDetail");
  const modal = document.getElementById("orderModal");

  if (!orderDetailEl || !modal || !orderIdEl) return;

  orderIdEl.textContent = String(orderId);

  const date = new Date(order.fecha);
  const formattedDate = date.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const userPhone = order.usuarioDto?.celular || "N/A";

  orderDetailEl.innerHTML = `
    <div style="text-align: center; padding: 1.5rem; background: var(--light); border-radius: 10px; margin-bottom: 1.5rem;">
      <div style="font-size: 3rem; margin-bottom: 0.5rem;">
        ${getStatusIcon(order.estado)}
      </div>
      <span class="status-badge status-${order.estado.toLowerCase()}" style="font-size: 1rem; padding: 0.7rem 1.5rem;">
        ${getStatusText(order.estado)}
      </span>
      <p style="margin-top: 1rem; color: #636e72; font-size: 0.95rem;">📅 ${formattedDate}</p>
    </div>

    <div class="order-info">
      <h3 style="margin-bottom: 1rem; color: var(--dark);">📍 Información de Entrega</h3>
      <p><strong>Teléfono:</strong> ${userPhone}</p>
      <p><strong>Método de pago:</strong> ${getPaymentMethodText(
        order.formaPago
      )}</p>
    </div>

    <div class="order-items">
      <h3 style="margin-bottom: 1rem; color: var(--dark);">🛍️ Productos</h3>
      ${order.detalles
        .map(
          (detalle) => `
        <div class="order-item">
          <div>
            <strong>${detalle.producto.nombre}</strong>
            <p style="color: #636e72; font-size: 0.9rem; margin-top: 0.3rem;">
              Cantidad: ${
                detalle.cantidad
              } × $${detalle.producto.precio.toFixed(2)}
            </p>
          </div>
          <span class="price" style="font-size: 1.2rem;">$${detalle.subtotal.toFixed(
            2
          )}</span>
        </div>
      `
        )
        .join("")}
    </div>

    <div class="order-totals">
      <div class="total"><span>Total:</span><span>$${order.total.toFixed(
        2
      )}</span></div>
    </div>

    ${getOrderStatusMessage(order.estado)}
  `;

  modal.classList.add("active");
};

const getPaymentMethodText = (method: "TARJETA" | "TRANSFERENCIA" | "EFECTIVO"): string => {
  const map: Record<string, string> = {
    EFECTIVO: "💵 Efectivo",
    TARJETA: "💳 Tarjeta",
    TRANSFERENCIA: "🏦 Transferencia",
  };
  return map[method] ?? method;
};

const getOrderStatusMessage = (status: EstadoPedido): string => {
  const messages: Record<EstadoPedido, string> = {
    PENDIENTE: `
      <div style="background: #ffeaa7; padding: 1rem; border-radius: 8px; margin-top: 1.5rem; border-left: 4px solid #fdcb6e;">
        <p style="margin: 0; color: #2d3436;">
          <strong>⏳ Tu pedido está siendo procesado</strong><br>
          <span style="font-size: 0.9rem;">Te notificaremos cuando sea confirmado.</span>
        </p>
      </div>
    `,
    CONFIRMADO: `
      <div style="background: #a8e6cf; padding: 1rem; border-radius: 8px; margin-top: 1.5rem; border-left: 4px solid #00b894;">
        <p style="margin: 0; color: #2d3436;">
          <strong>✅ Tu pedido fue confirmado</strong><br>
          <span style="font-size: 0.9rem;">Pronto comenzaremos a prepararlo.</span>
        </p>
      </div>
    `,
    EN_PREPARACION: `
      <div style="background: #dfe6e9; padding: 1rem; border-radius: 8px; margin-top: 1.5rem; border-left: 4px solid #6c5ce7;">
        <p style="margin: 0; color: #2d3436;">
          <strong>👨‍🍳 Tu pedido está en preparación</strong><br>
          <span style="font-size: 0.9rem;">Pronto estará listo para ser enviado.</span>
        </p>
      </div>
    `,
    ENVIADO: `
      <div style="background: #a8daff; padding: 1rem; border-radius: 8px; margin-top: 1.5rem; border-left: 4px solid #0984e3;">
        <p style="margin: 0; color: #2d3436;">
          <strong>🚚 Tu pedido está en camino</strong><br>
          <span style="font-size: 0.9rem;">Pronto llegará a tu dirección.</span>
        </p>
      </div>
    `,
    ENTREGADO: `
      <div style="background: #ffeaa7; padding: 1rem; border-radius: 8px; margin-top: 1.5rem; border-left: 4px solid #fdcb6e;">
        <p style="margin: 0; color: #2d3436;">
          <strong>📦 Tu pedido fue entregado</strong><br>
          <span style="font-size: 0.9rem;">Verifica que todo esté en orden.</span>
        </p>
      </div>
    `,
    TERMINADO: `
      <div style="background: #55efc4; padding: 1rem; border-radius: 8px; margin-top: 1.5rem; border-left: 4px solid #00b894;">
        <p style="margin: 0; color: #2d3436;">
          <strong>🎉 Pedido completado</strong><br>
          <span style="font-size: 0.9rem;">¡Esperamos que lo hayas disfrutado! Gracias por tu compra.</span>
        </p>
      </div>
    `,
    CANCELADO: `
      <div style="background: #fab1a0; padding: 1rem; border-radius: 8px; margin-top: 1.5rem; border-left: 4px solid #d63031;">
        <p style="margin: 0; color: #2d3436;">
          <strong>❌ Pedido cancelado</strong><br>
          <span style="font-size: 0.9rem;">Si tienes alguna duda, contáctanos.</span>
        </p>
      </div>
    `,
  };
  return messages[status] ?? "";
};

const closeModal = (): void => {
  const modal = document.getElementById("orderModal");
  if (modal) modal.classList.remove("active");
};

const initPage = async (): Promise<void> => {
  const user = getStoredUser();
  const userNameEl = document.getElementById("userName");
  const logoutBtn = document.getElementById("logoutBtn");
  const closeModalBtn = document.getElementById("closeModal");
  const statusFilter = document.getElementById("statusFilter");
  const modal = document.getElementById("orderModal");

  if (user && userNameEl) userNameEl.textContent = `${user.nombre} ${user.apellido}`;

  if (isAdmin()) {
    const adminLink = document.getElementById("adminLink");
    if (adminLink) adminLink.style.display = "block";
  }

  if (logoutBtn) logoutBtn.addEventListener("click", logout);
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
  if (statusFilter) statusFilter.addEventListener("change", filterOrders);

  if (modal) {
    modal.addEventListener("click", (e) => {
      if ((e.target as HTMLElement)?.id === "orderModal") closeModal();
    });
  }

  updateCartCount();
  await loadMyOrders();
};

requireAuth(() => {
  initPage();
});
