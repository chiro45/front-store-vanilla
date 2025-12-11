import type { UsuarioDto } from "../types/IBackendDtos";

export const getStoredUser = (): UsuarioDto | null => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

export const setStoredUser = (user: UsuarioDto): void => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const isAuthenticated = (): boolean => {
  return getStoredUser() !== null;
};

export const isAdmin = (): boolean => {
  const user = getStoredUser();
  return user?.rol === "ADMIN";
};

export const isCliente = (): boolean => {
  const user = getStoredUser();
  return user?.rol === "USUARIO";
};

// Higher order function for route protection
export const requireAuth = (callback: () => void): void => {
  if (!isAuthenticated()) {
    window.location.href = "/src/pages/login.html";
    return;
  }
  callback();
};

export const requireAdmin = (callback: () => void): void => {
  requireAuth(() => {
    if (!isAdmin()) {
      // Mostrar notificación no bloqueante y redirigir
      // Importar SweetAlert2 en tiempo de bundle es seguro aquí
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Swal = require("sweetalert2").default;
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Acceso denegado. Solo administradores.",
        showConfirmButton: false,
        timer: 2500,
      });
      window.location.href = "/src/pages/home.html";
      return;
    }
    callback();
  });
};

export const clearStoredUser = (): void => {
  localStorage.removeItem("user");
};

export const logout = (): void => {
  clearStoredUser();
  window.location.href = "/src/pages/auth/login/login.html";
};
