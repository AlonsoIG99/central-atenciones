const reportContainer = document.getElementById('reportContainer');
const buscarDniInput = document.getElementById('buscar-dni');
const buscarNombreInput = document.getElementById('buscar-nombre');
const filtroEstadoInput = document.getElementById('filtro-estado');
const fechaDesdeInput = document.getElementById('fecha-desde');
const fechaHastaInput = document.getElementById('fecha-hasta');
const btnLimpiarBusqueda = document.getElementById('btn-limpiar-busqueda');

// Variables de paginación
let paginaActual = 1;
const itemsPorPagina = 10;
let atencionesFiltradas = [];

// Función para formatear el estado con emojis
function formatearEstado(estado) {
  const estados = {
    'abierta': '🔵 Abierta',
    'en_proceso': '🟡 En proceso',
    'cerrada': '🟢 Cerrada'
  };
  return estados[estado] || estado;
}

// Validar que búsqueda de DNI solo acepte números
if (buscarDniInput) {
  buscarDniInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
    paginaActual = 1;
    cargarReportes();
  });
}

// Evento para búsqueda por nombre
if (buscarNombreInput) {
  buscarNombreInput.addEventListener('input', () => {
    paginaActual = 1;
    cargarReportes();
  });
}

// Evento para filtro de estado
if (filtroEstadoInput) {
  filtroEstadoInput.addEventListener('change', () => {
    paginaActual = 1;
    cargarReportes();
  });
}

// Eventos para filtros de fecha
if (fechaDesdeInput) {
  fechaDesdeInput.addEventListener('change', () => {
    paginaActual = 1;
    cargarReportes();
  });
}

if (fechaHastaInput) {
  fechaHastaInput.addEventListener('change', () => {
    paginaActual = 1;
    cargarReportes();
  });
}

// Evento para limpiar búsqueda
if (btnLimpiarBusqueda) {
  btnLimpiarBusqueda.addEventListener('click', () => {
    if (buscarDniInput) buscarDniInput.value = '';
    if (buscarNombreInput) buscarNombreInput.value = '';
    if (filtroEstadoInput) filtroEstadoInput.value = '';
    if (fechaDesdeInput) fechaDesdeInput.value = '';
    if (fechaHastaInput) fechaHastaInput.value = '';
    paginaActual = 1;
    cargarReportes();
  });
}

// Cargar reportes
async function cargarReportes() {
  const atenciones = await obtenerAtenciones();
  const userId = localStorage.getItem('user_id');
  const rol = localStorage.getItem('rol');
  const dniSearch = buscarDniInput ? buscarDniInput.value.toLowerCase().trim() : '';
  const nombreSearch = buscarNombreInput ? buscarNombreInput.value.toLowerCase().trim() : '';
  const estadoFiltro = filtroEstadoInput ? filtroEstadoInput.value : '';
  const fechaDesde = fechaDesdeInput ? fechaDesdeInput.value : '';
  const fechaHasta = fechaHastaInput ? fechaHastaInput.value : '';
  
  // Filtrar: gestores ven solo sus atenciones, admins ven todas
  atencionesFiltradas = rol === 'administrador' 
    ? atenciones 
    : atenciones.filter(att => att.usuario_id == userId);
  
  // Filtrar por DNI si hay búsqueda
  if (dniSearch) {
    atencionesFiltradas = atencionesFiltradas.filter(att => 
      att.dni.toLowerCase().includes(dniSearch)
    );
  }
  
  // Filtrar por nombre si hay búsqueda
  if (nombreSearch) {
    atencionesFiltradas = atencionesFiltradas.filter(att => 
      att.nombre_trabajador && att.nombre_trabajador.toLowerCase().includes(nombreSearch)
    );
  }
  
  // Filtrar por estado si se selecciona
  if (estadoFiltro) {
    atencionesFiltradas = atencionesFiltradas.filter(att => 
      att.estado === estadoFiltro
    );
  }
  
  // Filtrar por rango de fechas si se especifican
  if (fechaDesde || fechaHasta) {
    atencionesFiltradas = atencionesFiltradas.filter(att => {
      // Extraer solo la fecha (YYYY-MM-DD) sin conversión UTC
      const fechaAtt = att.fecha_creacion.split('T')[0];
      
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
  
  // Ordenar por fecha más reciente primero
  atencionesFiltradas.sort((a, b) => {
    return new Date(b.fecha_creacion) - new Date(a.fecha_creacion);
  });
  
  renderizarReportes();
}

// Renderizar reportes con paginación
function renderizarReportes() {
  reportContainer.innerHTML = '';
  
  if (atencionesFiltradas.length === 0) {
    const dniSearch = buscarDniInput ? buscarDniInput.value.toLowerCase().trim() : '';
    const fechaDesde = fechaDesdeInput ? fechaDesdeInput.value : '';
    const fechaHasta = fechaHastaInput ? fechaHastaInput.value : '';
    
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
  
  // Calcular paginación
  const totalPaginas = Math.ceil(atencionesFiltradas.length / itemsPorPagina);
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const fin = inicio + itemsPorPagina;
  const atencionesPagina = atencionesFiltradas.slice(inicio, fin);
  
  atencionesPagina.forEach((atencion) => {
    const card = document.createElement('div');
    card.className = "bg-white shadow-md rounded-xl p-5 cursor-pointer hover:shadow-lg transition";
    
    const header = document.createElement('div');
    header.className = "flex justify-between items-center";
    
    const headerContent = document.createElement('div');
    headerContent.innerHTML = `
      <p class="text-lg font-semibold text-gray-800">DNI: ${atencion.dni}</p>
      ${atencion.nombre_trabajador ? `<p class="text-sm text-purple-700 font-medium"><i class="fas fa-user mr-1"></i>${atencion.nombre_trabajador}</p>` : ''}
      <p class="text-sm text-gray-500">Usuario: <span class="font-medium">${atencion.usuario_nombre || 'Desconocido'}</span></p>
      <p class="text-sm text-gray-500">Fecha: ${new Date(atencion.fecha_creacion).toLocaleDateString('es-ES')}</p>
      <p class="text-sm text-gray-600">Estado: <span class="font-medium estado-badge">${formatearEstado(atencion.estado)}</span>${atencion.dias_abierta ? ` - <span class="text-orange-600 font-semibold">${atencion.dias_abierta} días abierta</span>` : ''}</p>
      ${atencion.comentario ? `<p class="text-sm text-blue-600 mt-1"><i class="fas fa-comment-dots mr-1"></i><span class="font-medium">Comentario:</span> ${atencion.comentario}</p>` : ''}
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
          if (key === 'valor' || key === 'motivo' || key === 'tiene_archivo') return;
          
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
            if (value.motivo) {
              const mot = document.createElement('div');
              mot.className = 'ml-5 text-sm text-gray-500';
              mot.textContent = `• motivo: ${value.motivo}`;
              li.appendChild(mot);
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
    
    // Sección de documentos adjuntos
    const docsSection = document.createElement('div');
    docsSection.className = 'mt-4 pt-4 border-t border-gray-200';
    docsSection.innerHTML = '<p class="text-sm text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando documentos...</p>';
    card.appendChild(docsSection);
    
    // Cargar documentos de forma asíncrona
    obtenerDocumentosAtencion(atencion.id).then(documentos => {
      if (documentos.length > 0) {
        docsSection.innerHTML = `
          <div class="flex items-center gap-2 mb-2">
            <i class="fas fa-paperclip text-purple-600"></i>
            <span class="text-sm font-semibold text-gray-700">Documentos adjuntos (${documentos.length})</span>
          </div>
          <div class="flex flex-wrap gap-2">
            ${documentos.map(doc => `
              <a href="${doc.url_descarga}" 
                 target="_blank"
                 class="inline-flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm transition border border-red-200"
                 title="${doc.nombre_original}">
                <i class="fas fa-file-pdf"></i>
                <span class="max-w-xs truncate">${doc.nombre_original}</span>
                <i class="fas fa-external-link-alt text-xs"></i>
              </a>
            `).join('')}
          </div>
        `;
      } else {
        docsSection.innerHTML = '<p class="text-sm text-gray-400 italic"><i class="fas fa-info-circle mr-1"></i>Sin documentos adjuntos</p>';
      }
    }).catch(err => {
      console.error('Error al cargar documentos:', err);
      docsSection.innerHTML = '<p class="text-sm text-red-500"><i class="fas fa-exclamation-triangle mr-1"></i>Error al cargar documentos</p>';
    });
    
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
  
  // Agregar controles de paginación
  if (totalPaginas > 1) {
    const paginacionDiv = document.createElement('div');
    paginacionDiv.className = 'flex justify-center items-center gap-2 mt-6 flex-wrap';
    
    // Información de página
    const infoSpan = document.createElement('span');
    infoSpan.className = 'text-sm text-gray-600 mr-4';
    infoSpan.textContent = `Página ${paginaActual} de ${totalPaginas} (${atencionesFiltradas.length} registros)`;
    paginacionDiv.appendChild(infoSpan);
    
    // Botón Primera
    const btnPrimera = document.createElement('button');
    btnPrimera.textContent = '« Primera';
    btnPrimera.className = `px-4 py-2 rounded-lg transition ${paginaActual === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`;
    btnPrimera.disabled = paginaActual === 1;
    btnPrimera.onclick = () => {
      paginaActual = 1;
      renderizarReportes();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    paginacionDiv.appendChild(btnPrimera);
    
    // Botón Anterior
    const btnAnterior = document.createElement('button');
    btnAnterior.textContent = '‹ Anterior';
    btnAnterior.className = `px-4 py-2 rounded-lg transition ${paginaActual === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`;
    btnAnterior.disabled = paginaActual === 1;
    btnAnterior.onclick = () => {
      paginaActual--;
      renderizarReportes();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    paginacionDiv.appendChild(btnAnterior);
    
    // Números de página (mostrar 5 páginas alrededor de la actual)
    const rango = 2;
    let inicio = Math.max(1, paginaActual - rango);
    let fin = Math.min(totalPaginas, paginaActual + rango);
    
    for (let i = inicio; i <= fin; i++) {
      const btnPagina = document.createElement('button');
      btnPagina.textContent = i;
      btnPagina.className = `w-10 h-10 rounded-lg transition ${i === paginaActual ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`;
      btnPagina.onclick = () => {
        paginaActual = i;
        renderizarReportes();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
      paginacionDiv.appendChild(btnPagina);
    }
    
    // Botón Siguiente
    const btnSiguiente = document.createElement('button');
    btnSiguiente.textContent = 'Siguiente ›';
    btnSiguiente.className = `px-4 py-2 rounded-lg transition ${paginaActual === totalPaginas ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`;
    btnSiguiente.disabled = paginaActual === totalPaginas;
    btnSiguiente.onclick = () => {
      paginaActual++;
      renderizarReportes();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    paginacionDiv.appendChild(btnSiguiente);
    
    // Botón Última
    const btnUltima = document.createElement('button');
    btnUltima.textContent = 'Última »';
    btnUltima.className = `px-4 py-2 rounded-lg transition ${paginaActual === totalPaginas ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`;
    btnUltima.disabled = paginaActual === totalPaginas;
    btnUltima.onclick = () => {
      paginaActual = totalPaginas;
      renderizarReportes();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    paginacionDiv.appendChild(btnUltima);
    
    reportContainer.appendChild(paginacionDiv);
  }
}

// Modal para editar estado
function mostrarModalEditarEstado(atencion) {
  // Permitir editar cualquier atención que no esté cerrada
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
    <p class="text-sm text-gray-700 mb-4">Estado actual: <span class="font-semibold">${atencion.estado === 'en_proceso' ? 'En proceso' : atencion.estado === 'abierta' ? 'Abierta' : 'Cerrada'}</span></p>
    
    <select id="nuevoEstado" class="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-600">
      <option value="">-- Seleccionar estado --</option>
      <option value="cerrada">🟢 Cerrada</option>
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
      const response = await fetchConAutoRefresh(`${API_URL}/atenciones/${atencion.id}`, {
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
