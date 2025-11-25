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

// Funciones para Incidencias
async function obtenerIncidencias() {
    try {
        const response = await fetch(`${API_URL}/incidencias`, {
            headers: obtenerHeaders()
        });
        if (!response.ok) throw new Error('Error al obtener incidencias');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al obtener incidencias');
        return [];
    }
}

async function crearIncidencia(incidencia) {
    try {
        const response = await fetch(`${API_URL}/incidencias`, {
            method: 'POST',
            headers: obtenerHeaders(),
            body: JSON.stringify(incidencia)
        });
        if (!response.ok) throw new Error('Error al crear incidencia');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al crear incidencia');
        return null;
    }
}

async function actualizarIncidencia(id, incidencia) {
    try {
        const response = await fetch(`${API_URL}/incidencias/${id}`, {
            method: 'PUT',
            headers: obtenerHeaders(),
            body: JSON.stringify(incidencia)
        });
        if (!response.ok) throw new Error('Error al actualizar incidencia');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al actualizar incidencia');
        return null;
    }
}

async function eliminarIncidencia(id) {
    try {
        const response = await fetch(`${API_URL}/incidencias/${id}`, {
            method: 'DELETE',
            headers: obtenerHeaders()
        });
        if (!response.ok) throw new Error('Error al eliminar incidencia');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al eliminar incidencia');
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
