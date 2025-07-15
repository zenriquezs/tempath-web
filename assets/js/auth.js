document.addEventListener('DOMContentLoaded', function() {
    // Toggle password visibility
    const togglePasswordButtons = document.querySelectorAll('.password-toggle');
    
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
        const input = this.parentElement.querySelector('input');
        const isPassword = input.type === 'password';
        
        input.type = isPassword ? 'text' : 'password';
        this.innerHTML = isPassword ? 
            `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>` :
            `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
            </svg>`;
        });
    });

    // Password strength indicator
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
        const strengthBars = document.querySelectorAll('.strength-bar');
        const strengthText = document.querySelector('.strength-text');
        const password = this.value;
        
        // Reset
        strengthBars.forEach(bar => {
            bar.style.backgroundColor = '';
            bar.style.width = '20%';
        });
        
        if (password.length === 0) {
            strengthText.textContent = '';
            return;
        }
        
        let strength = 0;
        if (password.length > 8) strength++;
        if (password.match(/[A-Z]/)) strength++;
        if (password.match(/[0-9]/)) strength++;
        if (password.match(/[^A-Za-z0-9]/)) strength++;
        
        // Update UI
        for (let i = 0; i < strength; i++) {
            if (i === 0) strengthBars[i].style.width = '30%';
            if (i === 1) strengthBars[i].style.width = '60%';
            if (i === 2) strengthBars[i].style.width = '100%';
            
            if (strength === 1) {
            strengthBars[i].style.backgroundColor = '#e74c3c';
            strengthText.textContent = 'Seguridad: débil';
            } else if (strength === 2) {
            strengthBars[i].style.backgroundColor = '#f39c12';
            strengthText.textContent = 'Seguridad: media';
            } else if (strength >= 3) {
            strengthBars[i].style.backgroundColor = '#2ecc71';
            strengthText.textContent = 'Seguridad: fuerte';
            }
        }
        });
    }

    // Form validation
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // Aquí iría la lógica de autenticación con el backend
        console.log('Iniciando sesión...');
        // window.location.href = '../index.html'; // Redirección después de login
        });
    }

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }
        
        // Lógica de registro con el backend
        console.log('Registrando usuario...');
        });
    }

    // Manejo del formulario de recuperación de contraseña
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Simulación de envío exitoso
        const email = document.getElementById('email').value;
        console.log('Enviando enlace de recuperación a:', email);
        
        // Mostrar mensaje de éxito (simulado)
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
        <p><strong>¡Enlace enviado!</strong></p>
        <p>Hemos enviado un enlace para restablecer tu contraseña a ${email}. Revisa tu bandeja de entrada.</p>
        `;
        
        // Insertar antes del formulario
        forgotPasswordForm.parentNode.insertBefore(successMessage, forgotPasswordForm);
        
        // Opcional: Deshabilitar el botón para evitar múltiples envíos
        const submitBtn = forgotPasswordForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enlace enviado';
        
        // Redirección automática después de 5 segundos (opcional)
        setTimeout(() => {
        window.location.href = 'login.html';
        }, 5000);
        });
    }
});