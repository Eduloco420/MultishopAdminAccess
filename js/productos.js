const API_LISTAR_PRODUCTOS = `${CONFIG.API_BASE_URL}/producto`;
const URL_IMAGEN = `${CONFIG.API_BASE_URL}/uploads/`;

let paginaActual = 1;

async function cargarProductos(pagina = 1) {
    validarToken().then(esValido => {
      if (!esValido) {
        window.location.href = 'login.html';
      }
    });
    const res = await fetch(`${API_LISTAR_PRODUCTOS}?pagina=${pagina}`);
    const data = await res.json();
    mostrarProductos(data.Productos);
    renderPaginador(data.paginaActual, data.paginasTotal);
}

function mostrarProductos(productos) {
    const container = document.getElementById('productContainer');
    container.innerHTML = '';

    productos.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'card product-card';
        card.innerHTML = `
            <img src="${URL_IMAGEN + prod.imagen}" class="card-img-top product-img" alt="${prod.nomProducto}" 
                 onerror="this.src='assets/not-found.png'">
            <div class="card-body">
                <h5 class="card-title">${prod.nomProducto}</h5>
                <p class="card-text">
                    <strong>Marca:</strong> ${prod.nomMarca}<br>
                    <strong>Precio:</strong> $${formatearPrecio(prod.valorOriginal)}
                </p>
                <a href="editar_producto.html?id=${prod.idProducto}" class="btn btn-sm btn-primary">Editar</a>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderPaginador(paginaActual, paginasTotal) {
    const paginador = document.getElementById('paginador');
    paginador.innerHTML = '';

    for (let i = 1; i <= paginasTotal; i++) {
        const li = document.createElement('li');
        li.className = 'page-item' + (i === paginaActual ? ' active' : '');
        const a = document.createElement('a');
        a.className = 'page-link';
        a.textContent = i;
        a.href = '#';
        a.addEventListener('click', e => {
            e.preventDefault();
            cargarProductos(i);
        });
        li.appendChild(a);
        paginador.appendChild(li);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function formatearPrecio(valor) {
    return valor.toLocaleString('es-CL');
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        document.getElementById('loading-container').style.display = 'flex';
        await cargarProductos();
    } catch (error) {
        console.error('Error:', error);
    } finally {
        document.getElementById('loading-container').style.display = 'none';
    }
});