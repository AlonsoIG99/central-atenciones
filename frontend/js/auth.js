const API_URL = 'http://localhost:8000';

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
