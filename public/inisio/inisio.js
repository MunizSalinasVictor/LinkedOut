document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    // Verificar si el usuario ya está autenticado
    if (localStorage.getItem('authToken')) {
        window.location.href = '../profile/profile.html';
        return;
    }

    // Envío del formulario
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const identifier = document.getElementById('identifier').value.trim();
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    identifier, // Puede ser email o username
                    password
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                showError(loginError, data.message || 'Credenciales incorrectas');
                return;
            }

            // Login exitoso
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            window.location.href = '/profile.html';
            
        } catch (error) {
            console.error('Error en el inicio de sesión:', error);
            showError(loginError, 'Error al conectar con el servidor');
        }
    });

    // Funciones auxiliares
    function showError(element, message) {
        element.textContent = message;
        element.style.display = 'block';
    }
});