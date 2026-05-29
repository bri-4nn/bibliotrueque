const API_BASE = 'http://localhost:3000/api';

// Función para hacer fetch con token (cuando sea necesario)
async function fetchWithAuth(endpoint, options = {}) {
    const token = Auth.getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Error en la petición');
    }
    return data;
}

// Mostrar notificación (sin cambios)
function showNotification(message, type = 'success') {
    // ... (código igual que antes)
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `<span>${message}</span><button class="notification-close">&times;</button>`;
    notification.style.cssText = `position:fixed; top:20px; right:20px; padding:15px 20px; background:${type === 'success' ? '#2E7D32' : type === 'error' ? '#F44336' : '#2196F3'}; color:white; border-radius:8px; box-shadow:0 5px 15px rgba(0,0,0,0.2); z-index:9999; display:flex; align-items:center; gap:15px; animation:slideIn 0.3s ease;`;
    document.body.appendChild(notification);
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Cargar libros destacados desde API
async function loadFeaturedBooks() {
    const container = document.getElementById('booksContainer');
    if (!container) return;
    try {
        const libros = await fetchWithAuth('/libros?limite=4'); // backend puede aceptar límite, o solo traemos los primeros
        const primeros = libros.slice(0, 4);
        container.innerHTML = primeros.map(book => `
            <div class="book-card">
                <div class="book-image"><div class="book-placeholder"><i class="fas fa-book"></i></div></div>
                <div class="book-info">
                    <h3 class="book-title">${escapeHtml(book.titulo)}</h3>
                    <p class="book-author">Autor: ${escapeHtml(book.autor)}</p>
                    <div class="book-meta">
                        <span class="book-condition">${escapeHtml(book.condicion)}</span>
                        <span class="book-price">$${book.precio_ofertado}</span>
                    </div>
                    <div class="book-actions">
                        <button class="btn-small btn-buy" onclick="addBookToCart(${book.id})">
                            <i class="fas fa-shopping-cart"></i> Comprar
                        </button>
                        <button class="btn-small btn-trade" onclick="proponerTrueque(${book.id})">
                            <i class="fas fa-exchange-alt"></i> Intercambiar
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        showNotification('Error al cargar libros: ' + error.message, 'error');
    }
}

// Agregar al carrito usando API
async function addBookToCart(libroId, cantidad = 1) {
    if (!Auth.isAuthenticated()) {
        if (confirm('Debes iniciar sesión. ¿Ir a login?')) {
            window.location.href = 'login.html';
        }
        return;
    }
    try {
        await fetchWithAuth('/carrito/agregar', {
            method: 'POST',
            body: JSON.stringify({ id_libro: libroId, cantidad })
        });
        showNotification('Libro agregado al carrito', 'success');
        updateCartCount();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Obtener carrito desde API
async function getCart() {
    if (!Auth.isAuthenticated()) return [];
    try {
        return await fetchWithAuth('/carrito');
    } catch {
        return [];
    }
}

// Actualizar contador de carrito
async function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    try {
        const cart = await getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);
        cartCountElements.forEach(el => el.textContent = totalItems);
    } catch (error) {
        console.error('Error actualizando contador:', error);
    }
}

// Eliminar del carrito
async function removeFromCart(carritoId) {
    if (!Auth.isAuthenticated()) return false;
    try {
        await fetchWithAuth(`/carrito/${carritoId}`, { method: 'DELETE' });
        showNotification('Libro eliminado del carrito', 'success');
        updateCartCount();
        return true;
    } catch (error) {
        showNotification(error.message, 'error');
        return false;
    }
}

// Actualizar cantidad (necesita el carritoId y nueva cantidad)
async function updateCartItemQuantity(carritoId, nuevaCantidad) {
    // Nota: nuestra API no tiene endpoint para actualizar cantidad directamente;
    // se puede implementar: PUT /carrito/:id con body { cantidad }
    // Por ahora, eliminamos y volvemos a agregar con nueva cantidad (no óptimo)
    // Mejor implementamos ese endpoint en backend, pero como no está, hacemos así:
    if (nuevaCantidad <= 0) {
        await removeFromCart(carritoId);
    } else {
        // Primero obtener el id_libro desde el carrito (difícil sin datos)
        // Alternativa: crear endpoint de actualización. Simplemente no implementamos cambio de cantidad por ahora.
        showNotification('Cambio de cantidad no disponible aún', 'error');
    }
}

// Obtener total del carrito
async function getCartTotal() {
    const cart = await getCart();
    return cart.reduce((sum, item) => sum + (item.precio_ofertado * item.cantidad), 0);
}

// Finalizar compra (crear venta)
async function checkout() {
    if (!Auth.requireAuth()) return;
    const cart = await getCart();
    if (cart.length === 0) {
        alert('Carrito vacío');
        return;
    }
    // Para simplificar, creamos una venta por cada libro (o se puede agrupar)
    // La API espera una transacción por libro. Preguntamos al usuario.
    if (confirm(`Total: $${await getCartTotal()}\n¿Confirmar compra de todos los libros?`)) {
        try {
            for (const item of cart) {
                // Obtener punto de entrega por defecto (el primero de la lista)
                const puntos = await fetchWithAuth('/puntos-entrega');
                const puntoId = puntos.length ? puntos[0].id : 1;
                await fetchWithAuth('/transacciones/venta', {
                    method: 'POST',
                    body: JSON.stringify({
                        id_libro: item.libro_id,
                        monto: item.precio_ofertado * item.cantidad,
                        punto_encuentro_id: puntoId
                    })
                });
            }
            // Vaciar carrito local (backend ya no tiene carrito, pero debemos limpiar)
            await fetchWithAuth('/carrito', { method: 'DELETE' }); // asumiendo endpoint vaciar carrito
            showNotification('¡Compra realizada con éxito! Los vendedores se contactarán.', 'success');
            setTimeout(() => window.location.href = 'perfil.html', 2000);
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }
}

// Búsqueda de libros (con filtros)
async function searchBooks(query) {
    try {
        const libros = await fetchWithAuth(`/libros?titulo=${encodeURIComponent(query)}`);
        mostrarResultadosBusqueda(libros);
    } catch (error) {
        showNotification('Error en búsqueda', 'error');
    }
}

// Filtrar por carrera
async function filterByCareer(carrera) {
    try {
        const libros = await fetchWithAuth(`/libros?carrera=${carrera}`);
        mostrarResultadosBusqueda(libros);
    } catch (error) {
        showNotification('Error al filtrar', 'error');
    }
}

function mostrarResultadosBusqueda(libros) {
    const container = document.getElementById('booksContainer');
    if (container) {
        container.innerHTML = libros.map(book => `
            <div class="book-card">
                <div class="book-image"><div class="book-placeholder"><i class="fas fa-book"></i></div></div>
                <div class="book-info">
                    <h3 class="book-title">${escapeHtml(book.titulo)}</h3>
                    <p class="book-author">Autor: ${escapeHtml(book.autor)}</p>
                    <div class="book-meta">
                        <span class="book-condition">${escapeHtml(book.condicion)}</span>
                        <span class="book-price">$${book.precio_ofertado}</span>
                    </div>
                    <div class="book-actions">
                        <button class="btn-small btn-buy" onclick="addBookToCart(${book.id})">Comprar</button>
                        <button class="btn-small btn-trade" onclick="proponerTrueque(${book.id})">Intercambiar</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Proponer trueque (a implementar en otra fase)
function proponerTrueque(libroId) {
    alert('Función de trueque en desarrollo');
}

// Helper: escapar HTML
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Inicializar eventos
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('booksContainer')) {
        loadFeaturedBooks();
    }
    updateCartCount();
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) searchBooks(query);
            else alert('Ingresa un término');
        });
    }
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            filterByCareer(card.dataset.carrera);
        });
    });
    const viewAllBtn = document.getElementById('viewAllBtn');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'catalogo.html'; // pendiente
        });
    }
});

// Exponer funciones globales
window.addBookToCart = addBookToCart;
window.updateCartCount = updateCartCount;
window.removeFromCart = removeFromCart;
window.updateCartItemQuantity = updateCartItemQuantity;
window.getCart = getCart;
window.getCartTotal = getCartTotal;
window.checkout = checkout;
window.showNotification = showNotification;
window.searchBooks = searchBooks;
window.filterByCareer = filterByCareer;
window.proponerTrueque = proponerTrueque;