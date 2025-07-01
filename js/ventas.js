document.addEventListener('DOMContentLoaded', () => {
  const ventasBody = document.getElementById('ventasBody');
  const loading = document.getElementById('loading-container');

  function mostrarLoading(show) {
    loading.style.display = show ? 'block' : 'none';
  }

  function cargarVentas() {
    mostrarLoading(true);

    fetch(`${CONFIG.API_BASE_URL}/ventas`)
      .then(res => res.json())
      .then(data => {
        mostrarLoading(false);

        if (!data.Ventas || data.Ventas.length === 0) {
          ventasBody.innerHTML = `<tr><td colspan="7" class="text-center">No hay ventas registradas.</td></tr>`;
          return;
        }

        data.Ventas.forEach(venta => {
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
      })
      .catch(error => {
        console.error('Error al cargar ventas:', error);
        mostrarLoading(false);
        ventasBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Error al cargar las ventas.</td></tr>`;
      });
  }

  window.verDetalle = function (id) {
    window.location.href = `detalle-venta.html?id=${id}`;
  };

  cargarVentas();
});
