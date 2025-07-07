document.addEventListener('DOMContentLoaded', () => {
  validarToken().then(esValido => {
      if (!esValido) {
        window.location.href = 'login.html';
      }
    });
  document.getElementById('btnBuscar').addEventListener('click', buscarDespachos);
});

async function buscarDespachos() {
  const id = document.getElementById('inputID').value.trim();
  const desde = document.getElementById('inputDesde').value;
  const hasta = document.getElementById('inputHasta').value;

  let url = `${CONFIG.API_BASE_URL}/despachos`;

  const params = [];
  if (id) params.push(`id=${id}`);
  else if (desde && hasta) params.push(`desde=${desde}`, `hasta=${hasta}`);

  if (params.length > 0) {
    url += '?' + params.join('&');
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error al cargar los despachos");
    const data = await res.json();
    console.log(data)
    mostrarDespachos(data);
  } catch (error) {
    alert("Error al obtener los datos");
    console.error(error);
  }
}

function mostrarDespachos(despachos) {
  const tabla = document.getElementById("tablaDespachos");
  tabla.innerHTML = ""; // Limpiar resultados previos

  if (despachos.length === 0) {
    tabla.innerHTML = `<tr><td colspan="8" class="text-center">No se encontraron resultados</td></tr>`;
    return;
  }

  despachos.forEach(d => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${d.id}</td>
      <td>${d.venta}</td>
      <td>${new Date(d.fecDespacho).toLocaleDateString('es-CL', { timeZone: 'America/Santiago' })}</td>
      <td>${d.rutCliente}</td>
      <td>${d.nombreCliente}</td>
      <td>${d.mailCliente}</td>
      <td>${d.glosaEstadoDespacho}</td>
      <td>
        <a href="detalle_despacho.html?id=${d.id}" class="btn btn-sm btn-info">Ver Detalle</a>
      </td>
    `;
    tabla.appendChild(fila);
  });
}


function formatearFecha(fechaStr) {
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString("es-CL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}
