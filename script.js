const firebaseConfig = {
  apiKey: "AIzaSyD4DcYkz6PhLSoYWkncpuXVq3NqtYka2CM",
  authDomain: "autoprotect-7dabb.firebaseapp.com",
  projectId: "autoprotect-7dabb",
  storageBucket: "autoprotect-7dabb.firebasestorage.app",
  messagingSenderId: "583827631154",
  appId: "1:583827631154:web:2904409c93b61b7114202b"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

let usuarioActual = null;
let tipoUsuarioActual = null;

function abrirModalClientes() {
  cerrarModalClientes();
  document.getElementById("modalClientes").classList.add("active");
}

function cerrarModalClientes() {
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.classList.remove("active");
  });
}

function buscarVehiculo() {
  alert("Búsqueda iniciada.");
}

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

  alert("Alerta activada.");
}

function mostrarAuthTab(tab) {
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
}

function mostrarCampoCodigoCorralon() {
  const tipo = document.getElementById("registroTipo").value;
  const campo = document.getElementById("codigoCorralon");
  campo.style.display = tipo === "corralon" ? "block" : "none";
}

async function registrarUsuario() {
  try {
    const nombre = document.getElementById("registroNombre").value.trim();
    const email = document.getElementById("registroEmail").value.trim();
    const password = document.getElementById("registroPassword").value;
    const tipo = document.getElementById("registroTipo").value;
    const codigo = document.getElementById("codigoCorralon").value.trim();

    if (!nombre || !email || !password) {
      alert("Completa nombre, correo y contraseña.");
      return;
    }

    if (password.length < 6) {
      alert("La contraseña debe tener mínimo 6 caracteres.");
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
      premiumActivo: tipo === "miembro",
      corralonAutorizado: tipo === "corralon",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert("Cuenta creada correctamente.");
  } catch (error) {
    alert(error.message);
  }
}

async function loginUsuario() {
  try {
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
  await auth.signOut();
  cerrarModalClientes();
}

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
    document.getElementById("panelCorralon").classList.add("active");
    renderCorralon();
  }

  if (tipo === "miembro") {
    document.getElementById("panelMiembro").classList.add("active");
    renderMiembro();
  }

  if (tipo === "gratis") {
    document.getElementById("panelGratis").classList.add("active");
  }
}

async function guardarAutoCorralon(event) {
  event.preventDefault();

  if (!usuarioActual || tipoUsuarioActual !== "corralon") {
    alert("Solo una cuenta de corralón puede subir vehículos.");
    return;
  }

  await db.collection("autosCorralon").add({
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
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  event.target.reset();
  renderCorralon();

  alert("Vehículo guardado.");
}

async function guardarAutoMiembro(event) {
  event.preventDefault();

  if (!usuarioActual || tipoUsuarioActual !== "miembro") {
    alert("Solo una cuenta premium puede registrar vehículos.");
    return;
  }

  await db.collection("autosMiembro").add({
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
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  event.target.reset();
  renderMiembro();

  alert("Vehículo guardado.");
}

async function renderCorralon() {
  const lista = document.getElementById("listaCorralon");
  if (!lista || !usuarioActual) return;

  lista.innerHTML = "Cargando...";

  const snap = await db
    .collection("autosCorralon")
    .where("uid", "==", usuarioActual.uid)
    .get();

  if (snap.empty) {
    lista.innerHTML = `<p class="empty">Aún no hay vehículos subidos.</p>`;
    return;
  }

  lista.innerHTML = "";

  snap.forEach((doc) => {
    const auto = doc.data();

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

  lista.innerHTML = "Cargando...";

  const snap = await db
    .collection("autosMiembro")
    .where("uid", "==", usuarioActual.uid)
    .get();

  if (snap.empty) {
    lista.innerHTML = `<p class="empty">Aún no tienes vehículos registrados.</p>`;
    return;
  }

  lista.innerHTML = "";

  snap.forEach((doc) => {
    const auto = doc.data();

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

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    cerrarModalClientes();
  }
});
