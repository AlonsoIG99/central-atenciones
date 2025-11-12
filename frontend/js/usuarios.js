const formUsuario = document.getElementById('usuario-form');
const usuariosList = document.getElementById('usuarios-list');

// Cargar usuarios
async function cargarUsuarios() {
  const usuarios = await obtenerUsuarios();
  usuariosList.innerHTML = '';
  
  if (usuarios.length === 0) {
    usuariosList.innerHTML = '<p class="text-gray-500 text-center py-4">No hay usuarios registrados</p>';
    return;
  }
  
  usuarios.forEach(usuario => {
    const div = document.createElement('div');
    div.className = 'bg-gray-50 p-4 mb-4 rounded-lg border border-gray-200 hover:shadow-md transition';
    div.innerHTML = `
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <h4 class="font-semibold text-gray-800">${usuario.nombre}</h4>
          <p class="text-sm text-gray-600">${usuario.email}</p>
          <div class="flex gap-4 mt-2">
            <span class="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">Rol: ${usuario.rol}</span>
            <span class="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">Área: ${usuario.area}</span>
          </div>
        </div>
        <button class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition" onclick="eliminarUsr(${usuario.id})">Eliminar</button>
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
    contraseña: document.getElementById('usuario-contraseña').value,
    rol: document.getElementById('usuario-rol').value,
    area: document.getElementById('usuario-area').value
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