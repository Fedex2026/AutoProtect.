let auth = null;
let db = null;
let firebaseReady = false;
let usuarioActual = null;
let tipoUsuarioActual = null;

const firebaseConfig = {
  apiKey: "AIzaSyD4DcYkz6PhLSoYWkncpuXVq3NqtYka2CM",
  authDomain: "autoprotect-7dabb.firebaseapp.com",
  projectId: "autoprotect-7dabb",
  storageBucket: "autoprotect-7dabb.firebasestorage.app",
  messagingSenderId: "583827631154",
  appId: "1:583827631154:web:2904409c93b61b7114202b"
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

window.buscarVehiculo = function () {
  alert("Búsqueda iniciada.");
};

window.activarPanico = function () {
  alert("Para activar el botón de pánico inicia sesión como miembro premium.");
  abrirModalClientes();
};

window.mostrarAuthTab = function (tab) {
  document.querySelectorAll(".auth-tab").forEach((btn) => btn.classList.remove("active"));
  document.querySelectorAll(".auth-form").forEach((form) => form.classList.remove("active"));

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
  document.getElementById("codigoCorralon").style.display =
    tipo === "corralon" ? "block" : "none";
};

window.abrirPanel = function (tipo) {
  if (!usuarioActual) {
    alert("Primero inicia sesión o crea tu cuenta.");
    abrirModalClientes();
    return;
  }

  if (tipoUsuarioActual !== tipo) {
    alert("Tu cuenta no tiene permiso para entrar a este panel.");
    return;
  }

  cerrarModalClientes();

  if (tipo === "corralon") document.getElementById("panelCorralon").classList.add("active");
  if (tipo === "miembro") document.getElementById("panelMiembro").classList.add("active");
  if (tipo === "gratis") document.getElementById("panelGratis").classList.add("active");
};

async function iniciarFirebase() {
  try {
    const appMod = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
    const authMod = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
    const fireMod = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");

    const app = appMod.initializeApp(firebaseConfig);
    auth = authMod.getAuth(app);
    db = fireMod.getFirestore(app);
    firebaseReady = true;

    window.registrarUsuario = async function () {
      const nombre = document.getElementById("registroNombre").value.trim();
      const email = document.getElementById("registroEmail").value.trim();
      const password = document.getElementById("registroPassword").value;
      const tipo = document.getElementById("registroTipo").value;
      const codigo = document.getElementById("codigoCorralon").value.trim();

      if (!nombre || !email || !password) return alert("Completa todos los campos.");
      if (password.length < 6) return alert("La contraseña debe tener mínimo 6 caracteres.");
      if (tipo === "corralon" && codigo !== "CORRALON2026") return alert("Código de corralón incorrecto.");

      const cred = await authMod.createUserWithEmailAndPassword(auth, email, password);

      await fireMod.setDoc(fireMod.doc(db, "usuarios", cred.user.uid), {
        uid: cred.user.uid,
        nombre,
        email,
        tipo,
        createdAt: fireMod.serverTimestamp()
      });

      alert("Cuenta creada correctamente.");
    };

    window.loginUsuario = async function () {
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;

      if (!email || !password) return alert("Ingresa correo y contraseña.");

      await authMod.signInWithEmailAndPassword(auth, email, password);
      alert("Sesión iniciada.");
    };

    window.logoutUsuario = async function () {
      await authMod.signOut(auth);
    };

    authMod.onAuthStateChanged(auth, async (user) => {
      usuarioActual = user;

      if (!user) {
        tipoUsuarioActual = null;
        actualizarUI(null, null);
        return;
      }

      const snap = await fireMod.getDoc(fireMod.doc(db, "usuarios", user.uid));
      const data = snap.exists() ? snap.data() : { tipo: "gratis" };

      tipoUsuarioActual = data.tipo;
      actualizarUI(user, tipoUsuarioActual);
    });

  } catch (error) {
    console.error("Error Firebase:", error);
    alert("Firebase no cargó. Revisa que tu script sea type='module' y que Authentication esté activado.");
  }
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

  document.getElementById("btnPanelCorralon").style.display = tipo === "corralon" ? "block" : "none";
  document.getElementById("btnPanelMiembro").style.display = tipo === "miembro" ? "block" : "none";
  document.getElementById("btnPanelGratis").style.display = tipo === "gratis" ? "block" : "none";
}

window.guardarAutoCorralon = function (event) {
  event.preventDefault();
  alert("Primero dejamos listo el login. Después conectamos guardado de corralón.");
};

window.guardarAutoMiembro = function (event) {
  event.preventDefault();
  alert("Primero dejamos listo el login. Después conectamos guardado de miembro.");
};

document.addEventListener("DOMContentLoaded", () => {
  iniciarFirebase();

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") cerrarModalClientes();
  });
});
