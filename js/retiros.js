document.addEventListener('DOMContentLoaded', () => {
    validarToken().then(esValido => {
      if (!esValido) {
        window.location.href = 'login.html';
      }
    });
    document.getElementById('btnBuscar').addEventListener('click', buscarRetiros);
});

async function buscarRetiros() {
    const id = document.getElementById('inputID').value.trim();
    const desde = document.getElementById('inputDesde').value;
    const hasta = document.getElementById('inputHasta').value;

    let url = `${CONFIG.API_BASE_URL}/retiros?`;
    if (id) {
        url += `id=${id}`;
    } else if (desde && hasta) {
        url += `desde=${desde}&hasta=${hasta}`;
    }

    const res = await fetch(url);
    const data = await res.json();
    mostrarRetiros(data);
}

function verDetalleRetiro(id) {
    window.location.href = `detalle_retiro.html?id=${id}`;
}

function mostrarRetiros(retiros) {
    const tbody = document.getElementById('tablaRetiros');
    tbody.innerHTML = '';

    if (!retiros.length) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center">No se encontraron resultados</td></tr>`;
        return;
    }

    retiros.forEach(r => {
        const fecha = new Date(r.fecRetiro);
        const fechaLocal = fecha.toISOString().split('T')[0];

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${r.id}</td>
            <td>${r.venta}</td>
            <td>${fechaLocal}</td>
            <td>${r.rutCliente}</td>
            <td>${r.nombreCliente}</td>
            <td>${r.mailCliente}</td>
            <td>${r.glosaEstadoRetiro}</td>
            <td>
                <button class="btn btn-info btn-sm" onclick="verDetalleRetiro(${r.id})">Ver Detalle</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

