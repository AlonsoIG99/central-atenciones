// Elementos del DOM
const btnUsuarios = document.getElementById('btn-usuarios');
const btnIncidencias = document.getElementById('btn-incidencias');
const usuariosSection = document.getElementById('usuarios-section');
const incidenciasSection = document.getElementById('incidencias-section');

// Navegación entre secciones
btnUsuarios.addEventListener('click', () => {
    mostrarSeccion('usuarios');
});

btnIncidencias.addEventListener('click', () => {
    mostrarSeccion('incidencias');
});

function mostrarSeccion(seccion) {
    // Ocultar todas las secciones
    usuariosSection.classList.remove('active');
    incidenciasSection.classList.remove('active');
    
    // Quitar clase active de todos los botones
    btnUsuarios.classList.remove('active');
    btnIncidencias.classList.remove('active');
    
    // Mostrar la sección seleccionada
    if (seccion === 'usuarios') {
        usuariosSection.classList.add('active');
        btnUsuarios.classList.add('active');
        cargarUsuarios();
    } else if (seccion === 'incidencias') {
        incidenciasSection.classList.add('active');
        btnIncidencias.classList.add('active');
        cargarIncidencias();
    }
}

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    cargarUsuarios();
});
