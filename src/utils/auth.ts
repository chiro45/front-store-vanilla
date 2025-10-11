import type { IUser } from "../types/IUser";

export const getStoredUser = (): IUser | null => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

export const setStoredUser = (user: IUser): void => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const isAuthenticated = (): boolean => {
  return getStoredUser() !== null;
};

export const isAdmin = (): boolean => {
  const user = getStoredUser();
  return user?.role === "admin";
};

export const isCliente = (): boolean => {
  const user = getStoredUser();
  return user?.role === "cliente";
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
      alert("Acceso denegado. Solo administradores.");
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
