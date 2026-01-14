// dashboard-visitas.js
// Detectar automáticamente el entorno
const API_URL = (window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1' ||
                 window.location.port === '8000')
    ? 'http://127.0.0.1:8000'
    : 'https://attention.liderman.net.pe';

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
        document.getElementById('tabla-container').classList.add('hidden');
        document.getElementById('no-data').classList.remove('hidden');
        return;
    }

    document.getElementById('tabla-container').classList.remove('hidden');
    document.getElementById('no-data').classList.add('hidden');

    data.visitas_por_zona.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        
        const promedio = item.total_visitas > 0 
            ? (item.total_atenciones / item.total_visitas).toFixed(2)
            : '0.00';

        row.innerHTML = `
            <td class="px-6 py-4 text-sm font-medium text-gray-900">${item.cliente || 'Sin cliente'}</td>
            <td class="px-6 py-4 text-sm text-gray-600">${item.zona || '-'}</td>
            <td class="px-6 py-4 text-sm text-gray-600">${item.macrozona || '-'}</td>
            <td class="px-6 py-4 text-sm font-semibold text-gray-900">${item.total_visitas}</td>
            <td class="px-6 py-4 text-sm font-semibold text-gray-900">${item.total_atenciones}</td>
            <td class="px-6 py-4 text-sm text-gray-600">${promedio}</td>
        `;
        
        tbody.appendChild(row);
    });
}

/**
 * Mostrar indicador de carga
 */
function mostrarLoading() {
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('tabla-container').classList.add('hidden');
    document.getElementById('no-data').classList.add('hidden');
}

/**
 * Ocultar indicador de carga
 */
function ocultarLoading() {
    document.getElementById('loading').classList.add('hidden');
}

/**
 * Mostrar mensaje de error
 */
function mostrarError(mensaje) {
    const errorContainer = document.getElementById('error-container');
    errorContainer.innerHTML = `
        <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p class="font-semibold">Error</p>
            <p>${mensaje}</p>
        </div>
    `;
}

/**
 * Limpiar mensaje de error
 */
function limpiarError() {
    document.getElementById('error-container').innerHTML = '';
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
    localStorage.removeItem('nombre');
    window.location.href = 'login.html';
}
