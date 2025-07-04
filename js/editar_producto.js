const idProducto = new URLSearchParams(window.location.search).get("id");
const API_DETALLE_PRODUCTO = `${CONFIG.API_BASE_URL}/producto/detalle/${idProducto}`;

document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('loading-container').style.display = 'flex';
    await cargarCategorias();
    await cargarSucursales();
    await cargarDatosProducto();
    const btnGuardarStock = document.getElementById('btnGuardarStock');
    if (btnGuardarStock) {
        btnGuardarStock.addEventListener('click', guardarStock);
    }
    document.getElementById('loading-container').style.display = 'none';
});

function redirigirEditarPrecios() {
    window.location.href = `editar_precios.html?id=${idProducto}`;
}

async function cargarDatosProducto() {
    const res = await fetch(API_DETALLE_PRODUCTO);
    const data = await res.json();
    console.log(data)

    // Datos básicos
    document.getElementById('nomProducto').value = data.nomProducto;
    document.getElementById('descProducto').value = data.descProducto;
    document.getElementById('opcion').value = data.opcion;

    // Categoría y subcategoría
    document.getElementById('categoriaSelect').value = data.idCat;
    await cargarSubcategorias();
    document.getElementById('subCategoriaSelect').value = data.idSubCat;

    // Marca
    document.getElementById('marcaInput').value = data.nomMarca;
    document.getElementById('marcaInput').dataset.idMarca = data.idMarca;

    // Checkboxes
    document.getElementById('retiroSucursal').checked = data.retiroSucursal == 1;
    document.getElementById('despachoDomicilio').checked = data.despachoDomicilio == 1;
    document.getElementById('productoActivo').checked = data.productoActivo == 1;

    // Especificaciones
    data.especificaciones.forEach(spec => {
        const container = document.getElementById('especificacionesContainer');

        const div = document.createElement('div');
        div.dataset.idSpec = spec.id;
        div.className = 'row mb-2';
        div.innerHTML = `
            <div class="col">
                <input type="text" class="form-control" placeholder="Nombre" name="spec-nombre" maxlength="40" value="${spec.nombre}">
            </div>
            <div class="col">
                <input type="text" class="form-control" placeholder="Valor" name="spec-valor" maxlength="40" value="${spec.valor}">
            </div>
            <div class="col-auto">
                <button type="button" class="btn btn-danger">X</button>
            </div>
        `;

        // Evento de eliminación al presionar la X
        div.querySelector('button').addEventListener('click', () => eliminarEspecificacionExistente(spec.id, div));

        container.appendChild(div);
    });


    // Imágenes actuales (solo mostrar, sin editar aún)
    data.imagenes.forEach(img => {
    const div = document.createElement('div');
    div.className = 'd-flex justify-content-between align-items-center border p-2 mb-1';

    div.innerHTML = `
        <div class="d-flex align-items-center">
            <img src="http://127.0.0.1:5000/uploads/${img.imagen}" alt="Imagen Producto" width="100">
            <span class="ms-3">${img.imagen}</span>
        </div>
        <button type="button" class="btn btn-sm btn-danger">Eliminar</button>
    `;

    div.querySelector('button').addEventListener('click', () => eliminarImagenExistente(img.id, div));

    document.getElementById('listaImagenes').appendChild(div);
    });

    // Stock
    const stockAgrupado = agruparStockPorOpcion(data.stock);
    const stockContainer = document.getElementById('stockExistenteContainer');
    stockContainer.innerHTML = '';  // Limpia antes de cargar

    stockAgrupado.forEach(opcionData => {
        const div = document.createElement('div');
        div.className = 'mb-3 border p-3';

        const opcion = opcionData.opcion;
        const sucursales = opcionData.sucursales;

        const divTitulo = document.createElement('div');
    
        const inputOpcion = document.createElement('input');
        inputOpcion.type = 'text';
        inputOpcion.className = 'form-control mb-2';
        inputOpcion.name = 'stock-opcion';
        inputOpcion.value = opcion;
        inputOpcion.setAttribute('data-idopcion', sucursales[0].idOpcion); // asumimos que todas las sucursales tienen la misma idOpcion

        div.appendChild(inputOpcion);

        const inputActivo = document.createElement('input');
        inputActivo.type = 'checkbox';
        inputActivo.className = 'form-check-input';
        inputActivo.name = 'stock-opcion-activa';
        inputActivo.checked = sucursales[0].opcionActiva == 1;

        const labelActivo = document.createElement('label');
        labelActivo.className = 'form-check-label ms-2';
        labelActivo.textContent = 'Opción activa';

        const divCheck = document.createElement('div');
        divCheck.className = 'form-check mb-2';
        divCheck.appendChild(inputActivo);
        divCheck.appendChild(labelActivo);

        div.appendChild(divCheck);

        div.appendChild(divTitulo);

        const stockSucursales = document.createElement('div');
        stockSucursales.className = 'stock-sucursales mt-2';

        sucursales.forEach(suc => {
            const row = document.createElement('div');
            row.className = 'row mb-2';

            row.innerHTML = `
                <div class="col">
                    <label>Sucursal</label>
                    <input class="form-control" value="${suc.nomSucursal}" readonly>
                </div>
                <div class="col">
                    <label>Stock actual</label>
                    <input class="form-control" value="${suc.cantidad}" readonly>
                </div>
                <div class="col">
                    <label>Aumentar en</label>
                    <input class="form-control" name="stock-cantidad" 
                        data-idopcion="${suc.id}" 
                        data-idsucursal="${suc.idSucursal}">
                </div>
            `;

            stockSucursales.appendChild(row);
        });

        div.appendChild(stockSucursales);
        const btnAgregarSucursal = document.createElement('button');
        btnAgregarSucursal.type = 'button';
        btnAgregarSucursal.className = 'btn btn-sm btn-secondary mt-2';
        btnAgregarSucursal.textContent = 'Agregar Sucursal';
        btnAgregarSucursal.addEventListener('click', () => agregarSucursal(btnAgregarSucursal));

        div.appendChild(btnAgregarSucursal);

        
        stockContainer.appendChild(div);
    });

}

async function guardarStock() {
    const movimientos = [];

    // === 1. OPCIONES EXISTENTES ===
    const contenedorExistente = document.getElementById('stockExistenteContainer');
    const bloquesExistentes = contenedorExistente ? contenedorExistente.querySelectorAll('.border') : [];

    console.log("bloques existentes: ", bloquesExistentes)

    bloquesExistentes.forEach(bloque => {
        const inputOpcion = bloque.querySelector('input[name="stock-opcion"]');
        const nombreOpcion = inputOpcion?.value.trim();
        const checkActivo = bloque.querySelector('input[name="stock-opcion-activa"]');
        const opcionActiva = checkActivo?.checked ? 1 : 0;

        if (!nombreOpcion) return;

        const filas = bloque.querySelectorAll('.stock-sucursales .row');
        filas.forEach(fila => {
            const cantidadInput = fila.querySelector('[name="stock-cantidad"]');

            const idSucursal = cantidadInput ? parseInt(cantidadInput.dataset.idsucursal) : null;
            const idOpcionFila = cantidadInput ? parseInt(cantidadInput.dataset.idopcion) : null;

            console.log('opcion id: ', idOpcionFila)

            const cantidad = cantidadInput ? parseInt(cantidadInput.value) : null;
            const cantidadFinal = isNaN(cantidad) ? null : cantidad;

            if (!isNaN(idSucursal)) {
                movimientos.push({
                    producto: parseInt(idProducto),
                    opcion: {
                        id: idOpcionFila,
                        nombre: nombreOpcion,
                        activa: opcionActiva
                    },
                    sucursal: idSucursal,
                    cantidad: cantidadFinal
                });
            }
        });
    });

    // === 2. NUEVAS OPCIONES ===
    const contenedorNuevo = document.getElementById('stockContainer');
    const bloquesNuevos = contenedorNuevo ? contenedorNuevo.querySelectorAll('div.border') : [];

    bloquesNuevos.forEach(bloque => {
        const inputOpcion = bloque.querySelector('input[name="stock-opcion"]');
        const nombreOpcion = inputOpcion?.value.trim();
        if (!nombreOpcion) return;

        const filas = bloque.querySelectorAll('.stock-sucursales .row');
        filas.forEach(fila => {
            const sucursalInput = fila.querySelector('[name="stock-sucursal"]');
            const cantidadInput = fila.querySelector('[name="stock-cantidad"]');

            const idSucursal = parseInt(sucursalInput?.value);
            const cantidad = cantidadInput ? parseInt(cantidadInput.value) : null;
            const cantidadFinal = isNaN(cantidad) ? null : cantidad;

            if (!isNaN(idSucursal)) {
                movimientos.push({
                    producto: parseInt(idProducto),
                    opcion: {
                        id: null,
                        nombre: nombreOpcion
                    },
                    sucursal: idSucursal,
                    cantidad: cantidadFinal
                });
            }
        });
    });

    document.getElementById('loading-container').style.display = 'flex';

    console.log(movimientos)

    try {
        const res = await fetch(`${CONFIG.API_BASE_URL}/producto/opciones`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(movimientos)
        });

        const data = await res.json();

        if (res.ok) {
            alert(data.mensaje || "Stock actualizado correctamente.");
            location.reload()
        } else {
            alert(data.mensaje || "Ocurrió un error al actualizar el stock.");
            alert(data.error || "");
        }
    } catch (error) {
        alert("Error de red: " + error.message);
    }

    document.getElementById('loading-container').style.display = 'none';
}


async function guardarEspecificaciones() {
    const filas = document.querySelectorAll('#especificacionesContainer .row');
    const lista = [];

    filas.forEach(row => {
        const nombre = row.querySelector('[name="spec-nombre"]').value.trim();
        const valor = row.querySelector('[name="spec-valor"]').value.trim();

        if (!nombre || !valor) return;

        const id = row.dataset.idSpec ? parseInt(row.dataset.idSpec) : null;

        lista.push({
            id,
            nombre,
            valor,
            producto: idProducto // puedes incluirlo si tu backend lo requiere
        });
    });

    if (lista.length === 0) {
        alert("No hay especificaciones válidas para guardar.");
        return;
    }

    document.getElementById('loading-container').style.display = 'flex';

    const res = await fetch(`${CONFIG.API_BASE_URL}/producto/especificacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lista)
    });

    const data = await res.json();

    document.getElementById('loading-container').style.display = 'none';

    if (res.ok) {
        alert(data.mensaje || "Especificaciones guardadas con éxito.");
        location.reload()
    } else {
        alert(data.mensaje || "Ocurrió un error al guardar las especificaciones.");
    }
}

async function eliminarEspecificacionExistente(idEspecificacion, elementoHTML) {
    if (!confirm("¿Eliminar esta especificación?")) return;

    const res = await fetch(`${CONFIG.API_BASE_URL}/producto/especificacion/${idEspecificacion}`, {
        method: 'DELETE'
    });

    const data = await res.json();

    if (res.ok) {
        elementoHTML.remove();
    } else {
        alert(data.mensaje || "No se pudo eliminar la especificación.");
    }
}


async function eliminarImagenExistente(idImagen, divElemento) {
    if (!confirm("¿Estás seguro de eliminar esta imagen?")) return;

    const res = await fetch(`${CONFIG.API_BASE_URL}/uploads/${idImagen}`, {
        method: 'DELETE'
    });

    const data = await res.json();
    if (res.ok) {
        divElemento.remove();
    } else {
        alert(data.mensaje || "Error al eliminar la imagen.");
    }
}

function agruparStockPorOpcion(stockList) {
    const mapa = {};
    stockList.forEach(item => {
        if (!mapa[item.glosaOpcion]) {
            mapa[item.glosaOpcion] = [];
        }
        mapa[item.glosaOpcion].push(item);
    });

    return Object.entries(mapa).map(([opcion, sucursales]) => ({
        opcion,
        sucursales
    }));
}

async function enviarFormularioEditar(e) {
    e.preventDefault();

    const formData = new FormData();

    // Construcción de los datos principales
    const jsonData = {
        nomProducto: document.getElementById('nomProducto').value,
        descProducto: document.getElementById('descProducto').value,
        subCategoria: document.getElementById('subCategoriaSelect').value,
        marca: {
            nueva: document.getElementById('marcaInput').dataset.idMarca === 'NUEVA',
            id: document.getElementById('marcaInput').dataset.idMarca === 'NUEVA' ? null : document.getElementById('marcaInput').dataset.idMarca,
            nombre: document.getElementById('marcaInput').value
        },
        opcion: document.getElementById('opcion').value,
        retiroSucursal: document.getElementById('retiroSucursal').checked ? "1" : "0",
        despachoDomicilio: document.getElementById('despachoDomicilio').checked ? "1" : "0",
        productoActivo: document.getElementById('productoActivo').checked ? "1" : "0"
    };

    formData.append('data', JSON.stringify(jsonData));

    archivosSeleccionados.forEach(archivo => {
        formData.append('imagenes', archivo);
    });

    console.log(formData)

    document.getElementById('loading-container').style.display = 'flex';

    const res = await fetch(`${CONFIG.API_BASE_URL}/producto/${idProducto}`, {
        method: 'PUT',
        body: formData
    });

    const data = await res.json();

    if (res.ok) {
        alert(data.mensaje || "Producto editado correctamente");
    } else {
        alert(data.mensaje || "Error al editar el producto");
    }

    document.getElementById('loading-container').style.display = 'none';
}
