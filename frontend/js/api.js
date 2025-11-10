const API_URL = 'http://localhost:8000';

// Funciones para Usuarios
async function obtenerUsuarios() {
    try {
        const response = await fetch(`${API_URL}/usuarios`);
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
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(usuario)
        });
        if (!response.ok) throw new Error('Error al crear usuario');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al crear usuario');
        return null;
    }
}

async function actualizarUsuario(id, usuario) {
    try {
        const response = await fetch(`${API_URL}/usuarios/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
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
            method: 'DELETE'
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
        const response = await fetch(`${API_URL}/incidencias`);
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
            headers: {
                'Content-Type': 'application/json',
            },
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
            headers: {
                'Content-Type': 'application/json',
            },
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
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar incidencia');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al eliminar incidencia');
        return null;
    }
}

// Función auxiliar para mostrar errores
function mostrarError(mensaje) {
    const error = document.createElement('div');
    error.className = 'error';
    error.textContent = mensaje;
    document.querySelector('main').insertBefore(error, document.querySelector('main').firstChild);
    setTimeout(() => error.remove(), 5000);
}

// Función auxiliar para mostrar éxito
function mostrarExito(mensaje) {
    const success = document.createElement('div');
    success.className = 'success';
    success.textContent = mensaje;
    document.querySelector('main').insertBefore(success, document.querySelector('main').firstChild);
    setTimeout(() => success.remove(), 5000);
}
