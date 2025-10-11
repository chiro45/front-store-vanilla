import type { IOrder, IOrderItem } from "../../../types/IOrders";
import { getOrders, updateOrderStatus } from "../../../utils/api";
import { getStoredUser, logout, requireAdmin } from "../../../utils/auth";

let allOrders: IOrder[] = [];
let currentOrderId: string | null = null;

const loadOrders = async (): Promise<void> => {
  try {
    allOrders = await getOrders();
    allOrders.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    renderOrders(allOrders);
  } catch (error) {
    console.error("Error al cargar pedidos:", error);
    const container = document.getElementById("ordersContainer");
    if (container)
      container.innerHTML =
        '<p class="text-center">Error al cargar los pedidos</p>';
  }
};

const filterOrders = (): void => {
  const filter = (document.getElementById("statusFilter") as HTMLSelectElement)
    ?.value;
  if (!filter) return;

  const filtered =
    filter === "all" ? allOrders : allOrders.filter((o) => o.status === filter);
  renderOrders(filtered);
};

const renderOrders = (orders: IOrder[]): void => {
  const container = document.getElementById("ordersContainer");
  if (!container) return;

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="card text-center">
        <h3>No hay pedidos para mostrar</h3>
      </div>`;
    return;
  }

  container.innerHTML = orders
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
        <div class="card order-card" onclick="window.viewOrder('${order.id}')">
          <div class="order-header">
            <div>
              <h3>Pedido #${order.id}</h3>
              <p>Cliente: ${order.userName}</p>
              <p>${formattedDate}</p>
            </div>
            <span class="status-badge status-${order.status}">
              ${getStatusText(order.status)}
            </span>
          </div>
          <div class="order-summary">
            <span>${order.items.length} producto(s)</span>
            <span class="price">$${order.total.toFixed(2)}</span>
          </div>
        </div>`;
    })
    .join("");
};

const getStatusText = (status: IOrder["status"]): string => {
  const map: Record<IOrder["status"], string> = {
    pending: "Pendiente",
    processing: "En Proceso",
    completed: "Completado",
    cancelled: "Cancelado",
  };
  return map[status] ?? status;
};

(window as any).viewOrder = (orderId: string): void => {
  const order = allOrders.find((o) => o.id === orderId);
  if (!order) return;

  currentOrderId = orderId;

  const orderIdEl = document.getElementById("orderId");
  const orderStatusEl = document.getElementById(
    "orderStatus"
  ) as HTMLSelectElement;
  const orderDetailEl = document.getElementById("orderDetail");
  const modal = document.getElementById("orderModal");

  if (!orderDetailEl || !modal || !orderStatusEl || !orderIdEl) return;

  orderIdEl.textContent = orderId;
  orderStatusEl.value = order.status;

  const date = new Date(order.createdAt);
  const formattedDate = date.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  orderDetailEl.innerHTML = `
    <div class="order-info">
      <p><strong>Cliente:</strong> ${order.userName}</p>
      <p><strong>Fecha:</strong> ${formattedDate}</p>
      <p><strong>Teléfono:</strong> ${order.phone}</p>
      <p><strong>Dirección:</strong> ${order.address}</p>
      <p><strong>Método de pago:</strong> ${getPaymentMethodText(
        order.paymentMethod
      )}</p>
      ${order.notes ? `<p><strong>Notas:</strong> ${order.notes}</p>` : ""}
    </div>
    <div class="order-items">
      <h3>Productos:</h3>
      ${order.items
        .map(
          (i: IOrderItem) => `
          <div class="order-item">
            <div>
              <strong>${i.name}</strong>
              <p>Cantidad: ${i.quantity} × $${i.price}</p>
            </div>
            <span class="price">$${(i.price * i.quantity).toFixed(2)}</span>
          </div>`
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
  `;

  modal.classList.add("active");
};

const getPaymentMethodText = (method: IOrder["paymentMethod"]): string => {
  const map: Record<IOrder["paymentMethod"], string> = {
    cash: "Efectivo",
    card: "Tarjeta",
    transfer: "Transferencia",
  };
  return map[method] ?? method;
};

const closeModal = (): void => {
  const modal = document.getElementById("orderModal");
  if (modal) modal.classList.remove("active");
  currentOrderId = null;
};

const handleUpdateStatus = async (): Promise<void> => {
  if (!currentOrderId) return;

  const newStatus = (
    document.getElementById("orderStatus") as HTMLSelectElement
  )?.value as IOrder["status"];
  if (!newStatus) return;

  try {
    await updateOrderStatus(currentOrderId, newStatus);
    const order = allOrders.find((o) => o.id === currentOrderId);
    if (order) order.status = newStatus;

    alert("Estado actualizado correctamente");
    closeModal();
    filterOrders();
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    alert("Error al actualizar el estado");
  }
};

const initPage = async (): Promise<void> => {
  const user = getStoredUser();
  const userNameEl = document.getElementById("userName");
  const logoutBtn = document.getElementById("logoutBtn");
  const closeModalBtn = document.getElementById("closeModal");
  const statusFilter = document.getElementById("statusFilter");
  const updateStatusBtn = document.getElementById("updateStatusBtn");
  const modal = document.getElementById("orderModal");

  if (user && userNameEl) userNameEl.textContent = user.name;
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
  if (statusFilter)
    statusFilter.addEventListener("change", filterOrders as EventListener);
  if (updateStatusBtn)
    updateStatusBtn.addEventListener("click", handleUpdateStatus);
  if (modal)
    modal.addEventListener("click", (e) => {
      if ((e.target as HTMLElement)?.id === "orderModal") closeModal();
    });

  await loadOrders();
};

requireAdmin(() => {
  initPage();
});
