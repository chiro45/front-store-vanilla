import { registerUser } from "../../../utils/api";
import { setStoredUser } from "../../../utils/auth";
import { navigate } from "../../../utils/navigate";

const form = document.getElementById("registerForm") as HTMLFormElement;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName = (document.getElementById("name") as HTMLInputElement).value.trim();
  const email = (document.getElementById("email") as HTMLInputElement).value.trim();
  const phone = (document.getElementById("phone") as HTMLInputElement).value.trim();
  const password = (document.getElementById("password") as HTMLInputElement).value;

  // Validaciones básicas
  if (!fullName || !email || !password) {
    alert("Por favor completa todos los campos obligatorios");
    return;
  }

  if (password.length < 6) {
    alert("La contraseña debe tener al menos 6 caracteres");
    return;
  }

  // Dividir el nombre completo en nombre y apellido
  const nameParts = fullName.split(" ");
  const nombre = nameParts[0];
  const apellido = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

  const userData = {
    nombre,
    apellido,
    mail: email,
    celular: phone || "",
    password,
  };

  try {
    const newUser = await registerUser(userData);

    if (newUser) {
      setStoredUser(newUser);
      alert("¡Registro exitoso! Bienvenido a Food Store");
      navigate("/src/pages/store/home/home.html");
    } else {
      alert("Error al registrarse. El email podría estar ya en uso.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error al registrarse. Verifica que el servidor esté corriendo.");
  }
});
