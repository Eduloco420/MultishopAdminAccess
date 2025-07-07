const API_CATEGORIAS = `${CONFIG.API_BASE_URL}/producto/categoria`;
const API_SUBCATEGORIAS = `${CONFIG.API_BASE_URL}/producto/subcategoria?categoria=`;
const API_MARCAS = `${CONFIG.API_BASE_URL}/producto/marca?search=`;
const API_SUCURSALES =  `${CONFIG.API_BASE_URL}/sucursal`
const API_CREAR_PRODUCTO = `${CONFIG.API_BASE_URL}/producto`

document.addEventListener('DOMContentLoaded', async () => {
    validarToken().then(esValido => {
      if (!esValido) {
        window.location.href = 'login.html';
      }
    });
    document.getElementById('loading-container').style.display = 'flex';
    await cargarCategorias();
    await cargarSucursales();

    document.getElementById('categoriaSelect').addEventListener('change', cargarSubcategorias);
    if (!window.location.href.includes('editar_producto.html')) {
        document.getElementById('productoForm').addEventListener('submit', enviarFormulario);
    }
    document.getElementById('marcaInput').addEventListener('input', buscarMarcas);
    document.getElementById('loading-container').style.display = 'none';
});

async function cargarCategorias() {
    console.log("Llamando a cargarCategorias...");
    const res = await fetch(API_CATEGORIAS);
    const data = await res.json();
    const categoria = data.categoria

    console.log("Respuesta completa:", data);
    console.log("Array de categorías:", data.categoria);

    const select = document.getElementById('categoriaSelect');
    select.innerHTML = ''; 
    
    const optDefault = document.createElement('option');
    optDefault.value = "";
    optDefault.text = "Seleccione una categoría";
    optDefault.disabled = true;
    optDefault.selected = true;
    select.appendChild(optDefault);

    categoria.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.text = cat.nombre;
        select.appendChild(opt);
    });
}

async function cargarSubcategorias() {
    const idCat = document.getElementById('categoriaSelect').value;
    if (!idCat) return;

    const res = await fetch(API_SUBCATEGORIAS + idCat);
    const data = await res.json();
    const select = document.getElementById('subCategoriaSelect');
    select.innerHTML = '';
    data.forEach(sub => {
        const opt = document.createElement('option');
        opt.value = sub.id;
        opt.text = sub.nombre;
        select.appendChild(opt);
    });
    select.disabled = false;
}

let timeoutBuscarMarca = null;

function buscarMarcas() {
    clearTimeout(timeoutBuscarMarca);
    const texto = document.getElementById('marcaInput').value.trim();

    timeoutBuscarMarca = setTimeout(async () => {
        const res = await fetch(`${API_MARCAS}${encodeURIComponent(texto)}`);
        const data = await res.json();
        mostrarSugerenciasMarca(data);
    }, 300);
}

function mostrarSugerenciasMarca(marcas) {
    const suggestions = document.getElementById('marcaSuggestions');
    suggestions.innerHTML = '';

    if (marcas.length === 0) {
        const nuevo = document.createElement('div');
        nuevo.className = 'list-group-item list-group-item-action';
        nuevo.textContent = `Agregar nueva marca: "${document.getElementById('marcaInput').value}"`;
        nuevo.addEventListener('click', () => seleccionarMarcaNueva());
        suggestions.appendChild(nuevo);
        return;
    }

    marcas.forEach(marca => {
        const item = document.createElement('div');
        item.className = 'list-group-item list-group-item-action';
        item.textContent = marca.nombre;
        item.addEventListener('click', () => seleccionarMarcaExistente(marca));
        suggestions.appendChild(item);
    });
}

function seleccionarMarcaExistente(marca) {
    document.getElementById('marcaInput').value = marca.nombre;
    document.getElementById('marcaInput').dataset.idMarca = marca.id;
    document.getElementById('marcaSuggestions').innerHTML = '';
}

function seleccionarMarcaNueva() {
    const nombre = document.getElementById('marcaInput').value.trim();
    // No tiene ID porque es nueva. Marcamos que será creada
    document.getElementById('marcaInput').dataset.idMarca = 'NUEVA';
    document.getElementById('marcaSuggestions').innerHTML = '';
}

let archivosSeleccionados = [];

document.getElementById('imagenes').addEventListener('change', manejarArchivosSeleccionados);

function manejarArchivosSeleccionados(e) {
    const nuevosArchivos = Array.from(e.target.files);

    // Validamos los formatos permitidos
    const formatosPermitidos = ['image/jpeg', 'image/png', 'image/webp'];

    nuevosArchivos.forEach(archivo => {
        if (!formatosPermitidos.includes(archivo.type)) {
            alert(`El archivo "${archivo.name}" tiene un formato no permitido.`);
            return;
        }

        // Solo agregamos si no está repetido
        if (!archivosSeleccionados.some(a => a.name === archivo.name && a.size === archivo.size)) {
            archivosSeleccionados.push(archivo);
        }
    });

    actualizarListaImagenes();

    e.target.value = null;
}

function actualizarListaImagenes() {
    const lista = document.getElementById('listaImagenes');
    lista.innerHTML = '';

    archivosSeleccionados.forEach((archivo, index) => {
        const div = document.createElement('div');
        div.className = 'd-flex justify-content-between align-items-center border p-2 mb-1';

        const imgPreview = document.createElement('img');
        imgPreview.src = URL.createObjectURL(archivo);
        imgPreview.width = 100;

        const span = document.createElement('span');
        span.textContent = archivo.name;
        span.className = 'ms-3';

        const infoDiv = document.createElement('div');
        infoDiv.className = 'd-flex align-items-center';
        infoDiv.appendChild(imgPreview);
        infoDiv.appendChild(span);

        const btnEliminar = document.createElement('button');
        btnEliminar.type = 'button';
        btnEliminar.className = 'btn btn-sm btn-danger';
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.addEventListener('click', () => eliminarArchivo(index, div));

        div.appendChild(infoDiv);
        div.appendChild(btnEliminar);

        lista.appendChild(div);
    });
}

function eliminarArchivo(index, divElemento) {
    archivosSeleccionados.splice(index, 1);
    divElemento.remove();
}



async function cargarSucursales() {
    const res = await fetch(API_SUCURSALES);
    const data = await res.json();
    const sucursales = data.sucursales
    window.sucursales = sucursales; // lo guardo global para usar en los stocks
}

function agregarEspecificacion() {
    const container = document.getElementById('especificacionesContainer');

    const div = document.createElement('div');
    div.className = 'row mb-2';
    div.innerHTML = `
        <div class="col">
            <input type="text" class="form-control" placeholder="Nombre" name="spec-nombre" maxlength="40">
        </div>
        <div class="col">
            <input type="text" class="form-control" placeholder="Valor" name="spec-valor" maxlength="40">
        </div>
        <div class="col-auto">
            <button type="button" class="btn btn-danger" onclick="this.parentElement.parentElement.remove()">X</button>
        </div>
    `;
    container.appendChild(div);
}

function agregarOpcionStock() {
    const container = document.getElementById('stockContainer');

    const div = document.createElement('div');
    div.className = 'mb-3 border p-3';
    const opcionIndex = container.children.length;

    div.innerHTML = `
        <div class="mb-2">
            <input type="text" class="form-control" placeholder="Opción (ej: Negro, Azul)" maxlength="40" name="stock-opcion">
        </div>
        <div class="stock-sucursales"></div>
        <button type="button" class="btn btn-sm btn-secondary mb-2" onclick="agregarSucursal(this)">Agregar Sucursal</button>
        <button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.remove()">Eliminar Opción</button>
    `;
    container.appendChild(div);
}

function agregarSucursal(button) {
    const divSuc = button.previousElementSibling;
    const div = document.createElement('div');
    div.className = 'row mb-2';
    div.innerHTML = `
        <div class="col">
            <select class="form-select" name="stock-sucursal">
                ${window.sucursales.map(s => `<option value="${s.id}">${s.nomSucursal}</option>`).join('')}
            </select>
        </div>
        <div class="col">
            <input type="number" class="form-control" placeholder="Cantidad" name="stock-cantidad">
        </div>
        <div class="col-auto">
            <button type="button" class="btn btn-danger" onclick="this.parentElement.parentElement.remove()">X</button>
        </div>
    `;
    divSuc.appendChild(div);
}

function nuevaMarca() {
    const nombre = prompt("Ingrese el nombre de la nueva marca:");
    if (!nombre) return;

    // Aquí puedes integrar la llamada a tu API para crear la marca
    // Por ahora solo agrego el option temporalmente:
    const select = document.getElementById('marcaSelect');
    const opt = document.createElement('option');
    opt.value = `NUEVA_${nombre}`;
    opt.text = nombre;
    opt.selected = true;
    select.appendChild(opt);
}

async function enviarFormulario(e) {
    e.preventDefault();

    if (archivosSeleccionados.length === 0) {
        alert('Debe seleccionar al menos una imagen.');
        return;
    }

    const jsonData = construirJson();
    const formData = new FormData();
    formData.append('data', JSON.stringify(jsonData));
        
    document.getElementById('loading-container').style.display = 'flex';


    archivosSeleccionados.forEach(archivo => {
        formData.append('imagenes', archivo);
    });

    const res = await fetch(API_CREAR_PRODUCTO, {
        method: 'POST',
        body: formData
    });

    const respuesta = await res.json();

    if (res.ok) {
        alert(respuesta.mensaje || 'Producto creado exitosamente');
        window.location.href = 'productos.html';
    } else {
        alert(respuesta.mensaje || 'Error al crear producto');
    }

    document.getElementById('loading-container').style.display = 'none';
}

function construirJson() {
    const especificaciones = Array.from(document.querySelectorAll('#especificacionesContainer .row')).map(row => ({
        nombre: row.querySelector('[name="spec-nombre"]').value,
        valor: row.querySelector('[name="spec-valor"]').value
    }));

    const stock = Array.from(document.querySelectorAll('#stockContainer > div')).map(block => {
        const opcion = block.querySelector('[name="stock-opcion"]').value;
        const cantidades = Array.from(block.querySelectorAll('.stock-sucursales .row')).map(row => ({
            sucursal: row.querySelector('[name="stock-sucursal"]').value,
            cant: row.querySelector('[name="stock-cantidad"]').value
        }));
        return { opcion, cantidad: cantidades };
    });

    let precioTexto = document.getElementById('precio').value;
    let precioLimpio = parseInt(precioTexto.replace(/\D/g, ''), 10);  

    return {
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
        precio: precioLimpio,
        especificaciones: especificaciones,
        stock: stock
    };
}
