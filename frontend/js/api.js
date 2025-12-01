const API_URL = 'http://127.0.0.1:8000';

// Obtener token del localStorage
function obtenerToken() {
  return localStorage.getItem('token');
}

// Headers con token
function obtenerHeaders() {
  const token = obtenerToken();
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Verificar autenticación
function verificarAutenticacion() {
  const token = obtenerToken();
  if (!token) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Funciones para Usuarios
async function obtenerUsuarios() {
    try {
        const response = await fetch(`${API_URL}/usuarios`, {
            headers: obtenerHeaders()
        });
        if (!response.ok) throw new Error('Error al obtener usuarios');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al obtener usuarios');
        return [];
    }
}

async function crearUsuario(usuario) {
    try {
        const response = await fetch(`${API_URL}/usuarios`, {
            method: 'POST',
            headers: obtenerHeaders(),
            body: JSON.stringify(usuario)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Error al crear usuario');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        mostrarError(error.message || 'Error al crear usuario');
        return null;
    }
}

async function actualizarUsuario(id, usuario) {
    try {
        const response = await fetch(`${API_URL}/usuarios/${id}`, {
            method: 'PUT',
            headers: obtenerHeaders(),
            body: JSON.stringify(usuario)
        });
        if (!response.ok) throw new Error('Error al actualizar usuario');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al actualizar usuario');
        return null;
    }
}

async function eliminarUsuario(id) {
    try {
        const response = await fetch(`${API_URL}/usuarios/${id}`, {
            method: 'DELETE',
            headers: obtenerHeaders()
        });
        if (!response.ok) throw new Error('Error al eliminar usuario');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al eliminar usuario');
        return null;
    }
}

// Funciones para Atenciones
async function obtenerAtenciones() {
    try {
        const response = await fetch(`${API_URL}/atenciones`, {
            headers: obtenerHeaders()
        });
        if (!response.ok) throw new Error('Error al obtener atenciones');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al obtener atenciones');
        return [];
    }
}

async function crearAtencion(atencion) {
    try {
        const response = await fetch(`${API_URL}/atenciones`, {
            method: 'POST',
            headers: obtenerHeaders(),
            body: JSON.stringify(atencion)
        });
        if (!response.ok) throw new Error('Error al crear atención');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al crear atención');
        return null;
    }
}

async function actualizarAtencion(id, atencion) {
    try {
        const response = await fetch(`${API_URL}/atenciones/${id}`, {
            method: 'PUT',
            headers: obtenerHeaders(),
            body: JSON.stringify(atencion)
        });
        if (!response.ok) throw new Error('Error al actualizar atención');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al actualizar atención');
        return null;
    }
}

async function eliminarAtencion(id) {
    try {
        const response = await fetch(`${API_URL}/atenciones/${id}`, {
            method: 'DELETE',
            headers: obtenerHeaders()
        });
        if (!response.ok) throw new Error('Error al eliminar atención');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al eliminar atención');
        return null;
    }
}

// Funciones para Trabajadores
async function buscarTrabajadorPorDni(dni) {
    try {
        if (!dni || dni.length === 0) return [];
        
        const response = await fetch(`${API_URL}/trabajadores/buscar/${dni}`, {
            headers: obtenerHeaders()
        });
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// Función auxiliar para mostrar errores
function mostrarError(mensaje) {
    const error = document.createElement('div');
    error.className = 'error';
    error.textContent = mensaje;
    const main = document.querySelector('main');
    if (main) {
        main.insertBefore(error, main.firstChild);
        setTimeout(() => error.remove(), 5000);
    }
}

// Función auxiliar para mostrar éxito
function mostrarExito(mensaje) {
    const success = document.createElement('div');
    success.className = 'success';
    success.textContent = mensaje;
    const main = document.querySelector('main');
    if (main) {
        main.insertBefore(success, main.firstChild);
        setTimeout(() => success.remove(), 5000);
    }
}
