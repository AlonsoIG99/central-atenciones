// Verificar autenticación al cargar
document.addEventListener('DOMContentLoaded', () => {
  if (!verificarAutenticacion()) return;
  
  const userId = localStorage.getItem('user_id');
  const nombre = localStorage.getItem('nombre');
  const rolActual = localStorage.getItem('rol');
  const area = localStorage.getItem('area');
  
  // Actualizar información del usuario en el header
  const userNameEl = document.getElementById('user-name');
  const userRoleEl = document.getElementById('user-role');
  if (userNameEl && nombre) {
    userNameEl.textContent = nombre;
  }
  if (userRoleEl && area) {
    userRoleEl.textContent = area || (rolActual ? rolActual.charAt(0).toUpperCase() + rolActual.slice(1) : '');
  }
  
  const userIdField = document.getElementById('atencion-usuario_id');
  if (userIdField) {
    userIdField.value = userId;
  }
  
  // Si es gestor, ocultar el botón y sección de usuarios
  if (rolActual === 'gestor') {
    const btnUsuarios = document.getElementById('btn-usuarios');
    const usuariosSection = document.getElementById('usuarios-section');
    if (btnUsuarios) btnUsuarios.style.display = 'none';
    if (usuariosSection) usuariosSection.style.display = 'none';
    
    // Ocultar Paso 1 y Paso 2 para gestores (solo administradores pueden ver)
    const asignadosCsvContainer = document.getElementById('asignados-csv-container');
    const dashboardReporteContainer = document.getElementById('dashboard-reporte-container');
    if (asignadosCsvContainer) asignadosCsvContainer.style.display = 'none';
    if (dashboardReporteContainer) dashboardReporteContainer.style.display = 'none';
  }
  
  // Restaurar última sección visitada o mostrar por defecto
  const ultimaSeccion = localStorage.getItem('ultima_seccion');
  if (ultimaSeccion) {
    mostrarSeccion(ultimaSeccion);
  } else {
    // Mostrar sección por defecto según rol
    if (rolActual === 'gestor') {
      mostrarSeccion('atenciones');
    } else {
      mostrarSeccion('usuarios');
    }
  }
});

// Elementos del DOM
const btnUsuarios = document.getElementById('btn-usuarios');
const btnAsignados = document.getElementById('btn-asignados');
const btnIncidencias = document.getElementById('btn-atenciones');
const btnReportes = document.getElementById('btn-reportes');
const btnLogout = document.getElementById('btn-logout');
const usuariosSection = document.getElementById('usuarios-section');
const asignadosSection = document.getElementById('asignados-section');
const incidenciasSection = document.getElementById('atenciones-section');
const reportesSection = document.getElementById('reportes-section');

// Navegación entre secciones
btnUsuarios.addEventListener('click', () => {
  mostrarSeccion('usuarios');
});

btnAsignados.addEventListener('click', () => {
  mostrarSeccion('asignados');
});

btnIncidencias.addEventListener('click', () => {
  mostrarSeccion('atenciones');
});

btnReportes.addEventListener('click', () => {
  mostrarSeccion('reportes');
});

// Logout
if (btnLogout) {
  btnLogout.addEventListener('click', async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    
    // Intentar revocar el refresh token en el servidor
    if (refreshToken) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refresh_token: refreshToken })
        });
      } catch (error) {
        console.error('Error al revocar token:', error);
      }
    }
    
    // Limpiar localStorage y redirigir
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('nombre');
    localStorage.removeItem('rol');
    localStorage.removeItem('area');
    window.location.href = 'login.html';
  });
}

function mostrarSeccion(seccion) {
  // Guardar la sección actual en localStorage
  localStorage.setItem('ultima_seccion', seccion);
  
  // Actualizar títulos dinámicos
  const pageTitle = document.getElementById('page-title');
  const pageSubtitle = document.getElementById('page-subtitle');
  
  const titles = {
    usuarios: { title: 'Gestión de Usuarios', subtitle: 'Administra usuarios del sistema' },
    atenciones: { title: 'Registro de Atenciones', subtitle: 'Gestiona las solicitudes y atenciones' },
    reportes: { title: 'Reportes y Consultas', subtitle: 'Visualiza el historial de atenciones' },
    asignados: { title: 'Dashboard Ejecutivo', subtitle: 'Análisis y métricas en tiempo real' }
  };
  
  if (pageTitle && titles[seccion]) {
    pageTitle.textContent = titles[seccion].title;
    pageSubtitle.textContent = titles[seccion].subtitle;
  }
  
  usuariosSection.classList.remove('active');
  asignadosSection.classList.remove('active');
  incidenciasSection.classList.remove('active');
  reportesSection.classList.remove('active');
  
  btnUsuarios.classList.remove('active');
  btnAsignados.classList.remove('active');
  btnIncidencias.classList.remove('active');
  btnReportes.classList.remove('active');
  
  if (seccion === 'usuarios') {
    usuariosSection.classList.add('active');
    btnUsuarios.classList.add('active');
    cargarUsuarios();
  } else if (seccion === 'asignados') {
    asignadosSection.classList.add('active');
    btnAsignados.classList.add('active');
  } else if (seccion === 'atenciones') {
    incidenciasSection.classList.add('active');
    btnIncidencias.classList.add('active');
  } else if (seccion === 'reportes') {
    reportesSection.classList.add('active');
    btnReportes.classList.add('active');
    cargarReportes();
  }
}

// CSS para las secciones
const style = document.createElement('style');
style.textContent = `
  .section {
    display: none;
  }
  
  .section.active {
    display: block;
  }
  
  .nav-btn.active {
    background-color: rgb(37, 99, 235);
  }
`;
document.head.appendChild(style);