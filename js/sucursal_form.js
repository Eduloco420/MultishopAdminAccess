const API_UBICACIONES = `${CONFIG.API_BASE_URL}/ubicaciones`;
const API_SUCURSALES = `${CONFIG.API_BASE_URL}/sucursal`;

const params = new URLSearchParams(window.location.search);
const sucursalId = params.get("id");

let ubicaciones = { regiones: [], provincias: [], comunas: [] };
const CACHE_KEY = "ubicacionesCache";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;  // 24 horas

document.addEventListener("DOMContentLoaded", async () => {
  validarToken().then(esValido => {
      if (!esValido) {
        window.location.href = 'login.html';
      }
    });
  document.getElementById('loading-container').style.display = 'flex';
  await obtenerUbicaciones();
  poblarRegiones();

  document.getElementById("regionSelect").addEventListener("change", () => {
    poblarProvincias();
    limpiarComunas();
  });
  document.getElementById("provinciaSelect").addEventListener("change", poblarComunas);
  document.getElementById("sucursalForm").addEventListener("submit", guardarSucursal);

  if (sucursalId) {
    await cargarSucursal(sucursalId);
    document.getElementById("tituloFormulario").textContent = "Editar Sucursal";
    document.getElementById("estadoContainer").style.display = "block";
  } else {
    document.getElementById("tituloFormulario").textContent = "Crear Sucursal";
    document.getElementById("estadoContainer").style.display = "none";
  }
  document.getElementById('loading-container').style.display = 'none';
});

async function obtenerUbicaciones() {
  const cache = localStorage.getItem(CACHE_KEY);
  if (cache) {
    const data = JSON.parse(cache);
    if (Date.now() - data.timestamp < CACHE_TTL_MS) {
      ubicaciones = data.ubicaciones;
      console.log("Ubicaciones cargadas desde cache");
      return;
    }
  }
  const res = await fetch(API_UBICACIONES);
  const data = await res.json();
  ubicaciones = data;
  localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), ubicaciones }));
  console.log("Ubicaciones cargadas desde servidor");
}

function poblarRegiones() {
  const select = document.getElementById("regionSelect");
  select.innerHTML = '<option value="">Seleccione región</option>';
  ubicaciones.regiones.forEach(region => {
    const opt = document.createElement("option");
    opt.value = region.id;
    opt.textContent = region.nombre;
    select.appendChild(opt);
  });
}

function poblarProvincias() {
  const idRegion = parseInt(document.getElementById("regionSelect").value);
  const selectProv = document.getElementById("provinciaSelect");
  selectProv.innerHTML = '<option value="">Seleccione provincia</option>';
  
  ubicaciones.provincias
    .filter(prov => prov.region === idRegion)
    .forEach(prov => {
      const opt = document.createElement("option");
      opt.value = prov.id;
      opt.textContent = prov.nombre;
      selectProv.appendChild(opt);
    });

  selectProv.disabled = false;
}

function poblarComunas() {
  const idProvincia = parseInt(document.getElementById("provinciaSelect").value);
  const selectComuna = document.getElementById("comunaSelect");
  selectComuna.innerHTML = '<option value="">Seleccione comuna</option>';

  ubicaciones.comunas
    .filter(comuna => comuna.provincia === idProvincia)
    .forEach(comuna => {
      const opt = document.createElement("option");
      opt.value = comuna.id;
      opt.textContent = comuna.nombre;
      selectComuna.appendChild(opt);
    });

  selectComuna.disabled = false;
}

function limpiarComunas() {
  const selectComuna = document.getElementById("comunaSelect");
  selectComuna.innerHTML = '<option value="">Seleccione comuna</option>';
  selectComuna.disabled = true;
}

async function cargarSucursal(id) {
  const res = await fetch(`${API_SUCURSALES}/${id}`);
  const data = await res.json();

  document.getElementById("nomSucursal").value = data.nomSucursal;
  document.getElementById("direccion").value = data.direccion;
  document.getElementById("tipoSucursalSelect").value = data.tipoSucursal;

  document.getElementById("regionSelect").value = data.regionSucursal;
  poblarProvincias();
  document.getElementById("provinciaSelect").value = data.provinciaSucursal;
  poblarComunas();
  document.getElementById("comunaSelect").value = data.comunaSucursal;

  document.getElementById("vigenteCheck").checked = (data.activaSucursal == 1);
}

async function guardarSucursal(e) {
          
  e.preventDefault();

  document.getElementById('loading-container').style.display = 'flex';

  const sucursal = {
    nomSucursal: document.getElementById("nomSucursal").value,
    direccion: document.getElementById("direccion").value,
    comuna: parseInt(document.getElementById("comunaSelect").value),
    tipoSucursal: parseInt(document.getElementById("tipoSucursalSelect").value)
  };

  if (sucursalId) {
    sucursal.activaSucursal = document.getElementById("vigenteCheck").checked ? 1 : 0;
    }


  let res;
  if (sucursalId) {
    res = await fetch(`${API_SUCURSALES}/${sucursalId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sucursal)
    });
  } else {
    res = await fetch(API_SUCURSALES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sucursal)
    });
  }

  document.getElementById('loading-container').style.display = 'none';

  if (res.ok) {
    alert("Sucursal guardada exitosamente");
    window.location.href = "sucursales.html";
  } else {
    const error = await res.json();
    alert(error.mensaje || "Error al guardar");
  }
}
