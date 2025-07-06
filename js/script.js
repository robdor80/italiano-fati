const botonMenu = document.getElementById("boton-menu");
const menu = document.getElementById("menu");

botonMenu.addEventListener("click", function () {
  menu.classList.toggle("mostrar");
  menu.classList.toggle("oculto");
});

import { auth } from "../firebase/config.js";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const botonLogin = document.getElementById("boton-login");
const usuarioSpan = document.getElementById("usuario-logueado");

const provider = new GoogleAuthProvider();

botonLogin.addEventListener("click", () => {
  if (auth.currentUser) {
    // Ya está logueado, cerrar sesión
    signOut(auth).then(() => {
      console.log("Sesión cerrada");
    });
  } else {
    // Iniciar sesión
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log("Sesión iniciada con:", result.user.displayName);
      })
      .catch((error) => {
        console.error("Error al iniciar sesión", error);
      });
  }
});

// Detectar cambios de sesión
onAuthStateChanged(auth, (user) => {
  if (user) {
    usuarioSpan.textContent = `Hola, ${user.displayName}`;
    botonLogin.textContent = "Cerrar sesión";
  } else {
    usuarioSpan.textContent = "";
    botonLogin.textContent = "Iniciar sesión";
  }
});

