import {
  getStoredUser,
  isAdmin,
  logout,
  requireAuth,
  setStoredUser,
} from "../../../utils/auth";
import Swal from "sweetalert2";
import { getCartItemCount } from "../../../utils/cart";

const updateCartCount = (): void => {
  const count = getCartItemCount();
  const cartCountEl = document.getElementById("cartCount");
  if (cartCountEl) cartCountEl.textContent = count.toString();
};

const loadUserProfile = (): void => {
  const user = getStoredUser();
  if (!user) return;

  const nameEl = document.getElementById("profileName") as HTMLInputElement;
  const emailEl = document.getElementById("profileEmail") as HTMLInputElement;
  const phoneEl = document.getElementById("profilePhone") as HTMLInputElement;
  const roleEl = document.getElementById("profileRole");

  if (nameEl) nameEl.value = `${user.nombre} ${user.apellido}`;
  if (emailEl) emailEl.value = user.mail;
  if (phoneEl) phoneEl.value = user.celular || "";
  if (roleEl) {
    roleEl.textContent = user.rol === "ADMIN" ? "Administrador" : "Cliente";
    roleEl.className = `badge ${
      user.rol === "ADMIN" ? "badge-success" : "badge-info"
    }`;
  }
};

const handleUpdateProfile = async (e: Event): Promise<void> => {
  e.preventDefault();

  const user = getStoredUser();
  if (!user) return;

  const fullName = (
    document.getElementById("profileName") as HTMLInputElement
  ).value.trim();
  const phone = (
    document.getElementById("profilePhone") as HTMLInputElement
  ).value.trim();

  if (!fullName) {
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

  // Dividir el nombre completo en nombre y apellido
  const nameParts = fullName.split(" ");
  const nombre = nameParts[0];
  const apellido = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

  // Actualizar usuario en localStorage
  const updatedUser = {
    ...user,
    nombre,
    apellido,
    celular: phone || "",
  };

  setStoredUser(updatedUser);
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title: "Perfil actualizado correctamente",
    showConfirmButton: false,
    timer: 2000,
  });

  // Actualizar el nombre en el navbar
  const userNameEl = document.getElementById("userName");
  if (userNameEl) userNameEl.textContent = fullName;
};

const handleChangePassword = (e: Event): void => {
  e.preventDefault();

  const currentPassword = (
    document.getElementById("currentPassword") as HTMLInputElement
  ).value;
  const newPassword = (
    document.getElementById("newPassword") as HTMLInputElement
  ).value;
  const confirmPassword = (
    document.getElementById("confirmPassword") as HTMLInputElement
  ).value;

  if (!currentPassword || !newPassword || !confirmPassword) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "warning",
      title: "Todos los campos son obligatorios",
      showConfirmButton: false,
      timer: 2500,
    });
    return;
  }

  if (newPassword !== confirmPassword) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "warning",
      title: "Las contraseñas no coinciden",
      showConfirmButton: false,
      timer: 2500,
    });
    return;
  }

  if (newPassword.length < 6) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "warning",
      title: "La nueva contraseña debe tener al menos 6 caracteres",
      showConfirmButton: false,
      timer: 2500,
    });
    return;
  }

  // En un escenario real, esto debería hacer una llamada al backend
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "info",
    title: "⚠️ Cambio de contraseña no implementado en el backend.",
    text: "El backend necesita implementar un endpoint PUT /usuario/{id}/password que valide la contraseña actual y actualice la nueva.",
    showConfirmButton: false,
    timer: 4500,
  });

  // Limpiar formulario
  (document.getElementById("passwordForm") as HTMLFormElement).reset();
};

const initPage = (): void => {
  const user = getStoredUser();
  const userNameEl = document.getElementById("userName");
  const logoutBtn = document.getElementById("logoutBtn");
  const profileForm = document.getElementById("profileForm");
  const passwordForm = document.getElementById("passwordForm");

  if (user && userNameEl) {
    userNameEl.textContent = `${user.nombre} ${user.apellido}`;
  }

  if (isAdmin()) {
    const adminLink = document.getElementById("adminLink");
    if (adminLink) adminLink.style.display = "block";
  }

  if (logoutBtn) logoutBtn.addEventListener("click", logout);
  if (profileForm) profileForm.addEventListener("submit", handleUpdateProfile);
  if (passwordForm)
    passwordForm.addEventListener("submit", handleChangePassword);

  updateCartCount();
  loadUserProfile();
};

requireAuth(() => {
  initPage();
});
