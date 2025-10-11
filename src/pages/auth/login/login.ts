import { loginUser } from "../../../utils/api";
import { setStoredUser } from "../../../utils/auth";
import { navigate } from "../../../utils/navigate";

const form = document.getElementById("loginForm")!;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = (document.getElementById("email") as HTMLInputElement).value;
  const password = (document.getElementById("password") as HTMLInputElement)
    .value;

  try {
    const user = await loginUser(email, password);
    if (user) {
      console.log(user);
      setStoredUser(user);
      navigate("/src/pages/store/home/home.html");
    } else {
      alert("Credenciales inválidas");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error al iniciar sesión. Verifica que el servidor esté corriendo.");
  }
});
