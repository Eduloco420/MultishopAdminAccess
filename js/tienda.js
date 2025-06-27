const API_TIENDA = `${CONFIG.API_BASE_URL}/tienda`;

document.addEventListener('DOMContentLoaded', async () => {
  const res = await fetch(API_TIENDA);
  const data = await res.json();

  document.getElementById('nombre').value = data.nombre || '';
  document.getElementById('dominio').value = data.dominio || '';
  document.getElementById('facebook').value = data.facebook || '';
  document.getElementById('instagram').value = data.instagram || '';
  document.getElementById('x').value = data.x || '';
});

document.getElementById('formTienda').addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    nombre: document.getElementById('nombre').value.trim(),
    dominio: document.getElementById('dominio').value.trim(),
    facebook: document.getElementById('facebook').value.trim(),
    instagram: document.getElementById('instagram').value.trim(),
    x: document.getElementById('x').value.trim()
  };

  const res = await fetch(API_TIENDA, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const mensajeDiv = document.getElementById('mensaje');
  if (res.ok) {
    mensajeDiv.textContent = 'Datos actualizados correctamente.';
    mensajeDiv.className = 'alert alert-success';
  } else {
    mensajeDiv.textContent = 'Error al actualizar los datos.';
    mensajeDiv.className = 'alert alert-danger';
  }
});