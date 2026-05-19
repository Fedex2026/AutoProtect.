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
let contenidoOriginalCards = "";
let listenerVistaActual = null;

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

/* UTILIDADES */
function cortarListenerVista() {
  if (listenerVistaActual) {
    listenerVistaActual();
    listenerVistaActual = null;
  }
}

function obtenerPrimeraFoto(auto) {
  const fotos = Array.isArray(auto.fotos) ? auto.fotos : [];

  if (fotos.length > 0) {
    if (typeof fotos[0] === "string") return fotos[0];
    if (fotos[0]?.url) return fotos[0].url;
    if (fotos[0]?.uri) return fotos[0].uri;
  }

  if (auto.foto) return auto.foto;
  if (auto.fotoUrl) return auto.fotoUrl;
  if (auto.imagen) return auto.imagen;
  if (auto.imagenUrl) return auto.imagenUrl;

  return "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=800&q=80";
}

function valorAuto(auto, campos, defecto) {
  for (const campo of campos) {
    if (auto[campo]) return auto[campo];
  }
  return defecto;
}

function formatearFecha(auto) {
  const fecha = auto.fecha || auto.createdAt || auto.fechaCreacion;

  if (!fecha) return "Sin fecha";

  if (fecha.toDate) {
    return fecha.toDate().toLocaleDateString("es-MX");
  }

  if (typeof fecha === "string") return fecha;

  return "Sin fecha";
}

function activarTabPorTexto(textoBuscado) {
  document.querySelectorAll(".tabs button").forEach((btn) => {
    const texto = btn.textContent.trim().toLowerCase();
    btn.classList.toggle("active", texto.includes(textoBuscado));
  });

  document.querySelectorAll(".nav a").forEach((a) => {
    const texto = a.textContent.trim().toLowerCase();
    a.classList.toggle("active", texto.includes(textoBuscado));
  });
}

/* CONTADORES FIREBASE */
function cargarContadoresFirebase() {
  if (!db) return;

  db.collection("autosRobados").onSnapshot((snapshot) => {
    const total = snapshot.size.toLocaleString("es-MX");

    const totalRobados = document.getElementById("totalRobados");
    const footerRobados = document.getElementById("footerRobados");

    if (totalRobados) totalRobados.innerText = total;
    if (footerRobados) footerRobados.innerText = "+" + total;
  });

  db.collection("localizados").onSnapshot((snapshot) => {
    const total = snapshot.size.toLocaleString("es-MX");

    const totalLocalizados = document.getElementById("totalLocalizados");

    if (totalLocalizados) totalLocalizados.innerText = total;
  });

  db.collection("recuperados").onSnapshot((snapshot) => {
    const total = snapshot.size.toLocaleString("es-MX");

    const totalRecuperados = document.getElementById("totalRecuperados");
    const footerRecuperados = document.getElementById("footerRecuperados");

    if (totalRecuperados) totalRecuperados.innerText = total;
    if (footerRecuperados) footerRecuperados.innerText = "+" + total;
  });
}

/* CARD */
function crearCardAuto(auto, tipo) {
  const primeraFoto = obtenerPrimeraFoto(auto);

  const placas = valorAuto(auto, ["placas", "placa"], "Sin placas");
  const serie = valorAuto(auto, ["serie", "vin"], "Sin serie");
  const marca = valorAuto(auto, ["marca"], "Sin marca");
  const submarca = valorAuto(auto, ["submarca", "modelo"], "Sin submarca");
  const color = valorAuto(auto, ["color"], "Sin color");
  const estado = valorAuto(auto, ["estado", "ubicacion", "municipio"], "Sin estado");
  const fecha = formatearFecha(auto);

  let etiqueta = "🚨 AUTO ROBADO";
  let titulo = "Vehículo robado";

  if (tipo === "localizados") {
    etiqueta = "📍 AUTO LOCALIZADO";
    titulo = "Vehículo localizado";
  }

  if (tipo === "recuperados") {
    etiqueta = "✅ AUTO RECUPERADO";
    titulo = "Vehículo recuperado";
  }

  const destacado = auto.lugarDestacado || auto.lugar || auto.posicion;

  return `
    <article class="vehicle-card">
      ${
        destacado
          ? `<span class="premium">👑 LUGAR PRIVILEGIADO #${destacado}</span>`
          : `<span class="premium">${etiqueta}</span>`
      }

      <img src="${primeraFoto}" alt="auto" />

      <h3>${titulo}</h3>
      <p><strong>Placas:</strong> ${placas}</p>
      <p><strong>Serie:</strong> ${serie}</p>
      <p><strong>Marca:</strong> ${marca}</p>
      <p><strong>Submarca:</strong> ${submarca}</p>
      <p><strong>Color:</strong> ${color}</p>
      <p><strong>Estado:</strong> ${estado}</p>
      <p><strong>Fecha:</strong> ${fecha}</p>

      ${
        auto.recompensa || auto.tieneRecompensa
          ? `<p style="color:gold;font-weight:bold;">🏆 Recompensa ofrecida</p>`
          : ""
      }

      <button>Ver detalles</button>
    </article>
  `;
}

/* INICIO */
function mostrarInicio() {
  cortarListenerVista();

  const contenedor = document.getElementById("cardsRowAutos");
  if (!contenedor) return;

  if (contenidoOriginalCards) {
    contenedor.innerHTML = contenidoOriginalCards;
  }

  activarTabPorTexto("inicio");
  cargarVistaInicioFirebase();
}

function cargarVistaInicioFirebase() {
  if (!db) return;

  const contenedor = document.getElementById("cardsRowAutos");
  if (!contenedor) return;

  cortarListenerVista();

  listenerVistaActual = db.collection("autosRobados")
    .limit(2)
    .onSnapshot((snapshot) => {
      if (snapshot.empty) return;

      contenedor.innerHTML = "";

      const primerAuto = snapshot.docs[0]?.data();

      contenedor.innerHTML += `
        <article class="status-card red">
          <span class="tag">EN VIVO</span>
          <h3>ROBO ACTIVADO</h3>
          <p>Alerta enviada desde AutoProtect</p>
          <div class="map-circle">📍</div>
          <small>${primerAuto?.estado || "Ubicación no disponible"}</small>
        </article>
      `;

      snapshot.forEach((doc) => {
        contenedor.innerHTML += crearCardAuto(doc.data(), "autosRobados");
      });

      contenedor.innerHTML += `
        <article class="reward-card">
          <span>★ RECOMPENSA OFRECIDA</span>
          <h3>${primerAuto?.montoRecompensa ? "$" + primerAuto.montoRecompensa + " MXN" : "CONFIDENCIAL"}</h3>
          <p>A quien proporcione información que ayude a recuperarlo.</p>
          <div class="money-icon">$</div>
          <small>Se mantiene en anonimato 100% confidencial</small>
        </article>
      `;
    });
}

/* LISTAS */
function abrirColeccion(nombreColeccion, tipo, tituloVacio) {
  if (!db) return;

  const contenedor = document.getElementById("cardsRowAutos");
  if (!contenedor) return;

  cortarListenerVista();
  contenedor.innerHTML = "";

  listenerVistaActual = db.collection(nombreColeccion)
    .onSnapshot((snapshot) => {
      contenedor.innerHTML = "";

      if (snapshot.empty) {
        contenedor.innerHTML = `
          <article class="vehicle-card">
            <h3>${tituloVacio}</h3>
            <p>No hay registros todavía.</p>
          </article>
        `;
        return;
      }

      snapshot.forEach((doc) => {
        contenedor.innerHTML += crearCardAuto(doc.data(), tipo);
      });
    });
}

function abrirAutosRobados() {
  activarTabPorTexto("autos robados");
  abrirColeccion("autosRobados", "autosRobados", "Autos robados");
}

function abrirLocalizados() {
  activarTabPorTexto("localizados");
  abrirColeccion("localizados", "localizados", "Autos localizados");
}

function abrirRecuperados() {
  activarTabPorTexto("recuperados");
  abrirColeccion("recuperados", "recuperados", "Autos recuperados");
}

/* BOTONES GENERALES */
document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("cardsRowAutos");

  if (contenedor) {
    contenidoOriginalCards = contenedor.innerHTML;
  }

  cargarContadoresFirebase();
  cargarVistaInicioFirebase();

  document.body.addEventListener("click", (e) => {
    const statBtn = e.target.closest(".stat button");
    if (statBtn) {
      e.preventDefault();
      e.stopPropagation();

      const stat = statBtn.closest(".stat");
      const texto = stat?.innerText.toLowerCase() || "";

      if (texto.includes("autos robados")) {
        abrirAutosRobados();
        return;
      }

      if (texto.includes("localizados")) {
        abrirLocalizados();
        return;
      }

      if (texto.includes("recuperados")) {
        abrirRecuperados();
        return;
      }
    }

    const nav = e.target.closest(".nav a");
    if (nav) {
      e.preventDefault();
      e.stopPropagation();

      const texto = nav.textContent.trim().toLowerCase();

      if (texto.includes("inicio")) {
        mostrarInicio();
        return;
      }

      if (texto.includes("autos robados")) {
        abrirAutosRobados();
        return;
      }

      if (texto.includes("localizados")) {
        abrirLocalizados();
        return;
      }

      if (texto.includes("recuperados")) {
        abrirRecuperados();
        return;
      }

      if (texto.includes("comunidad")) {
        alert("Abriendo sección: Comunidad");
        return;
      }

      if (texto.includes("cómo funciona")) {
        alert("Abriendo sección: Cómo funciona");
        return;
      }

      if (texto.includes("contacto")) {
        alert("Abriendo sección: Contacto");
        return;
      }
    }

    const tab = e.target.closest(".tabs button");
    if (tab) {
      e.preventDefault();
      e.stopPropagation();

      const texto = tab.textContent.trim().toLowerCase();

      if (texto.includes("inicio")) {
        mostrarInicio();
        return;
      }

      if (texto.includes("autos robados")) {
        abrirAutosRobados();
        return;
      }

      if (texto.includes("localizados")) {
        abrirLocalizados();
        return;
      }

      if (texto.includes("recuperados")) {
        abrirRecuperados();
        return;
      }

      if (texto.includes("comunidad")) {
        alert("Abriendo pestaña: Comunidad");
        return;
      }
    }

    const corralon = e.target.closest(".corralon-card button");
    if (corralon) {
      alert("Buscando vehículos en este corralón.");
      return;
    }

    const detalle = e.target.closest(".vehicle-card button");
    if (detalle) {
      alert("Aquí se abrirán los detalles completos del vehículo.");
      return;
    }

    const contacto = e.target.closest(".contact-grid button");
    if (contacto) {
      alert("Conectando con la central de AutoProtect.");
      return;
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      cerrarModalClientes();
    }
  });
});
