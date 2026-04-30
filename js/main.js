// js/main.js - Funcionalidades principales

// Función para mostrar notificaciones
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#2E7D32' : type === 'error' ? '#F44336' : '#2196F3'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 15px;
        animation: slideIn 0.3s ease;
    `;
    
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

// Función para actualizar el contador del carrito
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((total, item) => total + (item.cantidad || 1), 0);
    
    cartCountElements.forEach(element => {
        if (element) {
            element.textContent = totalItems;
        }
    });
}

// Función para agregar libros al carrito
function addBookToCart(bookData) {
    // Verificar si el usuario está logueado
    if (!Auth.isAuthenticated()) {
        if (confirm('Debes iniciar sesión para agregar libros al carrito. ¿Deseas iniciar sesión ahora?')) {
            window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
        }
        return false;
    }
    
    // Obtener el carrito actual
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Verificar si el libro ya está en el carrito
    const existingIndex = cart.findIndex(item => item.id === bookData.id);
    
    if (existingIndex !== -1) {
        // Incrementar cantidad si ya existe
        cart[existingIndex].cantidad = (cart[existingIndex].cantidad || 1) + 1;
        showNotification(`Se ha añadido otra unidad de "${bookData.titulo}" al carrito`, 'success');
    } else {
        // Agregar nuevo libro al carrito
        const bookWithQuantity = {
            ...bookData,
            cantidad: 1,
            fechaAgregado: new Date().toISOString()
        };
        cart.push(bookWithQuantity);
        showNotification(`"${bookData.titulo}" se ha añadido al carrito`, 'success');
    }
    
    // Guardar en localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Actualizar contador del carrito
    updateCartCount();
    
    return true;
}

// Función para eliminar un libro del carrito
function removeFromCart(itemId) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const itemToRemove = cart.find(item => item.id === itemId);
    
    if (itemToRemove && confirm(`¿Eliminar "${itemToRemove.titulo}" del carrito?`)) {
        cart = cart.filter(item => item.id !== itemId);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showNotification('Libro eliminado del carrito', 'success');
        return true;
    }
    return false;
}

// Función para actualizar la cantidad de un libro en el carrito
function updateCartItemQuantity(itemId, newQuantity) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const itemIndex = cart.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
        if (newQuantity <= 0) {
            // Eliminar el artículo si la cantidad es 0 o menor
            cart.splice(itemIndex, 1);
        } else {
            // Actualizar la cantidad
            cart[itemIndex].cantidad = newQuantity;
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        return true;
    }
    return false;
}

// Función para obtener el carrito
function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

// Función para calcular el total del carrito
function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.precio * (item.cantidad || 1)), 0);
}

// Función para vaciar el carrito
function clearCart() {
    if (confirm('¿Estás seguro de que quieres vaciar todo el carrito?')) {
        localStorage.removeItem('cart');
        updateCartCount();
        showNotification('Carrito vaciado', 'success');
        return true;
    }
    return false;
}

// Función para formatear precio
function formatPrice(price) {
    return '$' + parseFloat(price).toFixed(2) + ' MXN';
}

// Función para obtener el nombre de la carrera
function getCarreraName(carreraCode) {
    const carreras = {
        'informatica': 'Ingeniería en Informática',
        'industrial': 'Ingeniería Industrial',
        'transporte': 'Ingeniería en Transporte',
        'administracion': 'Administración Industrial',
        'matematicas': 'Matemáticas',
        'fisica': 'Física/Química'
    };
    return carreras[carreraCode] || carreraCode;
}

// Inicializar la página principal (index)
function initIndexPage() {
    loadFeaturedBooks();
    setupSearchEvents();
    setupCategoryFilters();
}

// Cargar libros destacados
function loadFeaturedBooks() {
    const booksContainer = document.getElementById('booksContainer');
    if (!booksContainer) return;
    
    const featuredBooks = [
        {
            id: 'calc-001',
            titulo: 'Cálculo Diferencial e Integral',
            autor: 'James Stewart',
            precio: 250,
            estado: 'Como nuevo',
            vendedor: 'Estudiante UPIICSA',
            materia: 'Cálculo',
            carrera: 'todas',
            imagen: null
        },
        {
            id: 'prog-001',
            titulo: 'Fundamentos de Programación',
            autor: 'Luis Joyanes',
            precio: 180,
            estado: 'Subrayado',
            vendedor: 'Estudiante Informática',
            materia: 'Programación',
            carrera: 'informatica',
            imagen: null
        },
        {
            id: 'fis-001',
            titulo: 'Física Universitaria Vol. 1',
            autor: 'Sears & Zemansky',
            precio: 300,
            estado: 'Usado',
            vendedor: 'Estudiante Industrial',
            materia: 'Física',
            carrera: 'todas',
            imagen: null
        },
        {
            id: 'cont-001',
            titulo: 'Contabilidad Administrativa',
            autor: 'David Noel Ramírez',
            precio: 220,
            estado: 'Nuevo',
            vendedor: 'Estudiante Administración',
            materia: 'Contabilidad',
            carrera: 'administracion',
            imagen: null
        }
    ];
    
    booksContainer.innerHTML = featuredBooks.map(book => `
        <div class="book-card">
            <div class="book-image">
                <div class="book-placeholder">
                    <i class="fas fa-book"></i>
                </div>
            </div>
            <div class="book-info">
                <h3 class="book-title">${escapeHtml(book.titulo)}</h3>
                <p class="book-author">Autor: ${escapeHtml(book.autor)}</p>
                <div class="book-meta">
                    <span class="book-condition">${escapeHtml(book.estado)}</span>
                    <span class="book-price">$${book.precio}</span>
                </div>
                <div class="book-actions">
                    <button class="btn-small btn-buy" onclick="addBookToCart({
                        id: '${book.id}',
                        titulo: '${escapeHtml(book.titulo).replace(/'/g, "\\'")}',
                        autor: '${escapeHtml(book.autor).replace(/'/g, "\\'")}',
                        precio: ${book.precio},
                        estado: '${book.estado}',
                        vendedor: '${book.vendedor}',
                        materia: '${book.materia}',
                        carrera: '${book.carrera}'
                    })">
                        <i class="fas fa-shopping-cart"></i> Comprar
                    </button>
                    <button class="btn-small btn-trade" onclick="alert('Función de intercambio disponible en la versión completa')">
                        <i class="fas fa-exchange-alt"></i> Intercambiar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Configurar eventos de búsqueda
function setupSearchEvents() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const query = searchInput.value.trim();
            if (query) {
                searchBooks(query);
            } else {
                alert('Por favor, ingresa un término de búsqueda');
            }
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }
}

// Configurar filtros por categoría
function setupCategoryFilters() {
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            const carrera = this.getAttribute('data-carrera');
            filterByCareer(carrera);
        });
    });
}

// Búsqueda de libros
function searchBooks(query) {
    alert(`Buscando: "${query}" - En la versión completa se mostrarían los resultados`);
}

// Filtrar por carrera
function filterByCareer(carrera) {
    alert(`Filtrando por carrera: ${getCarreraName(carrera)} - En la versión completa se mostrarían los resultados`);
}

// Escapar HTML para prevenir XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Actualizar UI del header
    if (typeof Auth !== 'undefined' && Auth.updateUserActionsUI) {
        Auth.updateUserActionsUI();
    }
    
    // Actualizar contador del carrito
    updateCartCount();
});

// Exportar funciones para uso global
window.Bibliotrueque = {
    addBookToCart,
    updateCartCount,
    removeFromCart,
    updateCartItemQuantity,
    getCart,
    getCartTotal,
    clearCart,
    formatPrice,
    getCarreraName,
    showNotification,
    searchBooks,
    filterByCareer
};

window.addBookToCart = addBookToCart;
window.removeFromCart = removeFromCart;
window.updateCartItemQuantity = updateCartItemQuantity;
window.getCart = getCart;
window.getCartTotal = getCartTotal;
window.clearCart = clearCart;
window.showNotification = showNotification;
window.updateCartCount = updateCartCount;