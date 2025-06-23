function mostrar(tipo) {
    document.getElementById('tablaCategorias').style.display = tipo === 'categorias' ? 'block' : 'none';
    document.getElementById('tablaSubcategorias').style.display = tipo === 'subcategorias' ? 'block' : 'none';
}

function limpiarCategoria() {
    document.getElementById('inputCategoria').value = '';
    document.getElementById('categoriaIdEditar').value = '';
}

function limpiarSubcategoria() {
    document.getElementById('inputSubcategoria').value = '';
    document.getElementById('subcategoriaIdEditar').value = '';
    document.getElementById('selectCategoria').selectedIndex = 0;
}

function editarCategoria(id, nombre) {
    document.getElementById('inputCategoria').value = nombre;
    document.getElementById('categoriaIdEditar').value = id;
}

function editarSubcategoria(id, nombre, categoriaId) {
    document.getElementById('inputSubcategoria').value = nombre;
    document.getElementById('selectCategoria').value = categoriaId;
    document.getElementById('subcategoriaIdEditar').value = id;
}


async function guardarCategoria() {
    const nombre = document.getElementById('inputCategoria').value;
    const id = document.getElementById('categoriaIdEditar').value;

    if (!nombre) return alert("Ingresa el nombre de la categoría");

    if (id) {
        await fetch(`${CONFIG.API_BASE_URL}/producto/categoria/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre })
        });
    } else {
        await fetch(`${CONFIG.API_BASE_URL}/producto/categoria`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ categoria: nombre })
        });
    }

    document.getElementById('inputCategoria').value = '';
    document.getElementById('categoriaIdEditar').value = '';
    await cargarCategorias();
    mostrar('categorias');
}


async function guardarSubcategoria() {
    const nombre = document.getElementById('inputSubcategoria').value;
    const categoria = document.getElementById('selectCategoria').value;
    const id = document.getElementById('subcategoriaIdEditar').value;

    if (!nombre || !categoria) return alert("Completa ambos campos");

    if (id) {
        // Editar
        await fetch(`${CONFIG.API_BASE_URL}/producto/subcategoria/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subcategoria: nombre, categoria })
        });
    } else {
        // Crear nueva
        await fetch(`${CONFIG.API_BASE_URL}/producto/subcategoria`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subcategoria: nombre, categoria })
        });
    }

    document.getElementById('inputSubcategoria').value = '';
    document.getElementById('subcategoriaIdEditar').value = '';
    await cargarSubcategorias();
    mostrar('subcategorias');
}

async function cargarCategorias() {
    const res = await fetch(`${CONFIG.API_BASE_URL}/producto/categoria`);
    const data = await res.json();
    const categorias = data.categoria
    const select = document.getElementById('selectCategoria');
    const tbody = document.getElementById('tbodyCategorias');

    tbody.innerHTML = '';

    categorias.forEach(cat => {
    select.innerHTML += `<option value="${cat.id}">${cat.nombre}</option>`;
    tbody.innerHTML += `<tr>
        <td>${cat.id}</td>
        <td>${cat.nombre}</td>
        <td><a href="#" onclick="editarCategoria(${cat.id}, '${cat.nombre}')">Editar</a></td>
    </tr>`;
    });
}

async function cargarSubcategorias() {
    const res = await fetch(`${CONFIG.API_BASE_URL}/producto/subcategoria`);
    const data = await res.json();
    const subcategorias = data.subcategorias
    const tbody = document.getElementById('tbodySubcategorias');
    tbody.innerHTML = '';

    subcategorias.forEach(sub => {
    tbody.innerHTML += `<tr>
        <td>${sub.id}</td>
        <td>${sub.categoriaNom}</td>
        <td>${sub.nombre}</td>
        <td><a href="#" onclick="editarSubcategoria(${sub.id}, '${sub.nombre}', ${sub.categoria})">Editar</a></td>
    </tr>`;
    });
}

document.addEventListener('DOMContentLoaded', function () {
    
    cargarCategorias();
    cargarSubcategorias();
    
});    