// dashboard-visitas.js
// Script para el dashboard de visitas

// Detectar automáticamente el entorno
const API_URL = (window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1' ||
                 window.location.port === '8000')
    ? 'http://127.0.0.1:8000'  // Desarrollo local
    : 'https://atencion.liderman.net.pe';  // Producción (mismo dominio)

console.log('🌐 Dashboard Visitas - Usando backend:', API_URL);

// Verificar autenticación al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM Cargado');
    verificarAutenticacion();
    mostrarNombreUsuario();
    cargarDatos();
});

/**
 * Cargar los datos del dashboard
 */
async function cargarDatos() {
    console.log('🔄 Iniciando carga de datos...');
    mostrarLoading();
    limpiarError();

    try {
        const token = localStorage.getItem('token');
        console.log('🔑 Token encontrado:', token ? 'Sí' : 'No');
        
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        console.log('📡 Haciendo petición a:', `${API_URL}/api/dashboard-visitas`);
        
        const response = await fetch(`${API_URL}/api/dashboard-visitas`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('📥 Respuesta recibida:', response.status, response.statusText);

        if (!response.ok) {
            if (response.status === 401) {
                console.error('❌ Error 401: Token inválido o expirado');
                logout();
                return;
            }
            const errorText = await response.text();
            console.error('❌ Error del servidor:', errorText);
            throw new Error(`Error al cargar datos: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Datos recibidos:', data);
        mostrarDatos(data);
    } catch (error) {
        console.error('❌ Error completo:', error);
        mostrarError('Error al cargar los datos del dashboard: ' + error.message);
    } finally {
        ocultarLoading();
    }
}

/**
 * Mostrar los datos en el dashboard
 */
function mostrarDatos(data) {
    // Actualizar las tarjetas de estadísticas
    document.getElementById('total-visitas').textContent = data.total_visitas || 0;
    document.getElementById('atenciones-con-visita').textContent = data.atenciones_con_visita || 0;
    document.getElementById('atenciones-directas').textContent = data.atenciones_directas || 0;

    // Mostrar tabla de visitas por zona
    const tbody = document.getElementById('tabla-body');
    tbody.innerHTML = '';

    if (!data.visitas_por_zona || data.visitas_por_zona.length === 0) {
        document.getElementById('tabla-visitas').style.display = 'none';
        document.getElementById('no-data').style.display = 'block';
        return;
    }

    document.getElementById('tabla-visitas').style.display = 'table';
    document.getElementById('no-data').style.display = 'none';

    data.visitas_por_zona.forEach(item => {
        const row = document.createElement('tr');
        
        const promedio = item.total_visitas > 0 
            ? (item.total_atenciones / item.total_visitas).toFixed(2)
            : '0.00';

        row.innerHTML = `
            <td><strong>${item.cliente || 'Sin cliente'}</strong></td>
            <td>${item.zona || '-'}</td>
            <td>${item.macrozona || '-'}</td>
            <td><strong>${item.total_visitas}</strong></td>
            <td><strong>${item.total_atenciones}</strong></td>
            <td>${promedio}</td>
        `;
        
        tbody.appendChild(row);
    });
}

/**
 * Mostrar indicador de carga
 */
function mostrarLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('tabla-visitas').style.display = 'none';
    document.getElementById('no-data').style.display = 'none';
}

/**
 * Ocultar indicador de carga
 */
function ocultarLoading() {
    document.getElementById('loading').style.display = 'none';
}

/**
 * Mostrar mensaje de error
 */
function mostrarError(mensaje) {
    const errorContainer = document.getElementById('error-container');
    errorContainer.innerHTML = `<div class="error">${mensaje}</div>`;
}

/**
 * Limpiar mensaje de error
 */
function limpiarError() {
    const errorContainer = document.getElementById('error-container');
    errorContainer.innerHTML = '';
}

/**
 * Verificar autenticación
 */
function verificarAutenticacion() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
    }
}

/**
 * Mostrar nombre del usuario
 */
function mostrarNombreUsuario() {
    const nombre = localStorage.getItem('nombre');
    const userName = nombre || localStorage.getItem('userName') || 'Usuario';
    console.log('👤 Nombre de usuario:', userName);
    const userNameEl = document.getElementById('userName');
    if (userNameEl) {
        userNameEl.textContent = userName;
    }
}

/**
 * Cerrar sesión
 */
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRol');
    window.location.href = 'login.html';
}
