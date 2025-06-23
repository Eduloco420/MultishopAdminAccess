const API_SUCURSALES = `${CONFIG.API_BASE_URL}/sucursal?todos=1`;

async function cargarSucursales() {
  try {
    document.getElementById('loading-container').style.display = 'flex';
    const res = await fetch(API_SUCURSALES);
    const data = await res.json();

    const tbody = document.getElementById('tablaSucursales');
    tbody.innerHTML = '';

    data.sucursales.forEach(sucursal => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${sucursal.nomSucursal}</td>
        <td>${sucursal.direccion}</td>
        <td>${sucursal.comuna}</td>
        <td>${sucursal.provincia}</td>
        <td>${sucursal.region}</td>
        <td>${sucursal.tipoSucursal}</td>
        <td>${sucursal.sucursalActiva ? 'Sí' : 'No'}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="editarSucursal(${sucursal.id})">Editar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (error) {
    alert("Error al cargar las sucursales");
    console.error(error);
  } finally {
    document.getElementById('loading-container').style.display = 'none';
  }
}

function editarSucursal(id) {
  window.location.href = `sucursal_form.html?id=${id}`;
}

document.addEventListener('DOMContentLoaded', cargarSucursales);