const firebaseConfig = {
  apiKey: "AIzaSyD4DcYkz6PhLSoYWkncpuXVq3NqtYka2CM",
  authDomain: "autoprotect-7dabb.firebaseapp.com",
  projectId: "autoprotect-7dabb",
  storageBucket: "autoprotect-7dabb.firebasestorage.app",
  messagingSenderId: "583827631154",
  appId: "1:583827631154:web:2904409c93b61b7114202b"
};

let auth = null;
let db = null;
let usuarioActual = null;
let tipoUsuarioActual = null;

try {
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
} catch (error) {
  console.log("Firebase error:", error);
}

/* MODALES */
function abrirModalClientes() {
  cerrarModalClientes();
  document.getElementById("modalClientes")?.classList.add("active");
}

function cerrarModalClientes() {
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.classList.remove("active");
  });
}

/* BUSCADOR */
function buscarVehiculo() {
  const placas = document.getElementById("placasInput")?.value || "";
  const marca = document.getElementById("marcaInput")?.value || "";
  const estado = document.getElementById("estadoInput")?.value || "";

  alert(
    "Buscando vehículo...\n\n" +
    "Placas: " + (placas || "Sin placas") +
    "\nMarca: " + (marca || "Sin marca") +
    "\nEstado: " + (estado || "Sin estado")
  );
}

/* PANICO */
function activarPanico() {
  if (!usuarioActual) {
    alert("Primero inicia sesión.");
    abrirModalClientes();
    return;
  }

  if (tipoUsuarioActual === "gratis") {
    alert("El botón de pánico completo es solo para miembros premium.");
    return;
  }

  alert("Botón de pánico activado.");
}

/* LOGIN TABS */
function mostrarAuthTab(tab) {
  document.querySelectorAll(".auth-tab").forEach((btn) => {
    btn.classList.remove("active");
  });

  document.querySelectorAll(".auth-form").forEach((form) => {
    form.classList.remove("active");
  });

  if (tab === "login") {
    document.querySelectorAll(".auth-tab")[0]?.classList.add("active");
    document.getElementById("loginForm")?.classList.add("active");
  } else {
    document.querySelectorAll(".auth-tab")[1]?.classList.add("active");
    document.getElementById("registroForm")?.classList.add("active");
  }
}

function mostrarCampoCodigoCorralon() {
  const tipo = document.getElementById("registroTipo")?.value;
  const campo = document.getElementById("codigoCorralon");

  if (campo) {
    campo.style.display = tipo === "corralon" ? "block" : "none";
  }
}

/* REGISTRO */
async function registrarUsuario() {
  try {
    if (!auth || !db) {
      alert("Firebase no cargó correctamente.");
      return;
    }

    const nombre = document.getElementById("registroNombre").value.trim();
    const email = document.getElementById("registroEmail").value.trim();
    const password = document.getElementById("registroPassword").value;
    const tipo = document.getElementById("registroTipo").value;
    const codigo = document.getElementById("codigoCorralon").value.trim();

    if (!nombre || !email || !password) {
      alert("Completa nombre, correo y contraseña.");
      return;
    }

    if (tipo === "corralon" && codigo !== "CORRALON2026") {
      alert("Código de corralón incorrecto.");
      return;
    }

    const cred = await auth.createUserWithEmailAndPassword(email, password);

    await db.collection("usuarios").doc(cred.user.uid).set({
      uid: cred.user.uid,
      nombre,
      email,
      tipo,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert("Cuenta creada correctamente.");
  } catch (error) {
    alert(error.message);
  }
}

/* LOGIN */
async function loginUsuario() {
  try {
    if (!auth) {
      alert("Firebase no cargó correctamente.");
      return;
    }

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
      alert("Ingresa correo y contraseña.");
      return;
    }

    await auth.signInWithEmailAndPassword(email, password);
    alert("Sesión iniciada.");
  } catch (error) {
    alert(error.message);
  }
}

async function logoutUsuario() {
  if (auth) {
    await auth.signOut();
  }
  cerrarModalClientes();
}

/* PANELES */
function abrirPanel(tipo) {
  if (!usuarioActual) {
    alert("Primero inicia sesión.");
    abrirModalClientes();
    return;
  }

  if (tipoUsuarioActual !== tipo) {
    alert("Tu cuenta no tiene permiso para entrar a este panel.");
    return;
  }

  cerrarModalClientes();

  if (tipo === "corralon") {
    document.getElementById("panelCorralon")?.classList.add("active");
  }

  if (tipo === "miembro") {
    document.getElementById("panelMiembro")?.classList.add("active");
  }

  if (tipo === "gratis") {
    document.getElementById("panelGratis")?.classList.add("active");
  }
}

/* GUARDADOS */
function guardarAutoCorralon(event) {
  event.preventDefault();
  alert("Vehículo de corralón listo para guardar.");
}

function guardarAutoMiembro(event) {
  event.preventDefault();
  alert("Vehículo de miembro listo para guardar.");
}

/* UI LOGIN */
function actualizarUI(user, tipo) {
  const authBox = document.getElementById("authBox");
  const usuarioBox = document.getElementById("usuarioBox");

  if (!authBox || !usuarioBox) return;

  if (!user) {
    authBox.style.display = "block";
    usuarioBox.style.display = "none";
    return;
  }

  authBox.style.display = "none";
  usuarioBox.style.display = "block";

  document.getElementById("usuarioCorreo").innerText = user.email;
  document.getElementById("usuarioTipo").innerText = tipo;

  document.getElementById("btnPanelCorralon").style.display =
    tipo === "corralon" ? "block" : "none";

  document.getElementById("btnPanelMiembro").style.display =
    tipo === "miembro" ? "block" : "none";

  document.getElementById("btnPanelGratis").style.display =
    tipo === "gratis" ? "block" : "none";
}

/* FIREBASE SESION */
if (auth && db) {
  auth.onAuthStateChanged(async (user) => {
    usuarioActual = user;

    if (!user) {
      tipoUsuarioActual = null;
      actualizarUI(null, null);
      return;
    }

    const snap = await db.collection("usuarios").doc(user.uid).get();

    if (!snap.exists) {
      tipoUsuarioActual = "gratis";
      actualizarUI(user, "gratis");
      return;
    }

    const data = snap.data();
    tipoUsuarioActual = data.tipo;

    actualizarUI(user, tipoUsuarioActual);
  });
}

/* BOTONES GENERALES */
document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", (e) => {
    const nav = e.target.closest(".nav a");
    if (nav) {
      e.preventDefault();
      document.querySelectorAll(".nav a").forEach((a) => a.classList.remove("active"));
      nav.classList.add("active");
      alert("Abriendo sección: " + nav.textContent.trim());
    }

    const tab = e.target.closest(".tabs button");
    if (tab) {
      document.querySelectorAll(".tabs button").forEach((b) => b.classList.remove("active"));
      tab.classList.add("active");
      alert("Abriendo pestaña: " + tab.textContent.trim());
    }

    const corralon = e.target.closest(".corralon-card button");
    if (corralon) {
      alert("Buscando vehículos en este corralón.");
    }

    const detalle = e.target.closest(".vehicle-card button");
    if (detalle) {
      alert("Aquí se abrirán los detalles completos del vehículo.");
    }

    const contacto = e.target.closest(".contact-grid button");
    if (contacto) {
      alert("Conectando con la central de AutoProtect.");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      cerrarModalClientes();
    }
  });
});
