document.addEventListener('DOMContentLoaded', function () {
    // Elementos del DOM
    const registerForm = document.getElementById('registerForm');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const usernameError = document.getElementById('usernameError');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const strengthBar = document.getElementById('strengthBar');
    const strengthLevel = document.getElementById('strengthLevel');
    const successModal = document.getElementById('register-success');
    const continueButton = document.getElementById('continue-button');
    const registeredEmailSpan = document.getElementById('registeredEmail');
    const submitBtn = document.getElementById('submitBtn');
    const spinner = document.getElementById('spinner');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    const reqLength = document.getElementById('req-length');
    const reqUppercase = document.getElementById('req-uppercase');
    const reqNumber = document.getElementById('req-number');

    // Variables de estado
    let isUsernameValid = false;
    let isEmailValid = false;
    let isPasswordValid = false;
    let isConfirmPasswordValid = false;
    let isCheckingUsername = false;
    let isCheckingEmail = false;

    const showError = (element, message) => {
        element.textContent = message;
        element.style.display = 'block';
        element.style.color = '#e74c3c';
    };

    const hideError = (element) => {
        element.textContent = '';
        element.style.display = 'none';
    };

    const debounce = (func, delay) => {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    };

    const togglePasswordVisibility = (inputElement, toggleBtn) => {
        const type = inputElement.getAttribute('type') === 'password' ? 'text' : 'password';
        inputElement.setAttribute('type', type);
        const icon = toggleBtn.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    };

    const showSuccess = (email) => {
        registeredEmailSpan.textContent = email;
        successModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        registerForm.reset();
        isUsernameValid = false;
        isEmailValid = false;
        isPasswordValid = false;
        isConfirmPasswordValid = false;
        strengthBar.style.width = '0%';
        strengthLevel.textContent = '';
        reqLength.style.color = '#e74c3c';
        reqUppercase.style.color = '#e74c3c';
        reqNumber.style.color = '#e74c3c';
    };

    const checkAvailability = async (type, value) => {
        if (!value) return { available: false, error: `Ingrese un ${type}` };

        try {
            if (type === 'username') {
                isCheckingUsername = true;
                usernameError.textContent = 'Verificando...';
                usernameError.style.display = 'block';
                usernameError.style.color = '#3498db';
            } else {
                isCheckingEmail = true;
                emailError.textContent = 'Verificando...';
                emailError.style.display = 'block';
                emailError.style.color = '#3498db';
            }

            const response = await fetch(`http://localhost:3001/api/auth/check-${type}?${type}=${encodeURIComponent(value)}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Error en la verificación');
            }

            return data;
        } catch (error) {
            console.error(`Error verificando ${type}:`, error);
            return { 
                available: false, 
                error: error.message || `Error al verificar ${type}` 
            };
        } finally {
            if (type === 'username') isCheckingUsername = false;
            if (type === 'email') isCheckingEmail = false;
        }
    };

    const validateUsername = async (username) => {
        if (isCheckingUsername) return;

        if (username.length < 4) {
            showError(usernameError, 'Mínimo 4 caracteres');
            isUsernameValid = false;
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            showError(usernameError, 'Solo letras, números y _');
            isUsernameValid = false;
            return;
        }

        const { available, error } = await checkAvailability('username', username);

        if (error) {
            showError(usernameError, error);
            isUsernameValid = false;
        } else {
            isUsernameValid = available;
            if (available) {
                hideError(usernameError);
            } else {
                showError(usernameError, error || 'Nombre de usuario no disponible');
            }
        }
    };

    const validateEmail = async (email) => {
        if (isCheckingEmail) return;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            showError(emailError, 'Email no válido');
            isEmailValid = false;
            return;
        }

        const { available, error } = await checkAvailability('email', email);

        if (error) {
            showError(emailError, error);
            isEmailValid = false;
        } else if (available) {
            hideError(emailError);
            isEmailValid = true;
        } else {
            showError(emailError, 'Email ya registrado');
            isEmailValid = false;
        }
    };

    const validatePassword = (password) => {
        reqLength.style.color = password.length >= 6 ? '#2ecc71' : '#e74c3c';
        reqUppercase.style.color = /[A-Z]/.test(password) ? '#2ecc71' : '#e74c3c';
        reqNumber.style.color = /[0-9]/.test(password) ? '#2ecc71' : '#e74c3c';

        const strength = calculatePasswordStrength(password);
        updateStrengthIndicator(strength);

        isPasswordValid = strength >= 40 && password.length >= 6;
    };

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length > 0) strength += 10;
        if (password.length >= 6) strength += 20;
        if (password.length >= 8) strength += 20;
        if (/[A-Z]/.test(password)) strength += 15;
        if (/[0-9]/.test(password)) strength += 15;
        if (/[^A-Za-z0-9]/.test(password)) strength += 20;
        return Math.min(strength, 100);
    };

    const updateStrengthIndicator = (strength) => {
        strengthBar.style.width = `${strength}%`;

        if (strength < 40) {
            strengthBar.style.backgroundColor = '#e74c3c';
            strengthLevel.textContent = 'Débil';
            strengthLevel.style.color = '#e74c3c';
        } else if (strength < 70) {
            strengthBar.style.backgroundColor = '#f39c12';
            strengthLevel.textContent = 'Moderada';
            strengthLevel.style.color = '#f39c12';
        } else {
            strengthBar.style.backgroundColor = '#2ecc71';
            strengthLevel.textContent = 'Fuerte';
            strengthLevel.style.color = '#2ecc71';
        }
    };

    const validateConfirmPassword = (password, confirmPassword) => {
        if (password && confirmPassword && password !== confirmPassword) {
            showError(passwordError, 'Las contraseñas no coinciden');
            isConfirmPasswordValid = false;
        } else {
            hideError(passwordError);
            isConfirmPasswordValid = true;
        }
    };

    // Listeners
    usernameInput.addEventListener('input', debounce((e) => {
        validateUsername(e.target.value.trim());
    }, 500));

    emailInput.addEventListener('input', debounce((e) => {
        validateEmail(e.target.value.trim());
    }, 500));

    usernameInput.addEventListener('blur', () => {
        validateUsername(usernameInput.value.trim());
    });

    emailInput.addEventListener('blur', () => {
        validateEmail(emailInput.value.trim());
    });

    passwordInput.addEventListener('input', (e) => {
        const password = e.target.value;
        validatePassword(password);
        validateConfirmPassword(password, confirmPasswordInput.value);
    });

    confirmPasswordInput.addEventListener('input', (e) => {
        validateConfirmPassword(passwordInput.value, e.target.value);
    });

    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.closest('.password-input-container').querySelector('input');
            togglePasswordVisibility(input, btn);
        });
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        await validateUsername(username);
        await validateEmail(email);
        validatePassword(password);
        validateConfirmPassword(password, confirmPassword);

        if (!isUsernameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
            return;
        }

        submitBtn.disabled = true;
        spinner.style.display = 'inline-block';
        document.querySelector('.btn-text').style.display = 'none';

        try {
            const response = await fetch('http://localhost:3001/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    data.errors.forEach(err => {
                        if (err.param === 'username') showError(usernameError, err.msg);
                        if (err.param === 'email') showError(emailError, err.msg);
                        if (err.param === 'password') showError(passwordError, err.msg);
                    });
                }
                throw new Error(data.message || 'Error en el registro');
            }

            // Guardar token y redirigir
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            
            showSuccess(email);

        } catch (error) {
            console.error('Error en el registro:', error);
            showError(passwordError, error.message || 'Error al conectar con el servidor');
        } finally {
            submitBtn.disabled = false;
            spinner.style.display = 'none';
            document.querySelector('.btn-text').style.display = 'inline';
        }
    });

    continueButton.addEventListener('click', () => {
        // Redirigir a profile.html en el mismo directorio
        window.location.href = '../profile/profile.html';
    });
});