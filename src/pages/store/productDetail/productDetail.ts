import type { IProduct } from "../../../types/IProduct";
import { getProductById, getProducts } from "../../../utils/api";

// Obtener el id del query string
const getProductIdFromUrl = (): number | null => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  return id ? Number(id) : null;
};

// Renderizar producto
const renderProduct = (product: IProduct) => {
  const container = document.getElementById("productDetailContainer");
  if (!container) return;

  container.innerHTML = `
    <img src="${product.imagen}" alt="${product.nombre}" />
    <div class="product-info">
      <h1>${product.nombre}</h1>
      <p>${product.descripcion ?? ""}</p>
      <div class="price">$${product.precio}</div>
      <div>Stock: ${product.stock}</div>
      <span class="badge ${product.activo ? "badge-success" : "badge-danger"}">
        ${product.activo ? "Disponible" : "No disponible"}
      </span>
    </div>
  `;
};

// Inicializar
const init = async () => {
  const id = getProductIdFromUrl();
  if (!id) {
    alert("Producto no encontrado");
    return;
  }

  try {
    const product = await getProductById(`${id}`);

    if (!product) {
      alert("Producto no encontrado");
      return;
    }

    renderProduct(product);
  } catch (error) {
    console.error("Error al cargar el producto:", error);
  }
};

init();
