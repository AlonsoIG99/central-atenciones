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
          <p class="text-sm text-gray-600">DNI: ${usuario.dni}</p>
          <div class="flex gap-4 mt-2">
            <span class="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">Rol: ${usuario.rol}</span>
            <span class="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">Área: ${usuario.area}</span>
          </div>
        </div>
        <button class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition" onclick="eliminarUsr('${usuario.id}')">Eliminar</button>
      </div>
    `;
    usuariosList.appendChild(div);
  });
}

// Crear usuario
formUsuario.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const rolActual = localStorage.getItem('rol');
  if (rolActual !== 'administrador') {
    mostrarError('Solo los administradores pueden crear usuarios');
    return;
  }
  
  const usuario = {
    dni: document.getElementById('usuario-dni').value,
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

// ==================== CARGA DE CSV TRABAJADORES ====================

// Mostrar/ocultar sección CSV según rol del usuario y manejar inicialización
document.addEventListener('DOMContentLoaded', () => {
  // 1. Verificar rol y mostrar/ocultar secciones
  const rolActual = localStorage.getItem('rol');
  const formContainer = document.getElementById('usuario-form-container');
  const csvUploadContainer = document.getElementById('csv-upload-container');
  
  // Si NO es administrador, ocultar formulario de usuarios
  if (rolActual !== 'administrador' && formContainer) {
    formContainer.innerHTML = '<p class="text-red-600 font-semibold p-4 bg-red-100 rounded-lg border border-red-300">Solo los administradores pueden crear usuarios</p>';
  }
  
  // Si ES administrador, mostrar CSV container
  if (rolActual === 'administrador' && csvUploadContainer) {
    csvUploadContainer.classList.remove('hidden');
    console.log('✅ CSV container visible para administrador');
  } else if (csvUploadContainer) {
    csvUploadContainer.classList.add('hidden');
    console.log('🚫 CSV container oculto - usuario no es administrador');
  }
  
  // 2. Cargar usuarios al iniciar
  cargarUsuarios();
});

// Manejo del formulario CSV
const csvForm = document.getElementById('csv-form');
const csvFile = document.getElementById('csv-file');
const csvResultado = document.getElementById('csv-resultado');

if (csvForm) {
  csvForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 1. Validar que se seleccionó archivo
    if (!csvFile.files.length) {
      mostrarErrorCSV('Selecciona un archivo CSV');
      return;
    }
    
    const file = csvFile.files[0];
    
    // 2. Validar que sea CSV
    if (!file.name.endsWith('.csv')) {
      mostrarErrorCSV('El archivo debe ser CSV');
      return;
    }
    
    // 3. Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      mostrarErrorCSV('El archivo no debe superar 5MB');
      return;
    }
    
    try {
      // 4. Enviar archivo
      const formData = new FormData();
      formData.append('file', file);
      
      const token = localStorage.getItem('token');
      const response = await fetchConAutoRefresh(
        `${API_URL}/trabajadores/cargar-csv`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );
      
      const data = await response.json();
      
      if (response.ok) {
        // 5. Mostrar resumen de éxito
        mostrarResultadoCSV(data, 'success');
        
        // 6. Limpiar formulario
        csvForm.reset();
        
      } else {
        mostrarResultadoCSV(data, 'error');
      }
      
    } catch (error) {
      console.error('Error cargando CSV:', error);
      mostrarErrorCSV('Error al procesar el archivo');
    }
  });
}

// Función para mostrar resultado
function mostrarResultadoCSV(data, tipo) {
  const resultado = document.getElementById('csv-resultado');
  
  if (tipo === 'success') {
    resultado.className = 'p-4 rounded-lg border-2 border-green-300 bg-green-50';
    resultado.innerHTML = `
      <h4 class="font-bold text-green-800 mb-2">✅ Archivo procesado correctamente</h4>
      <div class="text-green-700 space-y-1">
        <p>✨ Insertados: <span class="font-bold">${data.insertados}</span></p>
        <p>🔄 Actualizados: <span class="font-bold">${data.actualizados}</span></p>
        <p>⚠️ Errores: <span class="font-bold">${data.errores}</span></p>
      </div>
      ${data.detalles && data.detalles.length > 0 ? `
        <div class="mt-3 text-sm font-mono bg-white p-2 rounded border border-yellow-300 max-h-32 overflow-y-auto">
          <p class="font-semibold text-yellow-700 mb-1">Detalles de errores:</p>
          ${data.detalles.map(e => `<p class="text-yellow-700">${e}</p>`).join('')}
        </div>
      ` : ''}
    `;
  } else {
    resultado.className = 'p-4 rounded-lg border-2 border-red-300 bg-red-50';
    resultado.innerHTML = `
      <h4 class="font-bold text-red-800 mb-2">❌ Error al procesar archivo</h4>
      <p class="text-red-700">${data.detail || 'Error desconocido'}</p>
    `;
  }
  
  resultado.classList.remove('hidden');
}

// Función auxiliar para mostrar errores
function mostrarErrorCSV(mensaje) {
  const resultado = document.getElementById('csv-resultado');
  resultado.className = 'p-4 rounded-lg border-2 border-red-300 bg-red-50';
  resultado.innerHTML = `
    <h4 class="font-bold text-red-800">❌ ${mensaje}</h4>
  `;
  resultado.classList.remove('hidden');
}