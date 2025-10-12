import type { IOrder } from "../../../types/IOrders";
import { getOrders } from "../../../utils/api";
import {
  getStoredUser,
  isAdmin,
  logout,
  requireAuth,
} from "../../../utils/auth";
import { getCartItemCount } from "../../../utils/cart";

let myOrders: IOrder[] = [];
let filteredOrders: IOrder[] = [];

const updateCartCount = (): void => {
  const count = getCartItemCount();
  const cartCountEl = document.getElementById("cartCount");
  if (cartCountEl) cartCountEl.textContent = count.toString();
};

const loadMyOrders = async (): Promise<void> => {
  try {
    const user = getStoredUser();
    if (!user) return;

    const allOrders = await getOrders();

    // Filtrar solo los pedidos del usuario actual (por nombre de usuario)
    myOrders = allOrders.filter((order) => order.userName === user.name);
    myOrders.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

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
      : myOrders.filter((o) => o.status === filter);

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
      const date = new Date(order.createdAt);
      const formattedDate = date.toLocaleDateString("es-AR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      return `
        <div class="card order-card clickable" onclick="window.viewOrder('${
          order.id
        }')" style="cursor: pointer;">
          <div class="order-header">
            <div>
              <h3>Pedido #${order.id}</h3>
              <p style="color: #636e72; font-size: 0.95rem; margin-top: 0.5rem;">
                📅 ${formattedDate}
              </p>
            </div>
            <span class="status-badge status-${order.status}">
              ${getStatusText(order.status)}
            </span>
          </div>
          
          <div style="margin: 1rem 0; padding-top: 1rem; border-top: 1px solid var(--gray);">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.5rem;">
              ${order.items
                .slice(0, 3)
                .map(
                  (item) => `
                <div style="font-size: 0.9rem; color: #636e72;">
                  • ${item.name} (x${item.quantity})
                </div>
              `
                )
                .join("")}
              ${
                order.items.length > 3
                  ? `
                <div style="font-size: 0.9rem; color: var(--primary); font-weight: 600;">
                  +${order.items.length - 3} más
                </div>
              `
                  : ""
              }
            </div>
          </div>
          
          <div class="order-summary">
            <div>
              <span style="color: #636e72;">📦 ${
                order.items.length
              } producto(s)</span>
            </div>
            <div class="price">$${order.total.toFixed(2)}</div>
          </div>
        </div>
      `;
    })
    .join("");
};

const getStatusText = (status: IOrder["status"]): string => {
  const map: Record<IOrder["status"], string> = {
    pending: "Pendiente",
    processing: "En Preparación",
    completed: "Entregado",
    cancelled: "Cancelado",
  };
  return map[status] ?? status;
};

const getStatusIcon = (status: IOrder["status"]): string => {
  const map: Record<IOrder["status"], string> = {
    pending: "⏳",
    processing: "👨‍🍳",
    completed: "✅",
    cancelled: "❌",
  };
  return map[status] ?? "📦";
};

(window as any).viewOrder = (orderId: string): void => {
  const order = myOrders.find((o) => o.id === orderId);
  if (!order) return;

  const orderIdEl = document.getElementById("orderId");
  const orderDetailEl = document.getElementById("orderDetail");
  const modal = document.getElementById("orderModal");

  if (!orderDetailEl || !modal || !orderIdEl) return;

  orderIdEl.textContent = orderId;

  const date = new Date(order.createdAt);
  const formattedDate = date.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  orderDetailEl.innerHTML = `
    <div style="text-align: center; padding: 1.5rem; background: var(--light); border-radius: 10px; margin-bottom: 1.5rem;">
      <div style="font-size: 3rem; margin-bottom: 0.5rem;">
        ${getStatusIcon(order.status)}
      </div>
      <span class="status-badge status-${
        order.status
      }" style="font-size: 1rem; padding: 0.7rem 1.5rem;">
        ${getStatusText(order.status)}
      </span>
      <p style="margin-top: 1rem; color: #636e72; font-size: 0.95rem;">📅 ${formattedDate}</p>
    </div>

    <div class="order-info">
      <h3 style="margin-bottom: 1rem; color: var(--dark);">📍 Información de Entrega</h3>
      <p><strong>Dirección:</strong> ${order.address}</p>
      <p><strong>Teléfono:</strong> ${order.phone}</p>
      <p><strong>Método de pago:</strong> ${getPaymentMethodText(
        order.paymentMethod
      )}</p>
      ${order.notes ? `<p><strong>Notas:</strong> ${order.notes}</p>` : ""}
    </div>

    <div class="order-items">
      <h3 style="margin-bottom: 1rem; color: var(--dark);">🛍️ Productos</h3>
      ${order.items
        .map(
          (item) => `
        <div class="order-item">
          <div>
            <strong>${item.name}</strong>
            <p style="color: #636e72; font-size: 0.9rem; margin-top: 0.3rem;">
              Cantidad: ${item.quantity} × $${item.price.toFixed(2)}
            </p>
          </div>
          <span class="price" style="font-size: 1.2rem;">$${(
            item.price * item.quantity
          ).toFixed(2)}</span>
        </div>
      `
        )
        .join("")}
    </div>

    <div class="order-totals">
      <div><span>Subtotal:</span><span>$${order.subtotal.toFixed(
        2
      )}</span></div>
      <div><span>Envío:</span><span>$${order.shipping.toFixed(2)}</span></div>
      <div class="total"><span>Total:</span><span>$${order.total.toFixed(
        2
      )}</span></div>
    </div>

    ${getOrderStatusMessage(order.status)}
  `;

  modal.classList.add("active");
};

const getPaymentMethodText = (method: IOrder["paymentMethod"]): string => {
  const map: Record<IOrder["paymentMethod"], string> = {
    cash: "💵 Efectivo",
    card: "💳 Tarjeta",
    transfer: "🏦 Transferencia",
  };
  return map[method] ?? method;
};

const getOrderStatusMessage = (status: IOrder["status"]): string => {
  const messages: Record<IOrder["status"], string> = {
    pending: `
      <div style="background: #ffeaa7; padding: 1rem; border-radius: 8px; margin-top: 1.5rem; border-left: 4px solid #fdcb6e;">
        <p style="margin: 0; color: #2d3436;">
          <strong>⏳ Tu pedido está siendo procesado</strong><br>
          <span style="font-size: 0.9rem;">Te notificaremos cuando esté listo para entrega.</span>
        </p>
      </div>
    `,
    processing: `
      <div style="background: #dfe6e9; padding: 1rem; border-radius: 8px; margin-top: 1.5rem; border-left: 4px solid #6c5ce7;">
        <p style="margin: 0; color: #2d3436;">
          <strong>👨‍🍳 Tu pedido está en preparación</strong><br>
          <span style="font-size: 0.9rem;">Pronto estará listo para ser entregado.</span>
        </p>
      </div>
    `,
    completed: `
      <div style="background: #55efc4; padding: 1rem; border-radius: 8px; margin-top: 1.5rem; border-left: 4px solid #00b894;">
        <p style="margin: 0; color: #2d3436;">
          <strong>✅ Tu pedido fue entregado</strong><br>
          <span style="font-size: 0.9rem;">¡Esperamos que lo hayas disfrutado! Gracias por tu compra.</span>
        </p>
      </div>
    `,
    cancelled: `
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

  if (user && userNameEl) userNameEl.textContent = user.name;

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
