document.addEventListener('DOMContentLoaded', async () => {
  validarToken().then(esValido => {
      if (!esValido) {
        window.location.href = 'login.html';
      }
    });
  const idRetiro = new URLSearchParams(window.location.search).get("id");
  if (!idRetiro) return alert("ID de retiro no encontrado en la URL");

  const response = await fetch(`${CONFIG.API_BASE_URL}/retiro/${idRetiro}`);
  const data = await response.json();

  document.getElementById('venta').value = data.venta;
  document.getElementById('cliente').value = data.nomCliente;
  document.getElementById('rutCliente').value = data.rutCliente;
  document.getElementById('mailCliente').value = data.mailCliente;
  document.getElementById('sucursal').value = data.nomSucursal;
  document.getElementById('fechaRetiro').value = new Date(data.fechaRetiro).toLocaleDateString('es-CL');
  document.getElementById('estadoRetiro').value = data.idEstadoRetiro;

  document.getElementById('formDetalleRetiro').addEventListener('submit', async (e) => {
    e.preventDefault();

    const estadoNuevo = document.getElementById('estadoRetiro').value;

    const res = await fetch(`${CONFIG.API_BASE_URL}/retiro/${idRetiro}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ estadoRetiro: estadoNuevo })
    });

    const result = await res.json();
    if (res.ok) {
      alert("Retiro actualizado con éxito");
    } else {
      alert(result.mensaje || "Error al actualizar el retiro");
    }
  });
});
