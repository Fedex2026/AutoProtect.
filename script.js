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

const firebaseConfig = {
  apiKey: "PEGA_TU_API_KEY",
  authDomain: "PEGA_TU_AUTH_DOMAIN",
  projectId: "PEGA_TU_PROJECT_ID",
  storageBucket: "PEGA_TU_STORAGE_BUCKET",
  messagingSenderId: "PEGA_TU_MESSAGING_SENDER_ID",
  appId: "PEGA_TU_APP_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let usuarioActual = null;
let tipoUsuarioActual = null;

window.buscarVehiculo = function () {
  const placas = document.getElementById("placasInput").value.trim();
  const marca = document.getElementById("marcaInput").value;
  const estado = document.getElementById("estadoInput").value;

  if (!placas && !marca && !estado) {
    alert("Ingresa placas, marca o estado para buscar.");
    return;
  }

  alert(
    `Búsqueda iniciada:\n\nPlacas: ${placas || "Sin placas"}\nMarca: ${
      marca || "Sin marca"
    }\nEstado: ${estado || "Sin estado"}`
  );
};

window.activarPanico = function () {
  if (!usuarioActual) {
    alert("Inicia sesión para activar el botón de pánico.");
    abrirModalClientes();
    return;
  }

  if (tipoUsuarioActual === "gratis") {
    alert("El botón de pánico completo es beneficio premium.");
    return;
  }

  const confirmar = confirm(
    "¿Quieres activar el botón de pánico y reportar el robo del vehículo?"
  );

  if (!confirmar) return;

  alert(
    "Alerta activada. Tu reporte fue enviado a la comunidad y a la central de recuperación."
  );
};

window.abrirModalClientes = function () {
  cerrarModalClientes();
  document.getElementById("modalClientes").classList.add("active");
};

window.cerrarModalClientes = function () {
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.classList.remove("active");
  });
};

window.mostrarAuthTab = function (tab) {
  document.querySelectorAll(".auth-tab").forEach((btn) => {
    btn.classList.remove("active");
  });

  document.querySelectorAll(".auth-form").forEach((form) => {
    form.classList.remove("active");
  });

  if (tab === "login") {
    document.querySelectorAll(".auth-tab")[0].classList.add("active");
    document.getElementById("loginForm").classList.add("active");
  } else {
    document.querySelectorAll(".auth-tab")[1].classList.add("active");
    document.getElementById("registroForm").classList.add("active");
  }
};

window.mostrarCampoCodigoCorralon = function () {
  const tipo = document.getElementById("registroTipo").value;
  const campo = document.getElementById("codigoCorralon");

  campo.style.display = tipo === "corralon" ? "block" : "none";
};

window.registrarUsuario = async function () {
  try {
    const nombre = document.getElementById("registroNombre").value.trim();
    const email = document.getElementById("registroEmail").value.trim();
    const password = document.getElementById("registroPassword").value;
    const tipo = document.getElementById("registroTipo").value;
    const codigoCorralon = document.getElementById("codigoCorralon").value.trim();

    if (!nombre || !email || !password) {
      alert("Completa nombre, correo y contraseña.");
      return;
    }

    if (password.length < 6) {
      alert("La contraseña debe tener mínimo 6 caracteres.");
      return;
    }

    if (tipo === "corralon" && codigoCorralon !== "CORRALON2026") {
      alert("Código de autorización de corralón incorrecto.");
      return;
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "usuarios", cred.user.uid), {
      uid: cred.user.uid,
      nombre,
      email,
      tipo,
      premiumActivo: tipo === "miembro",
      corralonAutorizado: tipo === "corralon",
      createdAt: serverTimestamp(),
    });

    alert("Cuenta creada correctamente.");
    limpiarRegistro();
  } catch (error) {
    alert(error.message);
  }
};

window.loginUsuario = async function () {
  try {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
      alert("Ingresa correo y contraseña.");
      return;
    }

    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    alert(error.message);
  }
};

window.logoutUsuario = async function () {
  await signOut(auth);
  cerrarModalClientes();
};

window.abrirPanel = async function (tipo) {
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
    document.getElementById("panelCorralon").classList.add("active");
    await renderCorralon();
  }

  if (tipo === "miembro") {
    document.getElementById("panelMiembro").classList.add("active");
    await renderMiembro();
  }

  if (tipo === "gratis") {
    document.getElementById("panelGratis").classList.add("active");
  }
};

window.guardarAutoCorralon = async function (event) {
  event.preventDefault();

  if (!usuarioActual || tipoUsuarioActual !== "corralon") {
    alert("Solo una cuenta de corralón puede subir vehículos.");
    return;
  }

  const auto = {
    uid: usuarioActual.uid,
    email: usuarioActual.email,
    corralon: document.getElementById("corralonNombre").value,
    municipio: document.getElementById("corralonMunicipio").value,
    marca: document.getElementById("corralonMarca").value,
    modelo: document.getElementById("corralonModelo").value,
    anio: document.getElementById("corralonAnio").value,
    placas: document.getElementById("corralonPlacas").value,
    serie: document.getElementById("corralonSerie").value,
    color: document.getElementById("corralonColor").value,
    fechaIngreso: document.getElementById("corralonFecha").value,
    masAnio: document.getElementById("corralonMasAnio").value,
    adeudo: document.getElementById("corralonAdeudo").value,
    estado: "retenido",
    createdAt: serverTimestamp(),
  };

  await addDoc(collection(db, "autosCorralon"), auto);

  event.target.reset();
  await renderCorralon();
  alert("Vehículo guardado en tu panel de corralón.");
};

window.guardarAutoMiembro = async function (event) {
  event.preventDefault();

  if (!usuarioActual || tipoUsuarioActual !== "miembro") {
    alert("Solo una cuenta premium puede registrar vehículos aquí.");
    return;
  }

  const auto = {
    uid: usuarioActual.uid,
    email: usuarioActual.email,
    propietario: document.getElementById("miembroNombre").value,
    telefono: document.getElementById("miembroTelefono").value,
    marca: document.getElementById("miembroMarca").value,
    modelo: document.getElementById("miembroModelo").value,
    anio: document.getElementById("miembroAnio").value,
    placas: document.getElementById("miembroPlacas").value,
    serie: document.getElementById("miembroSerie").value,
    color: document.getElementById("miembroColor").value,
    estado: "protegido",
    createdAt: serverTimestamp(),
  };

  await addDoc(collection(db, "autosMiembro"), auto);

  event.target.reset();
  await renderMiembro();
  alert("Vehículo guardado en tu cuenta premium.");
};

async function renderCorralon() {
  const lista = document.getElementById("listaCorralon");
  if (!lista || !usuarioActual) return;

  lista.innerHTML = `<p class="empty">Cargando vehículos...</p>`;

  const q = query(
    collection(db, "autosCorralon"),
    where("uid", "==", usuarioActual.uid)
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    lista.innerHTML = `<p class="empty">Aún no hay vehículos subidos.</p>`;
    return;
  }

  lista.innerHTML = "";

  snap.forEach((docu) => {
    const auto = docu.data();

    lista.innerHTML += `
      <div class="saved-item">
        <h4>${auto.marca} ${auto.modelo} ${auto.anio}</h4>
        <p><strong>Placas:</strong> ${auto.placas}</p>
        <p><strong>Serie:</strong> ${auto.serie || "Sin serie"}</p>
        <p><strong>Corralón:</strong> ${auto.corralon}</p>
        <p><strong>Municipio:</strong> ${auto.municipio}</p>
        <p><strong>Adeudo:</strong> ${auto.adeudo || "No capturado"}</p>
        <span class="badge ${auto.masAnio === "Sí" ? "" : "red"}">
          ${auto.masAnio === "Sí" ? "Más de 1 año / descuento" : "Ingreso reciente"}
        </span>
      </div>
    `;
  });
}

async function renderMiembro() {
  const lista = document.getElementById("listaMiembro");
  if (!lista || !usuarioActual) return;

  lista.innerHTML = `<p class="empty">Cargando vehículos...</p>`;

  const q = query(
    collection(db, "autosMiembro"),
    where("uid", "==", usuarioActual.uid)
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    lista.innerHTML = `<p class="empty">Aún no tienes vehículos registrados.</p>`;
    return;
  }

  lista.innerHTML = "";

  snap.forEach((docu) => {
    const auto = docu.data();

    lista.innerHTML += `
      <div class="saved-item">
        <h4>${auto.marca} ${auto.modelo} ${auto.anio}</h4>
        <p><strong>Propietario:</strong> ${auto.propietario}</p>
        <p><strong>Teléfono:</strong> ${auto.telefono}</p>
        <p><strong>Placas:</strong> ${auto.placas}</p>
        <p><strong>Serie:</strong> ${auto.serie || "Sin serie"}</p>
        <p><strong>Color:</strong> ${auto.color || "Sin color"}</p>
        <span class="badge">Protegido premium</span>
      </div>
    `;
  });
}

function limpiarRegistro() {
  document.getElementById("registroNombre").value = "";
  document.getElementById("registroEmail").value = "";
  document.getElementById("registroPassword").value = "";
  document.getElementById("codigoCorralon").value = "";
}

function actualizarUIUsuario(user, tipo) {
  const authBox = document.getElementById("authBox");
  const usuarioBox = document.getElementById("usuarioBox");

  const btnCorralon = document.getElementById("btnPanelCorralon");
  const btnMiembro = document.getElementById("btnPanelMiembro");
  const btnGratis = document.getElementById("btnPanelGratis");

  if (!user) {
    authBox.style.display = "block";
    usuarioBox.style.display = "none";
    btnCorralon.style.display = "none";
    btnMiembro.style.display = "none";
    btnGratis.style.display = "none";
    return;
  }

  authBox.style.display = "none";
  usuarioBox.style.display = "block";

  document.getElementById("usuarioCorreo").innerText = user.email;
  document.getElementById("usuarioTipo").innerText = tipo;

  btnCorralon.style.display = tipo === "corralon" ? "block" : "none";
  btnMiembro.style.display = tipo === "miembro" ? "block" : "none";
  btnGratis.style.display = tipo === "gratis" ? "block" : "none";
}

onAuthStateChanged(auth, async (user) => {
  usuarioActual = user;

  if (!user) {
    tipoUsuarioActual = null;
    actualizarUIUsuario(null, null);
    return;
  }

  const ref = doc(db, "usuarios", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    tipoUsuarioActual = "gratis";
    actualizarUIUsuario(user, "gratis");
    return;
  }

  const data = snap.data();
  tipoUsuarioActual = data.tipo;

  actualizarUIUsuario(user, tipoUsuarioActual);
});

document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tabs button");
  const navLinks = document.querySelectorAll(".nav a");
  const vehicleButtons = document.querySelectorAll(".vehicle-card button");
  const contactButtons = document.querySelectorAll(".contact-grid button");
  const corralonButtons = document.querySelectorAll(".corralon-card button");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((btn) => btn.classList.remove("active"));
      tab.classList.add("active");
    });
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      navLinks.forEach((item) => item.classList.remove("active"));
      link.classList.add("active");
    });
  });

  vehicleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      alert("Aquí se abrirán los detalles completos del vehículo.");
    });
  });

  contactButtons.forEach((button) => {
    button.addEventListener("click", () => {
      alert("Conectando con la central de AutoProtect.");
    });
  });

  corralonButtons.forEach((button) => {
    button.addEventListener("click", () => {
      alert("Buscando vehículo en este corralón.");
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") cerrarModalClientes();
  });
});
