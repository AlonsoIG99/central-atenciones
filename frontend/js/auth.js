// Detectar automáticamente el entorno
const API_URL = (window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1' ||
                 window.location.port === '8000')
    ? 'http://127.0.0.1:8000'  // Desarrollo local
    : 'https://atencion.liderman.net.pe';  // Producción (mismo dominio)

console.log('[Auth] Usando backend:', API_URL);

const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

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
      body: JSON.stringify({ email, password: contraseña })
    });

    if (!response.ok) {
      const data = await response.json();
      mostrarError(data.detail || 'Error al iniciar sesión');
      return;
    }

    const data = await response.json();
    
    // Guardar token, refresh token y datos del usuario
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user_id', data.user_id);
    localStorage.setItem('email', data.email);
    localStorage.setItem('nombre', data.nombre);
    localStorage.setItem('rol', data.rol);
    localStorage.setItem('area', data.area);
    
    // Redirigir al dashboard
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Error:', error);
    mostrarError('Error al conectar con el servidor');
  }
});

function mostrarError(mensaje) {
  const errorMessageDiv = document.getElementById('error-message');
  const errorText = document.getElementById('error-text');
  if (errorText) {
    errorText.textContent = mensaje;
  } else {
    errorMessageDiv.textContent = mensaje;
  }
  errorMessageDiv.classList.remove('hidden');
  setTimeout(() => {
    errorMessageDiv.classList.add('hidden');
  }, 5000);
}

// Verificar si ya está logeado
window.addEventListener('load', () => {
  const token = localStorage.getItem('token');
  if (token) {
    window.location.href = 'index.html';
  }
});
