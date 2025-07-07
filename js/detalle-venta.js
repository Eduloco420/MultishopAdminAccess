document.addEventListener('DOMContentLoaded', () => {
  validarToken().then(esValido => {
      if (!esValido) {
        window.location.href = 'login.html';
      }
    });
  const loading = document.getElementById('loading-container');
  const infoVenta = document.getElementById('infoVenta');
  const productosBody = document.getElementById('productosBody');
  const pagosBody = document.getElementById('pagosBody');
  const totalVentaCell = document.getElementById('totalVenta');

  document.getElementById('btnGuardarEstado').addEventListener('click', async () => {
    const nuevoEstado = parseInt(document.getElementById('estadoVenta').value);

    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/ventas/estado/${ventaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estadoVenta: nuevoEstado })
      });

      const data = await res.json();

      if (res.ok) {
        alert('Estado actualizado correctamente');
        location.reload();  // Recarga para mostrar el nuevo estado
      } else {
        alert(data.mensaje || 'Error al actualizar el estado');
        alert(data.error)
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('Error inesperado al actualizar el estado');
    }
  });


  const params = new URLSearchParams(window.location.search);
  const ventaId = params.get('id');

  if (!ventaId) {
    infoVenta.innerHTML = `<div class="alert alert-danger">No se ha especificado una venta válida.</div>`;
    return;
  }

  function mostrarLoading(show) {
    loading.style.display = show ? 'block' : 'none';
  }

  function cargarDetalleVenta(id) {
    mostrarLoading(true);
    fetch(`${CONFIG.API_BASE_URL}/ventas/${id}`)
      .then(res => res.json())
      .then(data => {
        mostrarLoading(false);

        const info = data.info;
        const productos = data.productos;
        const pagos = data.Pagos;

        document.getElementById('estadoVenta').value = info.estadoVenta;

        // Mostrar info cliente + venta
        infoVenta.innerHTML = `
          <div class="card">
            <div class="card-body">
              <p><strong>Cliente:</strong> ${info.nombre} (${info.rut})</p>
              <p><strong>Email:</strong> ${info.mail}</p>
              <p><strong>Fecha:</strong> ${new Date(info.fechaVenta).toLocaleString()}</p>
              <p><strong>Estado:</strong> ${info.glosaEstadoVenta}</p>
              <p><strong>Tipo Entrega:</strong> ${info.tipoEntrega}</p>
            </div>
          </div>
        `;

        // Mostrar productos
        productosBody.innerHTML = '';
        let totalVenta = 0;

        productos.forEach(prod => {
          totalVenta += prod.valorTotal;

          productosBody.innerHTML += `
            <tr>
              <td>${prod.nomProducto}</td>
              <td>${prod.nomMarca}</td>
              <td>${prod.glosaOpcion}</td>
              <td>${prod.cantidad}</td>
              <td>$${prod.valorProducto.toLocaleString()}</td>
              <td>${prod.porcDescuento}%</td>
              <td>$${prod.valorTotal.toLocaleString()}</td>
            </tr>
          `;
        });

        totalVentaCell.textContent = `$${totalVenta.toLocaleString()}`;

        // Mostrar pagos
        pagosBody.innerHTML = '';
        pagos.forEach(pago => {
          pagosBody.innerHTML += `
            <tr>
              <td>${pago.nroTarjeta}</td>
              <td>$${pago.MontoPago.toLocaleString()}</td>
              <td>${pago.glosaEstadoPago}</td>
            </tr>
          `;
        });
      })
      .catch(err => {
        console.error('Error al cargar detalle de venta:', err);
        infoVenta.innerHTML = `<div class="alert alert-danger">No se pudo cargar la información de la venta.</div>`;
        mostrarLoading(false);
      });
  }

  cargarDetalleVenta(ventaId);
});