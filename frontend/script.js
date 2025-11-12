// Verificar autenticación al cargar
document.addEventListener('DOMContentLoaded', () => {
  if (!verificarAutenticacion()) return;
  
  const userId = localStorage.getItem('user_id');
  const userIdField = document.getElementById('incidencia-usuario_id');
  if (userIdField) {
    userIdField.value = userId;
  }
  
  cargarUsuarios();
  agregarBotonLogout();
});

// Elementos del DOM
const btnUsuarios = document.getElementById('btn-usuarios');
const btnIncidencias = document.getElementById('btn-incidencias');
const btnReportes = document.getElementById('btn-reportes');
const usuariosSection = document.getElementById('usuarios-section');
const incidenciasSection = document.getElementById('incidencias-section');
const reportesSection = document.getElementById('reportes-section');

// Navegación entre secciones
btnUsuarios.addEventListener('click', () => {
  mostrarSeccion('usuarios');
});

btnIncidencias.addEventListener('click', () => {
  mostrarSeccion('incidencias');
});

btnReportes.addEventListener('click', () => {
  mostrarSeccion('reportes');
});

function mostrarSeccion(seccion) {
  usuariosSection.classList.remove('active');
  incidenciasSection.classList.remove('active');
  reportesSection.classList.remove('active');
  
  btnUsuarios.classList.remove('active');
  btnIncidencias.classList.remove('active');
  btnReportes.classList.remove('active');
  
  if (seccion === 'usuarios') {
    usuariosSection.classList.add('active');
    btnUsuarios.classList.add('active');
    cargarUsuarios();
  } else if (seccion === 'incidencias') {
    incidenciasSection.classList.add('active');
    btnIncidencias.classList.add('active');
    cargarIncidencias();
  } else if (seccion === 'reportes') {
    reportesSection.classList.add('active');
    btnReportes.classList.add('active');
    cargarReportes();
  }
}

function agregarBotonLogout() {
  const header = document.querySelector('header');
  const nav = header.querySelector('nav');
  
  const logoutBtn = document.createElement('button');
  logoutBtn.textContent = 'Logout';
  logoutBtn.className = 'nav-btn px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition';
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('rol');
    localStorage.removeItem('area');
    window.location.href = 'login.html';
  });
  
  nav.appendChild(logoutBtn);
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