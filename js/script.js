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
provider.setCustomParameters({ prompt: 'select_account' }); // 🟢 Fuerza selección de cuenta

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

// ✅ Detectar cambios de sesión y actualizar la UI
onAuthStateChanged(auth, (user) => {
  if (user) {
    usuarioSpan.textContent = `Hola, ${user.displayName}`;
    botonLogin.textContent = "Cerrar sesión";

    // Obtener y aplicar curso guardado
    const cursoSelector = document.getElementsByName("curso");
    const docRef = doc(db, "usuarios", user.uid);

    getDoc(docRef).then((docSnap) => {
      if (docSnap.exists() && docSnap.data().curso) {
        const cursoGuardado = docSnap.data().curso;
        cursoSelector.forEach(radio => {
          if (radio.value === cursoGuardado) {
            radio.checked = true;
          }
        });

        // ✅ Generar el menú automáticamente al cargar
        generarMenuPorCurso(cursoGuardado);
      }
    });

    // Guardar selección de curso y actualizar menú
    cursoSelector.forEach(radio => {
      radio.addEventListener("change", () => {
        if (radio.checked) {
          const cursoSeleccionado = radio.value;

          // Guardar en Firestore
          setDoc(doc(db, "usuarios", user.uid), {
            curso: cursoSeleccionado
          }, { merge: true });

          // Generar menú dinámico actualizado
          generarMenuPorCurso(cursoSeleccionado);
        }
      });
    });

  } else {
    usuarioSpan.textContent = "";
    botonLogin.textContent = "Iniciar sesión";
  }
}); // 🔴 ESTA llave cierra el onAuthStateChanged

// ✅ Esta función debe estar FUERA de onAuthStateChanged
function generarMenuPorCurso(curso) {
  const menu = document.getElementById("menu");
  if (!menu) return;

  const nivel = curso.toLowerCase(); // Ej: "a1-1"
  const secciones = [
  { nombre: "Vocabolario", icono: "📘", archivo: "vocabolario" },
  { nombre: "Grammatica", icono: "📗", archivo: "grammatica" },
  { nombre: "Esercizi", icono: "📙", archivo: "esercizi" },
  { nombre: "Cultura", icono: "📕", archivo: "cultura" }
];


  menu.innerHTML = ""; // Limpiar menú anterior

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



