document.addEventListener('DOMContentLoaded', async () => {
  validarToken().then(esValido => {
      if (!esValido) {
        window.location.href = 'login.html';
      }
    });
  const idDespacho = new URLSearchParams(window.location.search).get('id');
  if (!idDespacho) {
    alert('ID de despacho no especificado.');
    return;
  }

  const API_URL = `${CONFIG.API_BASE_URL}/despacho/${idDespacho}`;

  const res = await fetch(API_URL);
  const data = await res.json();

  document.getElementById('nomCliente').value = data.nomCliente;
  document.getElementById('rutCliente').value = data.rutCliente;
  document.getElementById('mailCliente').value = data.mailCliente;
    // Dirección completa
  document.getElementById('direccion').value = `${data.calleDespacho} #${data.numeroCalleDespacho}`;
  document.getElementById('comuna').value = data.comuna;
  document.getElementById('provincia').value = data.provincia;
  document.getElementById('region').value = data.region;


  const fecha = new Date(data.fecDespacho);
  document.getElementById('fecDespacho').value = fecha.toLocaleDateString('es-CL');

  document.getElementById('estadoDespacho').value = data.idEstadoDespacho;
  document.getElementById('codSeguimiento').value = data.codSeguimiento || '';
  document.getElementById('empresaDespacho').value = data.empresaDespacho || '';
  document.getElementById('enlaceSeguimiento').value = data.enlaceSeguimiento || '';

  if (data.fecEstimadaRecepcion) {
    const f = new Date(data.fecEstimadaRecepcion);
    document.getElementById('fecEstimadaRecepcion').value = f.toISOString().split('T')[0];
  }

  document.getElementById('formDespacho').addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      id: idDespacho,
      idEstadoDespacho: document.getElementById('estadoDespacho').value,
      codSeguimiento: document.getElementById('codSeguimiento').value,
      empresaDespacho: document.getElementById('empresaDespacho').value,
      enlaceSeguimiento: document.getElementById('enlaceSeguimiento').value,
      fecEstimadaRecepcion: document.getElementById('fecEstimadaRecepcion').value || null
    };
    console.log(payload)

    const respuesta = await fetch(`${CONFIG.API_BASE_URL}/despacho/${idDespacho}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await respuesta.json();

    if (respuesta.ok) {
      alert('Cambios guardados correctamente');
    } else {
      alert('Error al guardar cambios: ' + result.mensaje);
    }
  });
});
