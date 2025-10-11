// import { requireAuth, getStoredUser, logout, isAdmin } from "../utils/auth";
// import { getOrders } from "../utils/api";
// import { getCartItemCount } from "../utils/cart";

// let myOrders = [];

// requireAuth(() => {
//   initPage();
// });

// async function initPage() {
//   const user = getStoredUser();
//   if (user) {
//     document.getElementById("userName").textContent = user.name;
//   }

//   if (isAdmin()) {
//     const adminLink = document.getElementById("adminLink");
//     if (adminLink) adminLink.style.display = "block";
//   }

//   document.getElementById("logoutBtn").addEventListener("click", logout);
//   document.getElementById("closeModal").addEventListener("click", closeModal);

//   document.getElementById("orderModal").addEventListener("click", (e) => {
//     if (e.target.id === "orderModal") closeModal();
//   });

//   updateCartCount();
//   await loadMyOrders();
// }

// function updateCartCount() {
//   const count = getCartItemCount();
//   const cartCount = document.getElementById("cartCount");
//   if (cartCount) cartCount.textContent = count.toString();
// }

// async function loadMyOrders() {
//   try {
//     const user = getStoredUser();
//     const allOrders = await getOrders();

//     // Filtrar solo los pedidos del usuario actual
//     myOrders = allOrders.filter((order) => order.userId === user.id);
//     myOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

//     renderOrders();
//   } catch (error) {
//     console.error("Error:", error);
//     document.getElementById("ordersContainer").innerHTML =
//       '<p class="text-center">Error al cargar tus pedidos</p>';
//   }
// }

// function renderOrders() {
//   const container = document.getElementById("ordersContainer");
//   const emptyOrders = document.getElementById("emptyOrders");

//   if (myOrders.length === 0) {
//     container.style.display = "none";
//     emptyOrders.style.display = "block";
//     return;
//   }

//   container.style.display = "block";
//   emptyOrders.style.display = "none";

//   container.innerHTML = myOrders
//     .map((order) => {
//       const date = new Date(order.createdAt);
//       const formattedDate = date.toLocaleDateString("es-AR", {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//       });

//       return `
//           <div class="my-order-card card clickable" onclick="window.viewOrder('${
//             order.id
//           }')">
//             <div class="my-order-header">
//               <div class="my-order-info">
//                 <h3>Pedido #${order.id}</h3>
//                 <p class="order-date">${formattedDate}</p>
//               </div>
//               <span class="status-badge status-${order.status}">
//                 ${getStatusText(order.status)}
//               </span>
//             </div>
            
//             <div class="my-order-items">
//               ${order.items
//                 .slice(0, 3)
//                 .map(
//                   (item) => `
//                 <div class="my-order-item">
//                   <img src="${item.image}" alt="${item.name}">
//                   <div class="my-order-item-info">
//                     <span class="item-name">${item.name}</span>
//                     <span class="item-quantity">x${item.quantity}</span>
//                   </div>
//                 </div>
//               `
//                 )
//                 .join("")}
//               ${
//                 order.items.length > 3
//                   ? `<span class="more-items">+${
//                       order.items.length - 3
//                     } más</span>`
//                   : ""
//               }
//             </div>
            
//             <div class="my-order-footer">
//               <span class="order-items-count">${
//                 order.items.length
//               } producto(s)</span>
//               <span class="price">$${order.total.toFixed(2)}</span>
//             </div>
//           </div>
//         `;
//     })
//     .join("");
// }

// function getStatusText(status) {
//   const statusMap = {
//     pending: "Pendiente",
//     processing: "En Preparación",
//     completed: "Entregado",
//     cancelled: "Cancelado",
//   };
//   return statusMap[status] || status;
// }

// window.viewOrder = (orderId) => {
//   const order = myOrders.find((o) => o.id === orderId);

//   if (!order) return;

//   document.getElementById("orderId").textContent = orderId;

//   const date = new Date(order.createdAt);
//   const formattedDate = date.toLocaleDateString("es-AR", {
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   });

//   const detailHtml = `
//         <div class="order-detail-status">
//           <span class="status-badge status-${order.status}">
//             ${getStatusText(order.status)}
//           </span>
//           <p class="order-date">${formattedDate}</p>
//         </div>

//         <div class="order-detail-info">
//           <h3>Información de Entrega</h3>
//           <p><strong>Dirección:</strong> ${order.address}</p>
//           <p><strong>Teléfono:</strong> ${order.phone}</p>
//           <p><strong>Método de pago:</strong> ${getPaymentMethodText(
//             order.paymentMethod
//           )}</p>
//           ${order.notes ? `<p><strong>Notas:</strong> ${order.notes}</p>` : ""}
//         </div>

//         <div class="order-items">
//           <h3>Productos:</h3>
//           ${order.items
//             .map(
//               (item) => `
//             <div class="order-item">
//               <div>
//                 <strong>${item.name}</strong>
//                 <p class="order-item-info">Cantidad: ${item.quantity} × $${
//                 item.price
//               }</p>
//               </div>
//               <span class="price">$${(item.price * item.quantity).toFixed(
//                 2
//               )}</span>
//             </div>
//           `
//             )
//             .join("")}
//         </div>

//         <div class="order-totals">
//           <div class="order-totals-row">
//             <span>Subtotal:</span>
//             <span>$${order.subtotal.toFixed(2)}</span>
//           </div>
//           <div class="order-totals-row">
//             <span>Envío:</span>
//             <span>$${order.shipping.toFixed(2)}</span>
//           </div>
//           <div class="order-totals-row total">
//             <span>Total:</span>
//             <span>$${order.total.toFixed(2)}</span>
//           </div>
//         </div>

//         ${
//           order.status === "pending"
//             ? `
//           <div class="order-help">
//             <p>💡 Tu pedido está siendo procesado. Te notificaremos cuando esté en camino.</p>
//           </div>
//         `
//             : ""
//         }
//         ${
//           order.status === "processing"
//             ? `
//           <div class="order-help">
//             <p>🚀 Tu pedido está en preparación. Pronto estará listo para entrega.</p>
//           </div>
//         `
//             : ""
//         }
//         ${
//           order.status === "completed"
//             ? `
//           <div class="order-help success">
//             <p>✅ Tu pedido fue entregado. ¡Esperamos que lo hayas disfrutado!</p>
//           </div>
//         `
//             : ""
//         }
//       `;

//   document.getElementById("orderDetail").innerHTML = detailHtml;
//   document.getElementById("orderModal").classList.add("active");
// };

// function getPaymentMethodText(method) {
//   const methods = {
//     cash: "Efectivo",
//     card: "Tarjeta",
//     transfer: "Transferencia",
//   };
//   return methods[method] || method;
// }

// function closeModal() {
//   document.getElementById("orderModal").classList.remove("active");
// }
