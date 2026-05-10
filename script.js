function buscarVehiculo() {
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
}

function activarPanico() {
  const confirmar = confirm(
    "¿Quieres activar el botón de pánico y reportar el robo del vehículo?"
  );

  if (!confirmar) return;

  alert(
    "Alerta activada. Tu reporte fue enviado a la comunidad y a la central de recuperación."
  );
}

function abrirModalClientes() {
  cerrarModales();
  document.getElementById("modalClientes").classList.add("active");
}

function abrirPanel(tipo) {
  cerrarModales();

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

function cerrarModales() {
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.classList.remove("active");
  });
}

function guardarAutoCorralon(event) {
  event.preventDefault();

  const auto = {
    id: Date.now(),
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
  };

  const guardados = JSON.parse(localStorage.getItem("autosCorralon") || "[]");
  guardados.unshift(auto);
  localStorage.setItem("autosCorralon", JSON.stringify(guardados));

  event.target.reset();
  renderCorralon();

  alert("Vehículo guardado en el panel de corralón.");
}

function renderCorralon() {
  const lista = document.getElementById("listaCorralon");
  const autos = JSON.parse(localStorage.getItem("autosCorralon") || "[]");

  if (!lista) return;

  if (autos.length === 0) {
    lista.innerHTML = `<p class="empty">Aún no hay vehículos subidos.</p>`;
    return;
  }

  lista.innerHTML = autos
    .map(
      (auto) => `
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
    `
    )
    .join("");
}

function guardarAutoMiembro(event) {
  event.preventDefault();

  const auto = {
    id: Date.now(),
    nombre: document.getElementById("miembroNombre").value,
    telefono: document.getElementById("miembroTelefono").value,
    marca: document.getElementById("miembroMarca").value,
    modelo: document.getElementById("miembroModelo").value,
    anio: document.getElementById("miembroAnio").value,
    placas: document.getElementById("miembroPlacas").value,
    serie: document.getElementById("miembroSerie").value,
    color: document.getElementById("miembroColor").value,
  };

  const guardados = JSON.parse(localStorage.getItem("autosMiembro") || "[]");
  guardados.unshift(auto);
  localStorage.setItem("autosMiembro", JSON.stringify(guardados));

  event.target.reset();
  renderMiembro();

  alert("Vehículo guardado en tu cuenta premium.");
}

function renderMiembro() {
  const lista = document.getElementById("listaMiembro");
  const autos = JSON.parse(localStorage.getItem("autosMiembro") || "[]");

  if (!lista) return;

  if (autos.length === 0) {
    lista.innerHTML = `<p class="empty">Aún no tienes vehículos registrados.</p>`;
    return;
  }

  lista.innerHTML = autos
    .map(
      (auto) => `
      <div class="saved-item">
        <h4>${auto.marca} ${auto.modelo} ${auto.anio}</h4>
        <p><strong>Propietario:</strong> ${auto.nombre}</p>
        <p><strong>Teléfono:</strong> ${auto.telefono}</p>
        <p><strong>Placas:</strong> ${auto.placas}</p>
        <p><strong>Serie:</strong> ${auto.serie || "Sin serie"}</p>
        <p><strong>Color:</strong> ${auto.color || "Sin color"}</p>
        <span class="badge">Protegido premium</span>
      </div>
    `
    )
    .join("");
}

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
});
