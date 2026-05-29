const API_BASE = 'http://localhost:3000/api';

// Almacenar token y usuario
function setAuthData(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('userData', JSON.stringify(user));
}

// Obtener token
function getToken() {
    return localStorage.getItem('token');
}

// Verificar si el usuario está autenticado
function isAuthenticated() {
    return getToken() !== null;
}

// Obtener datos del usuario desde localStorage (cache)
function getUserData() {
    const data = localStorage.getItem('userData');
    return data ? JSON.parse(data) : null;
}

// Redirigir a login si no autenticado
function requireAuth(redirectTo = 'login.html') {
    if (!isAuthenticated()) {
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage !== 'acceso-denegado.html') {
            localStorage.setItem('redirectAfterLogin', currentPage);
        }
        alert('Debes iniciar sesión para acceder a esta página');
        window.location.href = redirectTo;
        return false;
    }
    return true;
}

// Validar correo IPN (mantenemos la misma función)
function isValidIPNEmail(email) {
    return email.endsWith('@alumno.ipn.mx') || email.endsWith('@ipn.mx');
}

// Cerrar sesión
function logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        updateUserActionsUI();
        showNotification('Sesión cerrada correctamente', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }
}

// Iniciar sesión (API)
async function login(email, password) {
    if (!isValidIPNEmail(email)) {
        throw new Error('Debes usar un correo institucional IPN (@alumno.ipn.mx o @ipn.mx)');
    }
    const response = await fetch(`${API_BASE}/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
    }
    setAuthData(data.token, data.usuario);
    return data.usuario;
}

// Registrar usuario (API)
async function register(userData) {
    if (!isValidIPNEmail(userData.email)) {
        throw new Error('Debes usar un correo institucional IPN (@alumno.ipn.mx o @ipn.mx)');
    }
    const response = await fetch(`${API_BASE}/usuarios/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Error en el registro');
    }
    setAuthData(data.token, data.usuario);
    return data.usuario;
}

// Actualizar datos del perfil (API)
async function updateUserData(updatedData) {
    const token = getToken();
    if (!token) throw new Error('No autenticado');
    const response = await fetch(`${API_BASE}/usuarios/perfil`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar perfil');
    }
    // Actualizar cache local
    const current = getUserData();
    const newUser = { ...current, ...updatedData };
    localStorage.setItem('userData', JSON.stringify(newUser));
    return newUser;
}

// Actualizar UI del header (usando datos reales)
function updateUserActionsUI() {
    const userActions = document.getElementById('userActions');
    if (!userActions) return;
    if (isAuthenticated()) {
        const userData = getUserData();
        userActions.innerHTML = `
            <a href="perfil.html" class="action-btn secondary">
                <i class="fas fa-user"></i>
                <span>${userData.nombre || 'Mi Perfil'}</span>
            </a>
            <a href="vender.html" class="action-btn">
                <i class="fas fa-plus-circle"></i>
                <span>Vender Libro</span>
            </a>
            <a href="carrito.html" class="cart-icon">
                <i class="fas fa-shopping-cart"></i>
                <span class="cart-count">0</span>
            </a>
            <button class="action-btn secondary" onclick="window.Auth.logout()" style="cursor: pointer;">
                <i class="fas fa-sign-out-alt"></i>
                <span>Cerrar Sesión</span>
            </button>
        `;
    } else {
        userActions.innerHTML = `
            <a href="login.html" class="action-btn secondary">
                <i class="fas fa-sign-in-alt"></i>
                <span>Iniciar Sesión</span>
            </a>
            <a href="registro.html" class="action-btn">
                <i class="fas fa-user-plus"></i>
                <span>Registrarse</span>
            </a>
            <a href="carrito.html" class="cart-icon">
                <i class="fas fa-shopping-cart"></i>
                <span class="cart-count">0</span>
            </a>
        `;
    }
    // Actualizar contador del carrito (función global)
    if (typeof window.updateCartCount === 'function') {
        window.updateCartCount();
    }
}

// Exportar funciones globalmente
window.Auth = {
    isAuthenticated,
    getUserData,
    requireAuth,
    isValidIPNEmail,
    login,
    register,
    logout,
    updateUserData,
    updateUserActionsUI,
    getToken
};

// Inicializar UI cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    updateUserActionsUI();
});