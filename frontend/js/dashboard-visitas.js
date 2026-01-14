// Configuración de API
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'
  : 'https://attention.liderman.net.pe';

// Verificar autenticación
function verificarAutenticacion() {
  // Intentar ambas claves por compatibilidad
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  
  if (!token) {
    alert('Sesión no encontrada. Por favor, inicia sesión nuevamente.');
    window.location.href = 'login.html';
    return false;
  }
  
  // Mostrar nombre de usuario
  const nombreUsuario = localStorage.getItem('nombre_usuario') || localStorage.getItem('nombre') || localStorage.getItem('email') || 'Usuario';
  const userNameElement = document.getElementById('userName');
  if (userNameElement) {
    userNameElement.textContent = nombreUsuario;
  }
  
  return true;
}

// Función de logout
function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('token');
  localStorage.removeItem('nombre_usuario');
  localStorage.removeItem('nombre');
  localStorage.removeItem('email');
  localStorage.removeItem('rol');
  window.location.href = '/login.html';
}

// Cargar datos del dashboard
async function cargarDatos() {
  if (!verificarAutenticacion()) return;
  
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  
  try {
    const response = await fetch(`${API_URL}/api/dashboard-visitas`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 401) {
      // Token inválido, redirigir a login
      logout();
      return;
    }
    
    if (response.status === 403) {
      alert('No tienes permisos para acceder a este módulo');
      window.close();
      return;
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al cargar datos');
    }
    
    const data = await response.json();
    mostrarDatos(data);
    
  } catch (error) {
    document.getElementById('error-message').textContent = `Error: ${error.message}`;
    document.getElementById('error-message').classList.remove('hidden');
  }
}

// Mostrar datos en el dashboard
function mostrarDatos(data) {
  // Actualizar estadísticas
  document.getElementById('total-visitas').textContent = data.total_visitas.toLocaleString();
  document.getElementById('atenciones-con-visita').textContent = data.atenciones_con_visita.toLocaleString();
  document.getElementById('atenciones-directas').textContent = data.atenciones_directas.toLocaleString();
  
  // Mostrar tabla
  const tbody = document.getElementById('tabla-visitas');
  tbody.innerHTML = '';
  
  if (data.visitas_por_zona && data.visitas_por_zona.length > 0) {
    data.visitas_por_zona.forEach(item => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-gray-50';
      tr.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.cliente}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${item.zona}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${item.macrozona}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">${item.total_visitas}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">${item.total_atenciones}</td>
      `;
      tbody.appendChild(tr);
    });
  } else {
    tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No hay datos disponibles</td></tr>';
  }
}

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', () => {
  cargarDatos();
});
