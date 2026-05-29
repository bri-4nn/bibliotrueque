// js/auth.js - Sistema de autenticación global

// Verificar si el usuario está autenticado
function isAuthenticated() {
    const userLoggedIn = localStorage.getItem('userLoggedIn');
    const userData = localStorage.getItem('userData');
    
    return userLoggedIn === 'true' && userData !== null;
}

// Obtener datos del usuario
function getUserData() {
    if (isAuthenticated()) {
        return JSON.parse(localStorage.getItem('userData'));
    }
    return null;
}

// Redirigir a login si no está autenticado
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

// Verificar si el correo es institucional IPN
function isValidIPNEmail(email) {
    return email.endsWith('@alumno.ipn.mx') || email.endsWith('@ipn.mx');
}

// Cerrar sesión
function logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem('userLoggedIn');
        localStorage.removeItem('userData');
        updateUserActionsUI();
        showNotification('Sesión cerrada correctamente', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }
}

// Iniciar sesión
function login(email, password) {
    // Validar correo IPN
    if (!isValidIPNEmail(email)) {
        throw new Error('Debes usar un correo institucional IPN (@alumno.ipn.mx o @ipn.mx)');
    }
    
    // Validar contraseña (mínimo 6 caracteres)
    if (!password || password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
    }
    
    // Buscar usuario registrado
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email);
    
    if (!user) {
        throw new Error('Usuario no encontrado. Por favor regístrate primero.');
    }
    
    if (user.password !== password) {
        throw new Error('Contraseña incorrecta');
    }
    
    const userData = {
        email: user.email,
        nombre: user.nombre,
        carrera: user.carrera,
        semestre: user.semestre,
        fechaLogin: new Date().toISOString()
    };
    
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userData', JSON.stringify(userData));
    
    return userData;
}

// Registrar usuario
function register(userData) {
    // Validar correo IPN
    if (!isValidIPNEmail(userData.email)) {
        throw new Error('Debes usar un correo institucional IPN (@alumno.ipn.mx o @ipn.mx)');
    }
    
    // Validar que el correo no esté ya registrado
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === userData.email)) {
        throw new Error('Este correo ya está registrado');
    }
    
    // Validar contraseña
    if (userData.password.length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres');
    }
    
    // Guardar usuario
    const newUser = {
        email: userData.email,
        nombre: userData.nombre,
        carrera: userData.carrera,
        semestre: userData.semestre,
        password: userData.password,
        fechaRegistro: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    const sessionData = {
        email: newUser.email,
        nombre: newUser.nombre,
        carrera: newUser.carrera,
        semestre: newUser.semestre,
        fechaLogin: new Date().toISOString()
    };
    
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userData', JSON.stringify(sessionData));
    
    return sessionData;
}

// Actualizar datos del usuario
function updateUserData(updatedData) {
    if (!isAuthenticated()) {
        throw new Error('Usuario no autenticado');
    }
    
    const currentData = getUserData();
    const newData = { ...currentData, ...updatedData };
    
    // Actualizar en la lista de usuarios
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === currentData.email);
    
    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updatedData };
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    localStorage.setItem('userData', JSON.stringify(newData));
    return newData;
}

// Actualizar la UI del header
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
            <button class="action-btn secondary" onclick="logout()" style="cursor: pointer;">
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
    
    // Actualizar contador del carrito
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
}

// Exportar funciones para uso global
window.Auth = {
    isAuthenticated,
    getUserData,
    requireAuth,
    isValidIPNEmail,
    login,
    register,
    logout,
    updateUserData,
    updateUserActionsUI
};