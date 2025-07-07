// ✅ Importaciones necesarias
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { firebaseConfig } from './firebase/config.js';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ✅ Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

const db = getFirestore(app);

// ✅ Menú hamburguesa
const botonMenu = document.getElementById("boton-menu");
const menu = document.getElementById("menu");

botonMenu.addEventListener("click", function () {
  menu.classList.toggle("mostrar");
  menu.classList.toggle("oculto");
});

// ✅ Botón login
const botonLogin = document.getElementById("boton-login");
const usuarioSpan = document.getElementById("usuario-logueado");

botonLogin.addEventListener("click", () => {
  if (auth.currentUser) {
    signOut(auth).then(() => {
      console.log("Sesión cerrada");
    });
  } else {
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log("Sesión iniciada con:", result.user.displayName);
      })
      .catch((error) => {
        console.error("Error al iniciar sesión", error);
      });
  }
});

// ✅ Detectar cambios de sesión
onAuthStateChanged(auth, (user) => {
  const cursoSelector = document.getElementsByName("curso");

  if (user) {
    usuarioSpan.textContent = `Hola, ${user.displayName}`;
    botonLogin.textContent = "Cerrar sesión";

    const docRef = doc(db, "usuarios", user.uid);

    getDoc(docRef).then((docSnap) => {
      if (docSnap.exists() && docSnap.data().curso) {
        const cursoAnterior = docSnap.data().curso;

        // ✅ Mostrar mensaje de "¿Deseas continuar?"
        const contenedorAviso = document.createElement("div");
        contenedorAviso.id = "aviso-curso";
        contenedorAviso.style.padding = "1em";
        contenedorAviso.style.marginTop = "1em";
        contenedorAviso.style.border = "1px solid #ccc";
        contenedorAviso.style.borderRadius = "8px";
        contenedorAviso.style.backgroundColor = "#f9f9f9";
        contenedorAviso.style.textAlign = "center";
        contenedorAviso.innerHTML = `
          <p>📌 Último curso seleccionado: <strong>${cursoAnterior.toUpperCase()}</strong></p>
          <button id="continuar-curso">Continuar con este curso</button>
        `;

        const radios = document.querySelector("fieldset");
        if (radios) {
          radios.parentNode.insertBefore(contenedorAviso, radios.nextSibling);
        }


        document.getElementById("continuar-curso").addEventListener("click", () => {
          cursoSelector.forEach(radio => {
            if (radio.value === cursoAnterior) {
              radio.checked = true;
            }
          });

          generarMenuPorCurso(cursoAnterior);

          // Reforzar guardado
          setDoc(doc(db, "usuarios", user.uid), {
            curso: cursoAnterior
          }, { merge: true });

          contenedorAviso.remove();
        });
      }
    });

    // ✅ Detectar cambios de curso
    cursoSelector.forEach(radio => {
      radio.addEventListener("change", () => {
        if (radio.checked) {
          const cursoSeleccionado = radio.value;

          setDoc(doc(db, "usuarios", user.uid), {
            curso: cursoSeleccionado
          }, { merge: true });

          generarMenuPorCurso(cursoSeleccionado);
        }
      });
    });

  } else {
    usuarioSpan.textContent = "";
    botonLogin.textContent = "Iniciar sesión";

    // 🔴 Limpiar menú
    const menu = document.getElementById("menu");
    if (menu) {
      menu.innerHTML = "";
      menu.classList.remove("mostrar");
      menu.classList.add("oculto");
    }

    // 🔴 Deseleccionar curso
    cursoSelector.forEach(radio => {
      radio.checked = false;
    });

    // 🔴 Eliminar aviso si aún está presente
    const aviso = document.getElementById("aviso-curso");
    if (aviso) aviso.remove();
  }
});

// ✅ Generador de menú dinámico
function generarMenuPorCurso(curso) {
  const menu = document.getElementById("menu");
  if (!menu) return;

  const nivel = curso.toLowerCase();
  const secciones = [
    { nombre: "Vocabolario", icono: "📘", archivo: "vocabolario" },
    { nombre: "Grammatica", icono: "📗", archivo: "grammatica" },
    { nombre: "Esercizi", icono: "📙", archivo: "esercizi" },
    { nombre: "Cultura", icono: "📕", archivo: "cultura" }
  ];

  menu.innerHTML = "";

  secciones.forEach(sec => {
    const li = document.createElement("li");
    const enlace = document.createElement("a");
    const archivo = `${sec.archivo}-${nivel}.html`;

    enlace.href = archivo;
    enlace.textContent = `${sec.icono} ${sec.nombre} ${curso.toUpperCase()}`;
    li.appendChild(enlace);
    menu.appendChild(li);
  });
}
