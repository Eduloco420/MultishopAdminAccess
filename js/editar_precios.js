const idProducto = new URLSearchParams(window.location.search).get("id");
const API_DETALLE_PRODUCTO = `${CONFIG.API_BASE_URL}/producto/detalle/${idProducto}`;

document.addEventListener('DOMContentLoaded', async () => {
    await cargarDatos();
});

async function cargarDatos() {
    const res = await fetch(API_DETALLE_PRODUCTO);
    const data = await res.json();

    cargarPrecios(data.precios);
    cargarDescuentos(data.descuentos);
}

function getFechaMananaISO() {
    const mañana = new Date();
    mañana.setDate(mañana.getDate() + 1);
    const yyyy = mañana.getFullYear();
    const mm = String(mañana.getMonth() + 1).padStart(2, '0');
    const dd = String(mañana.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function formatearFechaISO(fechaStr) {
    const fecha = new Date(fechaStr);
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function cargarPrecios(precios) {
    const container = document.getElementById('preciosContainer');
    container.innerHTML = '';

    precios.forEach(precio => {
        const hoy = new Date();
        const inicio = new Date(precio.fecInicioVig);

        const esEditable = inicio > hoy;

        const div = document.createElement('div');
        div.className = 'row mb-2 align-items-end';

        div.innerHTML = `
            <div class="col">
                <label>Fecha inicio</label>
                <input type="date" class="form-control" value="${formatearFechaISO(precio.fecInicioVig)}" disabled>
            </div>
            <div class="col">
                <label>Precio</label>
                <input type="number" class="form-control" value="${precio.valorProducto}" ${!esEditable ? 'disabled' : ''}>
            </div>
            <div class="col-auto">
                ${esEditable ? `<button class="btn btn-danger" onclick="eliminarPrecio(${precio.id})">Eliminar</button>` : ''}
            </div>
        `;

        container.appendChild(div);
    });
}

function cargarDescuentos(descuentos) {
    const container = document.getElementById('descuentosContainer');
    container.innerHTML = '';

    descuentos.forEach(desc => {
        const hoy = new Date();
        const inicio = new Date(desc.fecInicVig);
        const fin = new Date(desc.fecTermVig);
        const hoyISO = hoy.toISOString().split('T')[0];

        const vigente = inicio <= hoy && fin >= hoy;
        const futuro = inicio > hoy;

        const div = document.createElement('div');
        div.className = 'row mb-2 align-items-end';

        div.innerHTML = `
            <div class="col">
                <label>Fecha inicio</label>
                <input type="date" class="form-control" value="${formatearFechaISO(desc.fecInicVig)}" ${futuro ? '' : 'disabled'}>
            </div>
            <div class="col">
                <label>Fecha término</label>
                <input type="date" class="form-control" value="${formatearFechaISO(desc.fecTermVig)}" ${futuro || vigente ? '' : 'disabled'}>
            </div>
            <div class="col">
                <label>% Descuento</label>
                <input type="number" class="form-control" value="${desc.porcDescueto}" ${futuro ? '' : 'disabled'}>
            </div>
            <div class="col-auto">
                ${(futuro || vigente) ? `<button class="btn btn-danger" onclick="eliminarDescuento(${desc.id})">Eliminar</button>` : ''}
            </div>
        `;

        container.appendChild(div);
    });
}

function agregarPrecio() {
    const container = document.getElementById('preciosContainer');
    if (container.querySelector('.nuevo-precio')) return;

    const mañana = new Date();
    mañana.setDate(mañana.getDate() + 1);
    const mañanaStr = mañana.toISOString().split('T')[0];

    const div = document.createElement('div');
    div.className = 'row mb-2 align-items-end nuevo-precio';

    div.innerHTML = `
        <div class="col">
            <label>Fecha inicio</label>
            <input type="date" class="form-control" value="${mañanaStr}" min="${mañanaStr}" required>
        </div>
        <div class="col">
            <label>Precio</label>
            <input type="number" class="form-control" required>
        </div>
        <div class="col-auto">
            <button class="btn btn-danger" onclick="this.closest('.row').remove()">Cancelar</button>
        </div>
    `;

    container.appendChild(div);
}

function agregarDescuento() {
    const container = document.getElementById('descuentosContainer');
    if (container.querySelector('.nuevo-descuento')) return;

    const mañana = new Date();
    mañana.setDate(mañana.getDate() + 1);
    const mañanaStr = mañana.toISOString().split('T')[0];

    const div = document.createElement('div');
    div.className = 'row mb-2 align-items-end nuevo-descuento';

    div.innerHTML = `
        <div class="col">
            <label>Fecha inicio</label>
            <input type="date" class="form-control fecha-inicio-descuento" value="${mañanaStr}" min="${mañanaStr}" required>
        </div>
        <div class="col">
            <label>Fecha término</label>
            <input type="date" class="form-control fecha-fin-descuento" min="${mañanaStr}" required>
        </div>
        <div class="col">
            <label>% Descuento</label>
            <input type="number" class="form-control" required>
        </div>
        <div class="col-auto">
            <button class="btn btn-danger" onclick="this.closest('.row').remove()">Cancelar</button>
        </div>
    `;

    container.appendChild(div);

    // Validar que fecha fin no sea menor a inicio
    const inputInicio = div.querySelector('.fecha-inicio-descuento');
    const inputFin = div.querySelector('.fecha-fin-descuento');

    inputInicio.addEventListener('change', () => {
        inputFin.min = inputInicio.value;
        if (inputFin.value < inputInicio.value) {
            inputFin.value = inputInicio.value;
        }
    });
}


async function eliminarPrecio(id) {
    if (confirm('¿Deseas eliminar este precio?')) {
        const res = await fetch(`${CONFIG.API_BASE_URL}/producto/precio/${id}`,{
            method: 'DELETE'
        })
        const data = await res.json();
        if (res.ok) {
            alert(data.mensaje);
            location.reload();
        } else {
            alert(data.mensaje);
        }

    }
}

function eliminarDescuento(id) {
    if (confirm('¿Deseas eliminar este descuento?')) {
        console.log('Eliminar descuento id:', id);
    }
}

async function guardarPrecios() {
    const nuevo = document.querySelector('.nuevo-precio');
    if (!nuevo) {
        alert('No hay precios nuevos que guardar.');
        return;
    }

    const fechaInicio = nuevo.querySelector('input[type="date"]').value;
    const valor = parseFloat(nuevo.querySelector('input[type="number"]').value);

    if (isNaN(valor)) {
        alert('Debes ingresar un valor numérico para el precio.');
        return;
    }

    const body = {
        producto: parseInt(idProducto),
        valorProducto: valor,
        fecInicioVig: fechaInicio
    };

    console.log(body)

    const res = await fetch(`${CONFIG.API_BASE_URL}/producto/precio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    const data = await res.json();
    if (res.ok) {
        alert(data.mensaje || 'Precio guardado correctamente.');
        location.reload();
    } else {
        alert(data.mensaje || 'Error al guardar precio.');
    }
}

async function guardarDescuentos() {
    const nuevo = document.querySelector('.nuevo-descuento');
    if (!nuevo) {
        alert('No hay descuentos nuevos que guardar.');
        return;
    }

    const fechaInicio = nuevo.querySelector('input[type="date"]').value;
    const fechaTermino = nuevo.querySelectorAll('input[type="date"]')[1].value;
    const porcentaje = parseFloat(nuevo.querySelector('input[type="number"]').value);

    if (!fechaInicio || !fechaTermino || isNaN(porcentaje)) {
        alert('Completa todos los campos del descuento.');
        return;
    }

    if (fechaTermino < fechaInicio) {
        alert('La fecha de término no puede ser menor a la fecha de inicio.');
        return;
    }

    const body = {
        producto: parseInt(idProducto),
        porcDescuento: porcentaje,
        fecInicVig: fechaInicio,
        fecTermVig: fechaTermino
    };

    const res = await fetch(`${CONFIG.API_BASE_URL}/producto/descuento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    const data = await res.json();
    if (res.ok) {
        alert(data.mensaje || 'Descuento guardado correctamente.');
        location.reload();
    } else {
        alert(data.mensaje || 'Error al guardar descuento.');
    }
}

