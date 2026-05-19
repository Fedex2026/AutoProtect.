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
let autosMemoria = {};

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

function escapeHtml(texto) {
  if (texto === null || texto === undefined) return "";
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function obtenerFotos(auto) {
  const fotos = Array.isArray(auto.fotos) ? auto.fotos : [];

  if (fotos.length > 0) {
    return fotos.map((foto) => {
      if (typeof foto === "string") return foto;
      if (foto?.url) return foto.url;
      if (foto?.uri) return foto.uri;
      return "";
    }).filter(Boolean);
  }

  if (auto.foto) return [auto.foto];
  if (auto.fotoUrl) return [auto.fotoUrl];
  if (auto.imagen) return [auto.imagen];
  if (auto.imagenUrl) return [auto.imagenUrl];

  return [];
}

function obtenerPrimeraFoto(auto) {
  const fotos = obtenerFotos(auto);

  if (fotos.length > 0) return fotos[0];

  return "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=800&q=80";
}

function valorAuto(auto, campos, defecto) {
  for (const campo of campos) {
    if (auto[campo] !== undefined && auto[campo] !== null && auto[campo] !== "") return auto[campo];
  }
  return defecto;
}

function formatearFechaValor(fecha) {
  if (!fecha) return "Sin fecha";

  if (fecha.toDate) {
    return fecha.toDate().toLocaleString("es-MX");
  }

  if (typeof fecha === "string") return fecha;

  return "Sin fecha";
}

function formatearFecha(auto) {
  return formatearFechaValor(auto.fecha || auto.createdAt || auto.fechaCreacion);
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

function guardarAutoMemoria(id, auto, tipo) {
  autosMemoria[id] = {
    ...auto,
    __tipo: tipo
  };
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
function crearCardAuto(auto, tipo, id) {
  guardarAutoMemoria(id, auto, tipo);

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
          ? `<span class="premium">👑 LUGAR PRIVILEGIADO #${escapeHtml(destacado)}</span>`
          : `<span class="premium">${etiqueta}</span>`
      }

      <img src="${escapeHtml(primeraFoto)}" alt="auto" />

      <h3>${titulo}</h3>
      <p><strong>Placas:</strong> ${escapeHtml(placas)}</p>
      <p><strong>Serie:</strong> ${escapeHtml(serie)}</p>
      <p><strong>Marca:</strong> ${escapeHtml(marca)}</p>
      <p><strong>Submarca:</strong> ${escapeHtml(submarca)}</p>
      <p><strong>Color:</strong> ${escapeHtml(color)}</p>
      <p><strong>Estado:</strong> ${escapeHtml(estado)}</p>
      <p><strong>Fecha:</strong> ${escapeHtml(fecha)}</p>

      ${
        auto.recompensa || auto.tieneRecompensa
          ? `<p style="color:gold;font-weight:bold;">🏆 Recompensa ofrecida</p>`
          : ""
      }

      <button class="btn-detalle-auto" data-auto-id="${escapeHtml(id)}">Ver detalles</button>
    </article>
  `;
}

/* DETALLES */
function cerrarDetalleAuto() {
  document.getElementById("modalDetalleAuto")?.classList.remove("active");
}

function abrirDetalleAuto(id) {
  const auto = autosMemoria[id];

  if (!auto) {
    alert("No se encontró la información del reporte.");
    return;
  }

  const modal = document.getElementById("modalDetalleAuto");
  const titulo = document.getElementById("detalleTitulo");
  const contenido = document.getElementById("detalleAutoContenido");

  if (!modal || !contenido) return;

  let tipoTitulo = "Detalle del reporte";

  if (auto.__tipo === "autosRobados") tipoTitulo = "Detalle de auto robado";
  if (auto.__tipo === "localizados") tipoTitulo = "Detalle de auto localizado";
  if (auto.__tipo === "recuperados") tipoTitulo = "Detalle de auto recuperado";

  if (titulo) titulo.innerText = tipoTitulo;

  const fotos = obtenerFotos(auto);
  const latitud = valorAuto(auto, ["latitud", "latitude", "lat"], "");
  const longitud = valorAuto(auto, ["longitud", "longitude", "lng"], "");

  const mapa =
    latitud && longitud
      ? `https://www.google.com/maps?q=${encodeURIComponent(latitud + "," + longitud)}`
      : "";

  contenido.innerHTML = `
    <div class="panel-layout">
      <div class="list-card">
        <h3>Fotos del reporte</h3>
        ${
          fotos.length > 0
            ? fotos.map((foto) => `
              <img src="${escapeHtml(foto)}" alt="foto reporte" style="width:100%;max-height:320px;object-fit:cover;border-radius:16px;margin-bottom:12px;">
            `).join("")
            : `<p>No hay fotos disponibles.</p>`
        }
      </div>

      <div class="list-card">
        <h3>Información completa</h3>

        <p><strong>Placas:</strong> ${escapeHtml(valorAuto(auto, ["placas", "placa"], "Sin placas"))}</p>
        <p><strong>Serie / VIN:</strong> ${escapeHtml(valorAuto(auto, ["serie", "vin"], "Sin serie"))}</p>
        <p><strong>Marca:</strong> ${escapeHtml(valorAuto(auto, ["marca"], "Sin marca"))}</p>
        <p><strong>Submarca / Modelo:</strong> ${escapeHtml(valorAuto(auto, ["submarca", "modelo"], "Sin submarca"))}</p>
        <p><strong>Color:</strong> ${escapeHtml(valorAuto(auto, ["color"], "Sin color"))}</p>
        <p><strong>Estado / Ubicación:</strong> ${escapeHtml(valorAuto(auto, ["estado", "ubicacion", "municipio"], "Sin estado"))}</p>
        <p><strong>Fecha:</strong> ${escapeHtml(formatearFecha(auto))}</p>
        <p><strong>Lugar destacado:</strong> ${escapeHtml(valorAuto(auto, ["lugarDestacado", "lugar", "posicion"], "No"))}</p>
        <p><strong>Recompensa:</strong> ${auto.recompensa || auto.tieneRecompensa ? "Sí" : "No"}</p>
        <p><strong>Monto recompensa:</strong> ${escapeHtml(valorAuto(auto, ["montoRecompensa", "recompensaMonto", "monto"], "Confidencial"))}</p>
        <p><strong>Latitud:</strong> ${escapeHtml(latitud || "Sin latitud")}</p>
        <p><strong>Longitud:</strong> ${escapeHtml(longitud || "Sin longitud")}</p>

        ${
          mapa
            ? `<button onclick="window.open('${mapa}', '_blank')">Abrir ubicación en Google Maps</button>`
            : ""
        }
      </div>
    </div>

    <div class="list-card" style="margin-top:18px;">
      <h3>Datos técnicos guardados</h3>
      ${
        Object.keys(auto)
          .filter((key) => key !== "__tipo" && key !== "fotos")
          .map((key) => {
            const value = auto[key];
            let text = "";

            if (value && value.toDate) text = value.toDate().toLocaleString("es-MX");
            else if (typeof value === "object") text = JSON.stringify(value);
            else text = String(value);

            return `<p><strong>${escapeHtml(key)}:</strong> ${escapeHtml(text)}</p>`;
          }).join("")
      }
    </div>
  `;

  modal.classList.add("active");
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
          <small>${escapeHtml(primerAuto?.estado || "Ubicación no disponible")}</small>
        </article>
      `;

      snapshot.forEach((doc) => {
        contenedor.innerHTML += crearCardAuto(doc.data(), "autosRobados", "inicio_autosRobados_" + doc.id);
      });

      contenedor.innerHTML += `
        <article class="reward-card">
          <span>★ RECOMPENSA OFRECIDA</span>
          <h3>${primerAuto?.montoRecompensa ? "$" + escapeHtml(primerAuto.montoRecompensa) + " MXN" : "CONFIDENCIAL"}</h3>
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
        contenedor.innerHTML += crearCardAuto(doc.data(), tipo, nombreColeccion + "_" + doc.id);
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

/* COMUNIDAD */
function abrirComunidad() {
  if (!db) return;

  activarTabPorTexto("comunidad");

  const contenedor = document.getElementById("cardsRowAutos");
  if (!contenedor) return;

  cortarListenerVista();

  const listaAnterior = document.getElementById("listaReportesComunidad");
  if (listaAnterior) listaAnterior.remove();

  contenedor.innerHTML = `
    <article class="vehicle-card">
      <span class="premium">👥 COMUNIDAD</span>
      <h3>Reporte ciudadano</h3>
      <p>Comparte información si viste un auto sospechoso, abandonado o relacionado con un reporte.</p>

      <input id="comunidadNombre" placeholder="Nombre o anónimo" style="width:100%;margin-bottom:10px;">
      <input id="comunidadZona" placeholder="Zona / Municipio / Estado" style="width:100%;margin-bottom:10px;">
      <input id="comunidadPlacas" placeholder="Placas si las tienes" style="width:100%;margin-bottom:10px;">
      <textarea id="comunidadMensaje" placeholder="Describe lo que viste" style="width:100%;min-height:100px;margin-bottom:10px;"></textarea>

      <button onclick="guardarReporteComunidad()">Enviar reporte</button>
    </article>

    <article class="status-card red">
      <span class="tag">IMPORTANTE</span>
      <h3>Reporta sin exponerte</h3>
      <p>No confrontes a nadie. Solo comparte ubicación, placas, color, marca o fotografías si es seguro.</p>
      <div class="map-circle">📍</div>
      <small>Tu reporte puede ayudar a recuperar un vehículo.</small>
    </article>

    <article class="reward-card">
      <span>★ APOYO CIUDADANO</span>
      <h3>Comunidad activa</h3>
      <p>Más ojos en la calle aumentan la posibilidad de localizar autos robados.</p>
      <div class="money-icon">+</div>
      <small>Reportes ciudadanos y anónimos.</small>
    </article>
  `;

  listenerVistaActual = db.collection("reportesComunidad")
    .onSnapshot((snapshot) => {
      const listaVieja = document.getElementById("listaReportesComunidad");
      if (listaVieja) listaVieja.remove();

      const lista = document.createElement("div");
      lista.id = "listaReportesComunidad";
      lista.className = "cards-row";

      if (snapshot.empty) {
        lista.innerHTML = `
          <article class="vehicle-card">
            <h3>Reportes de comunidad</h3>
            <p>No hay reportes ciudadanos todavía.</p>
          </article>
        `;
      } else {
        snapshot.forEach((doc) => {
          const r = doc.data();

          lista.innerHTML += `
            <article class="vehicle-card">
              <span class="premium">👥 REPORTE CIUDADANO</span>
              <h3>${escapeHtml(r.zona || "Zona no especificada")}</h3>
              <p><strong>Nombre:</strong> ${escapeHtml(r.nombre || "Anónimo")}</p>
              <p><strong>Placas:</strong> ${escapeHtml(r.placas || "Sin placas")}</p>
              <p><strong>Mensaje:</strong> ${escapeHtml(r.mensaje || "Sin mensaje")}</p>
              <p><strong>Fecha:</strong> ${escapeHtml(formatearFechaValor(r.createdAt))}</p>
            </article>
          `;
        });
      }

      contenedor.insertAdjacentElement("afterend", lista);
    });
}

async function guardarReporteComunidad() {
  try {
    if (!db) {
      alert("Firebase no cargó correctamente.");
      return;
    }

    const nombre = document.getElementById("comunidadNombre")?.value.trim() || "Anónimo";
    const zona = document.getElementById("comunidadZona")?.value.trim() || "";
    const placas = document.getElementById("comunidadPlacas")?.value.trim() || "";
    const mensaje = document.getElementById("comunidadMensaje")?.value.trim() || "";

    if (!zona || !mensaje) {
      alert("Escribe al menos zona y mensaje.");
      return;
    }

    await db.collection("reportesComunidad").add({
      nombre,
      zona,
      placas,
      mensaje,
      estado: "pendiente",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    document.getElementById("comunidadNombre").value = "";
    document.getElementById("comunidadZona").value = "";
    document.getElementById("comunidadPlacas").value = "";
    document.getElementById("comunidadMensaje").value = "";

    alert("Reporte enviado correctamente.");
  } catch (error) {
    alert(error.message);
  }
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
    const detalleBtn = e.target.closest(".btn-detalle-auto");
    if (detalleBtn) {
      e.preventDefault();
      e.stopPropagation();
      abrirDetalleAuto(detalleBtn.dataset.autoId);
      return;
    }

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
        abrirComunidad();
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
        abrirComunidad();
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
      cerrarDetalleAuto();
    }
  });
});
