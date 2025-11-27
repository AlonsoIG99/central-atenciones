// Generar reporte dashboard
async function generarReporteDashboard() {
  try {
    const headers = obtenerHeaders();
    const response = await fetch('http://127.0.0.1:8000/reporte-dashboards/generar', {
      method: 'POST',
      headers
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const error = await response.json();
      mostrarError(error.detail || 'Error al generar reporte');
      return null;
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarError('Error de conexión al servidor');
    return null;
  }
}

// Obtener últimos registros del reporte dashboard
async function obtenerUltimosRegistrosDashboard(cantidad = 5) {
  try {
    const headers = obtenerHeaders();
    const response = await fetch(`http://127.0.0.1:8000/reporte-dashboards/ultimos?cantidad=${cantidad}`, {
      method: 'GET',
      headers
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const error = await response.json();
      mostrarError(error.detail || 'Error al obtener registros');
      return [];
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarError('Error de conexión al servidor');
    return [];
  }
}

// Obtener todos los registros del reporte dashboard
async function obtenerTodosDashboard() {
  try {
    const headers = obtenerHeaders();
    const response = await fetch('http://127.0.0.1:8000/reporte-dashboards/', {
      method: 'GET',
      headers
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const error = await response.json();
      mostrarError(error.detail || 'Error al obtener reportes');
      return [];
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarError('Error de conexión al servidor');
    return [];
  }
}

// Evento del botón Generar Reporte
document.addEventListener('DOMContentLoaded', () => {
  const btnGenerarDashboard = document.getElementById('btn-generar-dashboard');
  
  if (btnGenerarDashboard) {
    btnGenerarDashboard.addEventListener('click', async () => {
      btnGenerarDashboard.disabled = true;
      btnGenerarDashboard.textContent = 'Generando...';
      
      const resultado = await generarReporteDashboard();
      
      if (resultado) {
        // Mostrar mensaje de éxito
        const resultadoDiv = document.getElementById('dashboard-generar-resultado');
        resultadoDiv.className = 'mt-4 p-4 rounded-lg border-2 bg-green-50 border-green-300';
        resultadoDiv.innerHTML = `
          <p class="text-green-800 font-semibold">✓ ${resultado.mensaje}</p>
          <p class="text-green-700 text-sm mt-1">Se generaron ${resultado.registros_generados} registros</p>
        `;
        resultadoDiv.classList.remove('hidden');
        
        mostrarExito('Reporte generado exitosamente');
        
        // Cargar y mostrar los últimos 5 registros
        const ultimos = await obtenerUltimosRegistrosDashboard(5);
        mostrarUltimosRegistrosDashboard(ultimos);
      } else {
        const resultadoDiv = document.getElementById('dashboard-generar-resultado');
        resultadoDiv.className = 'mt-4 p-4 rounded-lg border-2 bg-red-50 border-red-300';
        resultadoDiv.innerHTML = `<p class="text-red-800 font-semibold">✗ Error al generar el reporte</p>`;
        resultadoDiv.classList.remove('hidden');
      }
      
      btnGenerarDashboard.disabled = false;
      btnGenerarDashboard.textContent = 'Generar Reporte';
    });
  }
});

// Mostrar últimos registros en la tabla
function mostrarUltimosRegistrosDashboard(registros) {
  const container = document.getElementById('dashboard-ultimos-container');
  const tbody = document.getElementById('dashboard-ultimos-tbody');
  
  tbody.innerHTML = '';
  
  if (registros.length === 0) {
    container.classList.add('hidden');
    return;
  }
  
  registros.forEach((registro) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-gray-100 transition';
    
    tr.innerHTML = `
      <td class="border border-gray-300 px-3 py-2 text-sm font-semibold text-blue-600">${registro.dni}</td>
      <td class="border border-gray-300 px-3 py-2 text-sm">${registro.titulo_incidencia || '-'}</td>
      <td class="border border-gray-300 px-3 py-2 text-sm">
        <span class="px-2 py-1 rounded text-white text-xs font-semibold ${
          registro.estado_incidencia === 'cerrada' ? 'bg-red-500' :
          registro.estado_incidencia === 'en_proceso' ? 'bg-yellow-500' :
          'bg-green-500'
        }">${registro.estado_incidencia}</span>
      </td>
      <td class="border border-gray-300 px-3 py-2 text-sm">${registro.usuario_nombre || '-'}</td>
      <td class="border border-gray-300 px-3 py-2 text-sm">${registro.usuario_area || '-'}</td>
      <td class="border border-gray-300 px-3 py-2 text-sm">${registro.nombre_completo_trabajador || '-'}</td>
      <td class="border border-gray-300 px-3 py-2 text-sm">${registro.zona || '-'}</td>
      <td class="border border-gray-300 px-3 py-2 text-sm font-semibold">${registro.dias_abierta ? registro.dias_abierta + ' días' : '-'}</td>
    `;
    
    tbody.appendChild(tr);
  });
  
  container.classList.remove('hidden');
}

// Generar visualización del dashboard
async function generarVisualizacionDashboard() {
  try {
    // Obtener todos los reportes
    const reportes = await obtenerTodosDashboard();
    
    if (reportes.length === 0) {
      mostrarError('No hay datos en el reporte para generar el dashboard');
      return;
    }
    
    // Contar por tipo de incidencia (extrayendo del JSON de descripcion)
    let contadores = {
      "Pago correcto": 0,
      "Pago incorrecto": 0,
      "Apoyo económico/Préstamo": 0,
      "Otros/Soporte": 0
    };
    
    reportes.forEach(reporte => {
      try {
        // Parsear el JSON de descripcion_incidencia
        const descripcion = JSON.parse(reporte.descripcion_incidencia || '{}');
        
        // Obtener todas las claves del objeto JSON y contar cada una
        const tiposIncidencia = Object.keys(descripcion);
        
        tiposIncidencia.forEach(tipo => {
          if (tipo === "Pago correcto") {
            contadores["Pago correcto"]++;
          } else if (tipo === "Pago incorrecto") {
            contadores["Pago incorrecto"]++;
          } else if (tipo === "Apoyo económico/Préstamo") {
            contadores["Apoyo económico/Préstamo"]++;
          } else if (tipo === "Otros/Soporte") {
            contadores["Otros/Soporte"]++;
          }
        });
      } catch (e) {
        console.warn('Error parseando descripción:', e);
      }
    });
    
    // Calcular el total de conteos (puede ser mayor que reportes.length si hay múltiples tipos por registro)
    const total = contadores["Pago correcto"] + contadores["Pago incorrecto"] + contadores["Apoyo económico/Préstamo"] + contadores["Otros/Soporte"];
    
    // Actualizar UI con el total de incidencias
    document.getElementById('dashboard-total').textContent = total;
    
    // Actualizar barras de progreso
    actualizarBarra('pago-correcto', contadores["Pago correcto"], total);
    actualizarBarra('pago-incorrecto', contadores["Pago incorrecto"], total);
    actualizarBarra('apoyo-economico', contadores["Apoyo económico/Préstamo"], total);
    actualizarBarra('otros-soporte', contadores["Otros/Soporte"], total);
    
    // Mostrar dashboard
    document.getElementById('dashboard-visualizacion').classList.remove('hidden');
    
  } catch (error) {
    console.error('Error:', error);
    mostrarError('Error al generar el dashboard');
  }
}

// Actualizar barra de progreso
function actualizarBarra(tipo, cantidad, total) {
  const porcentaje = total > 0 ? Math.round((cantidad / total) * 100) : 0;
  
  document.getElementById(`${tipo}-count`).textContent = cantidad;
  document.getElementById(`${tipo}-percent`).textContent = `${porcentaje}%`;
  document.getElementById(`${tipo}-bar`).style.width = `${porcentaje}%`;
}

// Evento del botón Generar Dashboard
document.addEventListener('DOMContentLoaded', () => {
  const btnGenerarVisualizacion = document.getElementById('btn-generar-visualizacion');
  
  if (btnGenerarVisualizacion) {
    btnGenerarVisualizacion.addEventListener('click', async () => {
      btnGenerarVisualizacion.disabled = true;
      btnGenerarVisualizacion.textContent = 'Abriendo...';
      
      // Abrir dashboard con slides en una nueva pestaña
      window.open('dashboard-slides.html', 'dashboard', 'width=1600,height=900');
      
      btnGenerarVisualizacion.disabled = false;
      btnGenerarVisualizacion.textContent = 'Generar Dashboard';
    });
  }
});

