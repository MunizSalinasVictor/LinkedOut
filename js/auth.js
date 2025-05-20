// Simulación de base de datos de usuarios
let users = JSON.parse(localStorage.getItem('users')) || [];

/**
 * Guarda los usuarios en localStorage
 */
function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}

/**
 * Registra un nuevo usuario
 * @param {string} username - Nombre de usuario
 * @param {string} email - Correo electrónico
 * @param {string} password - Contraseña
 * @returns {object} - Objeto con resultado y mensaje
 */
function registerUser(username, email, password) {
    // Verificar si el correo ya está en uso
    const emailExists = users.some(user => user.email === email);
    if (emailExists) {
        return { success: false, message: 'El correo electrónico ya está en uso' };
    }

    // Verificar si el nombre de usuario ya está en uso
    const usernameExists = users.some(user => user.username === username);
    if (usernameExists) {
        return { success: false, message: 'El nombre de usuario ya está en uso' };
    }

    // Crear nuevo usuario
    const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password, // En producción, esto debería estar encriptado
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers();
    
    return { success: true, user: newUser };
}

/**
 * Inicia sesión con un usuario existente
 * @param {string} identifier - Correo o nombre de usuario
 * @param {string} password - Contraseña
 * @returns {object} - Objeto con resultado y mensaje
 */
function loginUser(identifier, password) {
    // Buscar usuario por email o username
    const user = users.find(u => u.email === identifier || u.username === identifier);
    
    if (!user) {
        return { success: false, message: 'Usuario no encontrado' };
    }

    if (user.password !== password) {
        return { success: false, message: 'Contraseña incorrecta' };
    }

    // Guardar usuario actual en localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    return { success: true, user };
}

/**
 * Cierra la sesión del usuario
 */
function logoutUser() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

/**
 * Verifica si hay un usuario autenticado
 * @returns {boolean} - True si hay usuario autenticado
 */
function checkAuth() {
    return localStorage.getItem('currentUser') !== null;
}

/**
 * Obtiene el usuario actual
 * @returns {object|null} - Objeto de usuario o null
 */
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

/**
 * Verifica si un correo está disponible
 * @param {string} email - Correo a verificar
 * @returns {boolean} - True si está disponible
 */
function checkEmailAvailability(email) {
    return !users.some(user => user.email === email);
}

/**
 * Verifica si un nombre de usuario está disponible
 * @param {string} username - Nombre de usuario a verificar
 * @returns {boolean} - True si está disponible
 */
function checkUsernameAvailability(username) {
    return !users.some(user => user.username === username);
}

/**
 * Muestra un mensaje de error en un elemento
 * @param {HTMLElement} element - Elemento donde mostrar el error
 * @param {string} message - Mensaje de error
 */
function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
}

/**
 * Oculta un mensaje de error
 * @param {HTMLElement} element - Elemento con el error
 */
function hideError(element) {
    if (element) {
        element.textContent = '';
        element.style.display = 'none';
    }
}