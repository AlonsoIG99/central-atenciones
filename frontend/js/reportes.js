const reportContainer = document.getElementById('reportContainer');
const buscarDniInput = document.getElementById('buscar-dni');
const fechaDesdeInput = document.getElementById('fecha-desde');
const fechaHastaInput = document.getElementById('fecha-hasta');
const btnLimpiarBusqueda = document.getElementById('btn-limpiar-busqueda');

// Validar que búsqueda de DNI solo acepte números
if (buscarDniInput) {
  buscarDniInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
    cargarReportes();
  });
}

// Eventos para filtros de fecha
if (fechaDesdeInput) {
  fechaDesdeInput.addEventListener('change', () => {
    cargarReportes();
  });
}

if (fechaHastaInput) {
  fechaHastaInput.addEventListener('change', () => {
    cargarReportes();
  });
}

// Evento para limpiar búsqueda
if (btnLimpiarBusqueda) {
  btnLimpiarBusqueda.addEventListener('click', () => {
    if (buscarDniInput) buscarDniInput.value = '';
    if (fechaDesdeInput) fechaDesdeInput.value = '';
    if (fechaHastaInput) fechaHastaInput.value = '';
    cargarReportes();
  });
}

// Cargar reportes
async function cargarReportes() {
  const incidencias = await obtenerIncidencias();
  const userId = localStorage.getItem('user_id');
  const rol = localStorage.getItem('rol');
  const dniSearch = buscarDniInput ? buscarDniInput.value.toLowerCase().trim() : '';
  const fechaDesde = fechaDesdeInput ? fechaDesdeInput.value : '';
  const fechaHasta = fechaHastaInput ? fechaHastaInput.value : '';
  
  // Filtrar: gestores ven solo sus incidencias, admins ven todas
  let incidenciasFiltered = rol === 'administrador' 
    ? incidencias 
    : incidencias.filter(inc => inc.usuario_id == userId);
  
  // Filtrar por DNI si hay búsqueda
  if (dniSearch) {
    incidenciasFiltered = incidenciasFiltered.filter(inc => 
      inc.dni.toLowerCase().includes(dniSearch)
    );
  }
  
  // Filtrar por rango de fechas si se especifican
  if (fechaDesde || fechaHasta) {
    incidenciasFiltered = incidenciasFiltered.filter(inc => {
      const fechaInc = new Date(inc.fecha_creacion).toISOString().split('T')[0];
      
      if (fechaDesde && fechaHasta) {
        return fechaInc >= fechaDesde && fechaInc <= fechaHasta;
      } else if (fechaDesde) {
        return fechaInc >= fechaDesde;
      } else if (fechaHasta) {
        return fechaInc <= fechaHasta;
      }
      return true;
    });
  }
  
  reportContainer.innerHTML = '';
  
  if (incidenciasFiltered.length === 0) {
    let mensaje = 'No hay incidencias registradas';
    if (dniSearch) {
      mensaje = `No hay incidencias con DNI: ${dniSearch}`;
    }
    if (fechaDesde || fechaHasta) {
      mensaje += ' en el rango de fechas seleccionado';
    }
    reportContainer.innerHTML = `<p class="text-gray-500 text-center py-8">${mensaje}</p>`;
    return;
  }
  
  incidenciasFiltered.forEach((incidencia) => {
    const card = document.createElement('div');
    card.className = "bg-white shadow-md rounded-xl p-5 cursor-pointer hover:shadow-lg transition";
    
    const header = document.createElement('div');
    header.className = "flex justify-between items-center";
    
    const headerContent = document.createElement('div');
    headerContent.innerHTML = `
      <p class="text-lg font-semibold text-gray-800">DNI: ${incidencia.dni}</p>
      <p class="text-sm text-gray-500">Usuario: <span class="font-medium">${incidencia.usuario_nombre || 'Desconocido'}</span></p>
      <p class="text-sm text-gray-500">Fecha: ${new Date(incidencia.fecha_creacion).toLocaleDateString('es-ES')}</p>
      <p class="text-sm text-gray-600">Estado: <span class="font-medium estado-badge">${incidencia.estado}</span></p>
    `;
    
    const actions = document.createElement('div');
    actions.className = "flex gap-2 items-center";
    
    const toggleBtn = document.createElement('button');
    toggleBtn.className = "text-blue-600 font-semibold text-sm flex items-center gap-2 hover:text-blue-800";
    toggleBtn.innerHTML = 'Ver detalle <span class="toggle-icon">▼</span>';
    toggleBtn.type = 'button';
    
    const editBtn = document.createElement('button');
    editBtn.className = "px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition";
    editBtn.textContent = 'Editar';
    editBtn.type = 'button';
    
    actions.appendChild(toggleBtn);
    actions.appendChild(editBtn);
    
    header.appendChild(headerContent);
    header.appendChild(actions);
    card.appendChild(header);
    
    const detail = document.createElement('div');
    detail.className = "mt-4 pl-4 border-l-2 border-gray-200 hidden";
    
    // Renderizar JSON de forma jerárquica
    try {
      const data = JSON.parse(incidencia.descripcion || '{}');
      
      function renderNested(obj, level = 0) {
        const ul = document.createElement('ul');
        ul.className = `${level > 0 ? 'ml-3' : ''} space-y-1 ${level > 0 ? 'border-l border-gray-200 pl-3' : ''}`;
        
        Object.entries(obj).forEach(([key, value]) => {
          if (key === 'valor') return;
          
          const li = document.createElement('li');
          li.className = 'text-gray-700';
          
          // Agregar punto azul
          const span = document.createElement('span');
          span.className = 'text-blue-600 font-bold';
          span.textContent = '• ';
          li.appendChild(span);
          
          const text = document.createTextNode(key);
          li.appendChild(text);
          
          if (typeof value === 'object' && Object.keys(value).length > 0) {
            if (value.valor) {
              const val = document.createElement('div');
              val.className = 'ml-5 text-sm text-gray-500';
              val.textContent = `→ Valor: ${value.valor}`;
              li.appendChild(val);
            }
            const childList = renderNested(value, level + 1);
            li.appendChild(childList);
          }
          
          ul.appendChild(li);
        });
        
        return ul;
      }
      
      Object.entries(data).forEach(([key, value]) => {
        const section = document.createElement('div');
        section.className = 'mt-3';
        
        const sectionTitle = document.createElement('p');
        sectionTitle.className = 'font-semibold text-gray-800 mb-1';
        sectionTitle.textContent = key;
        section.appendChild(sectionTitle);
        
        section.appendChild(renderNested(value));
        detail.appendChild(section);
      });
    } catch (e) {
      console.error('Error al parsear JSON:', e);
      detail.innerHTML = '<p class="text-red-500">Error al mostrar detalles</p>';
    }
    
    card.appendChild(detail);
    
    // Toggle al hacer clic en el botón Ver detalle
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      detail.classList.toggle('hidden');
      const icon = toggleBtn.querySelector('.toggle-icon');
      icon.textContent = detail.classList.contains('hidden') ? '▼' : '▲';
    });

    // Evento para botón Editar
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mostrarModalEditarEstado(incidencia);
    });
    
    reportContainer.appendChild(card);
  });
}

// Modal para editar estado
function mostrarModalEditarEstado(incidencia) {
  const modal = document.createElement('div');
  modal.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
  
  const content = document.createElement('div');
  content.className = "bg-white rounded-lg p-6 w-96 shadow-lg";
  
  content.innerHTML = `
    <h2 class="text-xl font-bold text-gray-800 mb-4">Actualizar Estado</h2>
    <p class="text-sm text-gray-600 mb-4">DNI: ${incidencia.dni}</p>
    
    <select id="nuevoEstado" class="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-600">
      <option value="">-- Seleccionar estado --</option>
      <option value="abierta">Abierta</option>
      <option value="en_progreso">En progreso</option>
      <option value="resuelta">Resuelta</option>
      <option value="cerrada">Cerrada</option>
    </select>
    
    <div class="flex gap-2">
      <button id="btnGuardarEstado" class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
        Guardar
      </button>
      <button id="btnCancelarEstado" class="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition">
        Cancelar
      </button>
    </div>
  `;
  
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  // Establecer estado actual
  const selectEstado = document.getElementById('nuevoEstado');
  selectEstado.value = incidencia.estado;
  
  // Evento guardar
  document.getElementById('btnGuardarEstado').addEventListener('click', async () => {
    const nuevoEstado = selectEstado.value;
    
    if (!nuevoEstado) {
      alert('Por favor selecciona un estado');
      return;
    }
    
    try {
      const headers = obtenerHeaders();
      const response = await fetch(`http://localhost:8000/incidencias/${incidencia.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          estado: nuevoEstado
        })
      });
      
      if (response.ok) {
        mostrarExito('Estado actualizado correctamente');
        modal.remove();
        cargarReportes(); // Recargar la lista
      } else {
        mostrarError('Error al actualizar el estado');
      }
    } catch (error) {
      console.error('Error:', error);
      mostrarError('Error al conectar con el servidor');
    }
  });
  
  // Evento cancelar
  document.getElementById('btnCancelarEstado').addEventListener('click', () => {
    modal.remove();
  });
  
  // Cerrar al hacer clic fuera del modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Cargar reportes cuando se monta la sección
document.addEventListener('DOMContentLoaded', () => {
  const btnReportes = document.getElementById('btn-reportes');
  if (btnReportes) {
    btnReportes.addEventListener('click', () => {
      cargarReportes();
    });
  }
});
