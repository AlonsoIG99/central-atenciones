const formUsuario = document.getElementById('usuario-form');
const usuariosList = document.getElementById('usuarios-list');

// Cargar usuarios
async function cargarUsuarios() {
    const usuarios = await obtenerUsuarios();
    usuariosList.innerHTML = '';
    
    if (usuarios.length === 0) {
        usuariosList.innerHTML = '<p>No hay usuarios registrados</p>';
        return;
    }
    
    usuarios.forEach(usuario => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <div class="list-item-content">
                <strong>${usuario.nombre}</strong><br>
                <small>${usuario.email}</small>
            </div>
            <div class="list-item-actions">
                <button class="btn-delete" onclick="eliminarUsr(${usuario.id})">Eliminar</button>
            </div>
        `;
        usuariosList.appendChild(div);
    });
}

// Crear usuario
formUsuario.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const usuario = {
        nombre: document.getElementById('usuario-nombre').value,
        email: document.getElementById('usuario-email').value,
        contraseña: document.getElementById('usuario-contraseña').value
    };
    
    const resultado = await crearUsuario(usuario);
    if (resultado) {
        mostrarExito('Usuario creado exitosamente');
        formUsuario.reset();
        cargarUsuarios();
    }
});

// Eliminar usuario
async function eliminarUsr(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
        const resultado = await eliminarUsuario(id);
        if (resultado) {
            mostrarExito('Usuario eliminado exitosamente');
            cargarUsuarios();
        }
    }
}
