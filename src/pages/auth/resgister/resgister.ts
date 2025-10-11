import { registerUser } from "../../../utils/api";
import { setStoredUser } from "../../../utils/auth";
import { navigate } from "../../../utils/navigate";

const form = document.getElementById("registerForm") as HTMLFormElement;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userData = {
    name: (document.getElementById("name") as HTMLInputElement).value,
    email: (document.getElementById("email") as HTMLInputElement).value,
    password: (document.getElementById("password") as HTMLInputElement).value,
    role: "cliente",
  };

  try {
    const newUser = await registerUser(userData);

    setStoredUser(newUser!);
    alert("Registro exitoso!");
    navigate("/src/pages/store/home/home.html");
  } catch (error) {
    console.error("Error:", error);
    alert("Error al registrarse");
  }
});
