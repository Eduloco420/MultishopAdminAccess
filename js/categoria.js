function mostrar(tipo) {
    document.getElementById('tablaCategorias').style.display = tipo === 'categorias' ? 'block' : 'none';
    document.getElementById('tablaSubcategorias').style.display = tipo === 'subcategorias' ? 'block' : 'none';
}

async function guardarCategoria() {
    const categoria = document.getElementById('inputCategoria').value;
    if (!categoria) return alert("Ingresa el nombre de la categoría");

    await fetch('http://127.0.0.1:5000/producto/categoria', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ categoria })
    });

    document.getElementById('inputCategoria').value = '';
    await cargarCategorias();
    await mostrar('categorias');
}

async function guardarSubcategoria() {
    const subcategoria = document.getElementById('inputSubcategoria').value;
    const categoria = document.getElementById('selectCategoria').value;

    if (!subcategoria || !categoria) return alert("Completa ambos campos");

    await fetch('http://127.0.0.1:5000/producto/subcategoria', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subcategoria: subcategoria, categoria: categoria })
    });

    document.getElementById('inputSubcategoria').value = '';
    await cargarSubcategorias();
    await mostrar('subcategorias');
}

async function cargarCategorias() {
    const res = await fetch('http://127.0.0.1:5000/producto/categoria');
    const data = await res.json();
    const categorias = data.categoria
    const select = document.getElementById('selectCategoria');
    const tbody = document.getElementById('tbodyCategorias');

    tbody.innerHTML = '';

    categorias.forEach(cat => {
    select.innerHTML += `<option value="${cat.id}">${cat.nombre}</option>`;
    tbody.innerHTML += `<tr><td>${cat.id}</td><td>${cat.nombre}</td><td><a href="#">Editar</a></td></tr>`;
    });
}

async function cargarSubcategorias() {
    const res = await fetch('http://127.0.0.1:5000/producto/subcategoria');
    const data = await res.json();
    const subcategorias = data.subcategorias
    const tbody = document.getElementById('tbodySubcategorias');
    tbody.innerHTML = '';

    subcategorias.forEach(sub => {
    tbody.innerHTML += `<tr><td>${sub.id}</td><td>${sub.nombre}</td><td>${sub.categoriaNom}</td><td><a href="#">Editar</a></td></tr>`;
    });
}

document.addEventListener('DOMContentLoaded', function () {
    
    cargarCategorias();
    cargarSubcategorias();
    
});    