import type { PedidoDto, EstadoPedido } from "../../../types/IBackendDtos";
import { getOrders, updateOrderStatus } from "../../../utils/api";
import { getStoredUser, logout, requireAdmin } from "../../../utils/auth";

let allOrders: PedidoDto[] = [];
let currentOrderId: number | null = null;

const loadOrders = async (): Promise<void> => {
  try {
    allOrders = await getOrders();
    allOrders.sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha));
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
    filter === "all" ? allOrders : allOrders.filter((o) => o.estado === filter);
  renderOrders(filtered);
};

const renderOrders = (orders: PedidoDto[]): void => {
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
      const date = new Date(order.fecha);
      const formattedDate = date.toLocaleDateString("es-AR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const userName = order.usuarioDto
        ? `${order.usuarioDto.nombre} ${order.usuarioDto.apellido}`
        : "Usuario";

      return `
        <div class="card order-card" onclick="window.viewOrder(${order.id})">
          <div class="order-header">
            <div>
              <h3>Pedido #${order.id}</h3>
              <p>Cliente: ${userName}</p>
              <p>${formattedDate}</p>
            </div>
            <span class="status-badge status-${order.estado.toLowerCase()}">
              ${getStatusText(order.estado)}
            </span>
          </div>
          <div class="order-summary">
            <span>${order.detalles.length} producto(s)</span>
            <span class="price">$${order.total.toFixed(2)}</span>
          </div>
        </div>`;
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
    TERMINADO: "Terminado",
    CANCELADO: "Cancelado",
  };
  return map[status] ?? status;
};

(window as any).viewOrder = (orderId: number): void => {
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

  orderIdEl.textContent = String(orderId);
  orderStatusEl.value = order.estado;

  const date = new Date(order.fecha);
  const formattedDate = date.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const userName = order.usuarioDto
    ? `${order.usuarioDto.nombre} ${order.usuarioDto.apellido}`
    : "Usuario";
  const userPhone = order.usuarioDto?.celular || "N/A";
  const userMail = order.usuarioDto?.mail || "N/A";

  orderDetailEl.innerHTML = `
    <div class="order-info">
      <p><strong>Cliente:</strong> ${userName}</p>
      <p><strong>Fecha:</strong> ${formattedDate}</p>
      <p><strong>Teléfono:</strong> ${userPhone}</p>
      <p><strong>Email:</strong> ${userMail}</p>
      <p><strong>Método de pago:</strong> ${getPaymentMethodText(
        order.formaPago
      )}</p>
    </div>
    <div class="order-items">
      <h3>Productos:</h3>
      ${order.detalles
        .map(
          (detalle) => `
          <div class="order-item">
            <div>
              <strong>${detalle.productoDto.nombre}</strong>
              <p>Cantidad: ${detalle.cantidad} × $${detalle.productoDto.precio}</p>
            </div>
            <span class="price">$${detalle.subtotal.toFixed(2)}</span>
          </div>`
        )
        .join("")}
    </div>
    <div class="order-totals">
      <div class="total"><span>Total:</span><span>$${order.total.toFixed(
        2
      )}</span></div>
    </div>
  `;

  modal.classList.add("active");
};

const getPaymentMethodText = (method: "TARJETA" | "TRANSFERENCIA" | "EFECTIVO"): string => {
  const map: Record<string, string> = {
    TARJETA: "Tarjeta",
    TRANSFERENCIA: "Transferencia",
    EFECTIVO: "Efectivo",
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
  )?.value as EstadoPedido;
  if (!newStatus) return;

  try {
    await updateOrderStatus(currentOrderId, newStatus);
    const order = allOrders.find((o) => o.id === currentOrderId);
    if (order) order.estado = newStatus;

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

  if (user && userNameEl) userNameEl.textContent = `${user.nombre} ${user.apellido}`;
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
