document.addEventListener('DOMContentLoaded', () => {
  const ventasBody = document.getElementById('ventasBody');
  const loading = document.getElementById('loading-container');
  const inputID = document.getElementById('inputID');
  const inputDesde = document.getElementById('inputDesde');
  const inputHasta = document.getElementById('inputHasta');
  const btnBuscar = document.getElementById('btnBuscar');

  function mostrarLoading(show) {
    loading.style.display = show ? 'flex' : 'none';
  }

  function limpiarTabla() {
    ventasBody.innerHTML = '';
  }

  function renderizarVentas(ventas) {
    limpiarTabla();

    if (ventas.length === 0) {
      ventasBody.innerHTML = `<tr><td colspan="7" class="text-center">No se encontraron resultados.</td></tr>`;
      return;
    }

    ventas.forEach(venta => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${venta.id}</td>
        <td>${venta.nombre}</td>
        <td>${venta.rut}</td>
        <td>${venta.mail}</td>
        <td>${venta.fecVenta}</td>
        <td>${venta.glosaEstadoVenta}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="verDetalle(${venta.id})">Ver Detalle</button>
        </td>
      `;
      ventasBody.appendChild(fila);
    });
  }

  async function buscarVentas() {
    const id = inputID.value.trim();
    const desde = inputDesde.value;
    const hasta = inputHasta.value;

    let url = `${CONFIG.API_BASE_URL}/ventas`;
    const params = new URLSearchParams();

    if (id) params.append('id', id);
    else if (desde && hasta) {
      params.append('desde', desde);
      params.append('hasta', hasta);
    }

    if ([...params].length) url += `?${params.toString()}`;

    mostrarLoading(true);

    try {
      const res = await fetch(url);
      const data = await res.json();
      renderizarVentas(data.Ventas || []);
    } catch (err) {
      console.error('Error al buscar ventas:', err);
      ventasBody.innerHTML = `<tr><td colspan="7" class="text-danger text-center">Error al cargar ventas</td></tr>`;
    } finally {
      mostrarLoading(false);
    }
  }

  window.verDetalle = function (id) {
    window.location.href = `detalle-venta.html?id=${id}`;
  };

  btnBuscar.addEventListener('click', buscarVentas);
});
