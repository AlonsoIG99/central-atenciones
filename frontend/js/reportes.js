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
  const atenciones = await obtenerAtenciones();
  const userId = localStorage.getItem('user_id');
  const rol = localStorage.getItem('rol');
  const dniSearch = buscarDniInput ? buscarDniInput.value.toLowerCase().trim() : '';
  const fechaDesde = fechaDesdeInput ? fechaDesdeInput.value : '';
  const fechaHasta = fechaHastaInput ? fechaHastaInput.value : '';
  
  // Filtrar: gestores ven solo sus atenciones, admins ven todas
  let atencionesFiltradas = rol === 'administrador' 
    ? atenciones 
    : atenciones.filter(att => att.usuario_id == userId);
  
  // Filtrar por DNI si hay búsqueda
  if (dniSearch) {
    atencionesFiltradas = atencionesFiltradas.filter(att => 
      att.dni.toLowerCase().includes(dniSearch)
    );
  }
  
  // Filtrar por rango de fechas si se especifican
  if (fechaDesde || fechaHasta) {
    atencionesFiltradas = atencionesFiltradas.filter(att => {
      const fechaAtt = new Date(att.fecha_creacion).toISOString().split('T')[0];
      
      if (fechaDesde && fechaHasta) {
        return fechaAtt >= fechaDesde && fechaAtt <= fechaHasta;
      } else if (fechaDesde) {
        return fechaAtt >= fechaDesde;
      } else if (fechaHasta) {
        return fechaAtt <= fechaHasta;
      }
      return true;
    });
  }
  
  reportContainer.innerHTML = '';
  
  if (atencionesFiltradas.length === 0) {
    let mensaje = 'No hay atenciones registradas';
    if (dniSearch) {
      mensaje = `No hay atenciones con DNI: ${dniSearch}`;
    }
    if (fechaDesde || fechaHasta) {
      mensaje += ' en el rango de fechas seleccionado';
    }
    reportContainer.innerHTML = `<p class="text-gray-500 text-center py-8">${mensaje}</p>`;
    return;
  }
  
  atencionesFiltradas.forEach((atencion) => {
    const card = document.createElement('div');
    card.className = "bg-white shadow-md rounded-xl p-5 cursor-pointer hover:shadow-lg transition";
    
    const header = document.createElement('div');
    header.className = "flex justify-between items-center";
    
    const headerContent = document.createElement('div');
    headerContent.innerHTML = `
      <p class="text-lg font-semibold text-gray-800">DNI: ${atencion.dni}</p>
      <p class="text-sm text-gray-500">Usuario: <span class="font-medium">${atencion.usuario_nombre || 'Desconocido'}</span></p>
      <p class="text-sm text-gray-500">Fecha: ${new Date(atencion.fecha_creacion).toLocaleDateString('es-ES')}</p>
      <p class="text-sm text-gray-600">Estado: <span class="font-medium estado-badge">${atencion.estado}</span>${atencion.dias_abierta ? ` - <span class="text-orange-600 font-semibold">${atencion.dias_abierta} días abierta</span>` : ''}</p>
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
    
    // Deshabilitar botón si la atención está cerrada
    if (atencion.estado === 'cerrada') {
      editBtn.disabled = true;
      editBtn.className = "px-3 py-1 bg-gray-400 text-white text-sm rounded cursor-not-allowed";
      editBtn.title = "No se puede editar una atención cerrada";
    }
    
    actions.appendChild(toggleBtn);
    actions.appendChild(editBtn);
    
    header.appendChild(headerContent);
    header.appendChild(actions);
    card.appendChild(header);
    
    const detail = document.createElement('div');
    detail.className = "mt-4 pl-4 border-l-2 border-gray-200 hidden";
    
    // Renderizar JSON de forma jerárquica
    try {
      const data = JSON.parse(atencion.descripcion || '{}');
      
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
      mostrarModalEditarEstado(atencion);
    });
    
    reportContainer.appendChild(card);
  });
}

// Modal para editar estado
function mostrarModalEditarEstado(atencion) {
  // No permitir editar si está cerrada
  if (atencion.estado === 'cerrada') {
    mostrarError('No se puede editar una atención que ya está cerrada');
    return;
  }
  
  const modal = document.createElement('div');
  modal.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
  
  const content = document.createElement('div');
  content.className = "bg-white rounded-lg p-6 w-96 shadow-lg";
  
  content.innerHTML = `
    <h2 class="text-xl font-bold text-gray-800 mb-4">Actualizar Estado</h2>
    <p class="text-sm text-gray-600 mb-4">DNI: ${atencion.dni}</p>
    
    <select id="nuevoEstado" class="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-600">
      <option value="">-- Seleccionar estado --</option>
      <option value="abierta">Abierta</option>
      <option value="en_proceso">En progreso</option>
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
  selectEstado.value = atencion.estado;
  
  // Evento guardar
  document.getElementById('btnGuardarEstado').addEventListener('click', async () => {
    const nuevoEstado = selectEstado.value;
    
    if (!nuevoEstado) {
      alert('Por favor selecciona un estado');
      return;
    }
    
    try {
      const headers = obtenerHeaders();
      const response = await fetch(`http://127.0.0.1:8000/atenciones/${atencion.id}`, {
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
