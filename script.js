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
