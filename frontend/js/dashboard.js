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

