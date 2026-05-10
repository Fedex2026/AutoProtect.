// FIREBASE
// =========================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =========================
// PEGA TUS CLAVES AQUI
// =========================

const firebaseConfig = {
  apiKey: "AIzaSyD4DcYkz6PhLSoYWkncpuXVq3NqtYka2CM",
  authDomain: "autoprotect-7dabb.firebaseapp.com",
  projectId: "autoprotect-7dabb",
  storageBucket: "autoprotect-7dabb.firebasestorage.app",
  messagingSenderId: "583827631154",
  appId: "1:583827631154:web:2904409c93b61b7114202b"
};


// =========================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// =========================
// MODALES
// =========================

function abrirModal(id) {
  document.getElementById(id).classList.add("active");
}

function cerrarModal(id) {
  document.getElementById(id).classList.remove("active");
}


// =========================
// REGISTRO
// =========================

window.registrarUsuario = async () => {
  try {
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const tipo = document.getElementById("registerTipo").value;

    if (!email || !password) {
      alert("Completa todos los campos");
      return;
    }

    const cred = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await setDoc(doc(db, "usuarios", cred.user.uid), {
      email,
      tipo,
      createdAt: serverTimestamp(),
    });

    alert("Cuenta creada correctamente");

    cerrarModal("registerModal");
  } catch (error) {
    alert(error.message);
  }
};


// =========================
// LOGIN
// =========================

window.loginUsuario = async () => {
  try {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    await signInWithEmailAndPassword(auth, email, password);

    cerrarModal("loginModal");
  } catch (error) {
    alert(error.message);
  }
};


// =========================
// LOGOUT
// =========================

window.logoutUsuario = async () => {
  await signOut(auth);
};


// =========================
// ESTADO LOGIN
// =========================

onAuthStateChanged(auth, async (user) => {
  const loginBtn = document.getElementById("loginBtn");
  const panelUsuario = document.getElementById("panelUsuario");

  if (user) {
    loginBtn.style.display = "none";
    panelUsuario.style.display = "block";

    const ref = doc(db, "usuarios", user.uid);

    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const data = snap.data();

    document.getElementById("usuarioCorreo").innerText =
      user.email;

    document.getElementById("usuarioTipo").innerText =
      data.tipo;

    if (data.tipo === "corralon") {
      document.getElementById("zonaCorralon").style.display =
        "block";
    }

    if (data.tipo === "miembro") {
      document.getElementById("zonaMiembro").style.display =
        "block";
    }

    if (data.tipo === "gratis") {
      document.getElementById("zonaGratis").style.display =
        "block";
    }

    cargarAutosCorralon();
  } else {
    loginBtn.style.display = "flex";
    panelUsuario.style.display = "none";

    document.getElementById("zonaCorralon").style.display =
      "none";

    document.getElementById("zonaMiembro").style.display =
      "none";

    document.getElementById("zonaGratis").style.display =
      "none";
  }
});


// =========================
// SUBIR AUTO CORRALON
// =========================

window.guardarVehiculoCorralon = async () => {
  try {
    const user = auth.currentUser;

    if (!user) {
      alert("Inicia sesión");
      return;
    }

    const nombreCorralon =
      document.getElementById("corralonNombre").value;

    const municipio =
      document.getElementById("corralonMunicipio").value;

    const marca =
      document.getElementById("corralonMarca").value;

    const modelo =
      document.getElementById("corralonModelo").value;

    const anio =
      document.getElementById("corralonAnio").value;

    const placas =
      document.getElementById("corralonPlacas").value;

    const serie =
      document.getElementById("corralonSerie").value;

    const adeudo =
      document.getElementById("corralonAdeudo").value;

    const descuento =
      document.getElementById("corralonDescuento").value;

    await addDoc(collection(db, "autosCorralon"), {
      uid: user.uid,
      email: user.email,
      nombreCorralon,
      municipio,
      marca,
      modelo,
      anio,
      placas,
      serie,
      adeudo,
      descuento,
      createdAt: serverTimestamp(),
    });

    alert("Vehículo guardado");

    cargarAutosCorralon();
  } catch (error) {
    alert(error.message);
  }
};


// =========================
// CARGAR AUTOS
// =========================

async function cargarAutosCorralon() {
  const container =
    document.getElementById("autosCorralonLista");

  if (!container) return;

  container.innerHTML = "";

  const q = query(collection(db, "autosCorralon"));

  const snap = await getDocs(q);

  snap.forEach((docu) => {
    const data = docu.data();

    container.innerHTML += `
      <div class="car-card">
        <h3>${data.marca} ${data.modelo}</h3>

        <p><strong>Año:</strong> ${data.anio}</p>

        <p><strong>Placas:</strong> ${data.placas}</p>

        <p><strong>Serie:</strong> ${data.serie}</p>

        <p><strong>Corralón:</strong> ${data.nombreCorralon}</p>

        <p><strong>Municipio:</strong> ${data.municipio}</p>

        <p><strong>Adeudo:</strong> $${data.adeudo}</p>

        ${
          data.descuento === "si"
            ? `<span class="discount-badge">Más de 1 año / descuento</span>`
            : ""
        }
      </div>
    `;
  });
}
