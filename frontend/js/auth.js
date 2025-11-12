const API_URL = 'http://localhost:8000';

const loginForm = document.getElementById('login-form');
const registroForm = document.getElementById('registro-form');
const toggleRegistro = document.getElementById('toggle-registro');
const toggleLogin = document.getElementById('toggle-login');
const errorMessage = document.getElementById('error-message');

// Mostrar/ocultar formularios
toggleRegistro.addEventListener('click', () => {
  loginForm.classList.add('hidden');
  registroForm.classList.remove('hidden');
});

toggleLogin.addEventListener('click', () => {
  registroForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
});

// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const contraseña = document.getElementById('contraseña').value;
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, contraseña })
    });

    if (!response.ok) {
      const data = await response.json();
      mostrarError(data.detail || 'Error al iniciar sesión');
      return;
    }

    const data = await response.json();
    
    // Guardar token y datos del usuario
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user_id', data.user_id);
    localStorage.setItem('rol', data.rol);
    localStorage.setItem('area', data.area);
    
    // Redirigir al dashboard
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Error:', error);
    mostrarError('Error al conectar con el servidor');
  }
});

// Registro
registroForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('reg-email').value;
  const contraseña = document.getElementById('reg-contraseña').value;
  
  try {
    const response = await fetch(`${API_URL}/auth/registro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, contraseña })
    });

    if (!response.ok) {
      const data = await response.json();
      mostrarError(data.detail || 'Error al registrarse');
      return;
    }

    // Registro exitoso, mostrar mensaje y volver a login
    alert('Cuenta creada exitosamente. Inicia sesión con tus credenciales.');
    registroForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    registroForm.reset();
  } catch (error) {
    console.error('Error:', error);
    mostrarError('Error al conectar con el servidor');
  }
});

function mostrarError(mensaje) {
  errorMessage.textContent = mensaje;
  errorMessage.classList.remove('hidden');
  setTimeout(() => {
    errorMessage.classList.add('hidden');
  }, 5000);
}

// Verificar si ya está logeado
window.addEventListener('load', () => {
  const token = localStorage.getItem('token');
  if (token) {
    window.location.href = 'index.html';
  }
});
