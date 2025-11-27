// Cargar dashboard al abrir la página
async function cargarDashboard() {
  await actualizarMetricas();
  await crearGraficos();
  await llenarTabla();
}

// Obtener todos los registros del dashboard
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
      console.error('Error al obtener registros');
      return [];
    }
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

// Actualizar métricas
async function actualizarMetricas() {
  const datos = await obtenerTodosDashboard();
  
  const total = datos.length;
  const pagoCorrect = datos.filter(d => {
    try {
      const desc = JSON.parse(d.descripcion_incidencia || '{}');
      return Object.keys(desc).includes('pago_correcto');
    } catch {
      return false;
    }
  }).length;
  
  const pagoIncorrecto = datos.filter(d => {
    try {
      const desc = JSON.parse(d.descripcion_incidencia || '{}');
      return Object.keys(desc).includes('pago_incorrecto');
    } catch {
      return false;
    }
  }).length;
  
  const apoyoEconomico = datos.filter(d => {
    try {
      const desc = JSON.parse(d.descripcion_incidencia || '{}');
      return Object.keys(desc).includes('apoyo_economico') || Object.keys(desc).includes('prestamo');
    } catch {
      return false;
    }
  }).length;

  document.getElementById('metric-total').textContent = total;
  document.getElementById('metric-pago-correcto').textContent = pagoCorrect;
  document.getElementById('metric-pago-incorrecto').textContent = pagoIncorrecto;
  document.getElementById('metric-apoyo-economico').textContent = apoyoEconomico;
}

// Crear gráficos
async function crearGraficos() {
  const datos = await obtenerTodosDashboard();
  
  const tipos = {
    'pago_correcto': 0,
    'pago_incorrecto': 0,
    'apoyo_economico': 0,
    'prestamo': 0,
    'otros': 0
  };

  datos.forEach(d => {
    try {
      const desc = JSON.parse(d.descripcion_incidencia || '{}');
      const keys = Object.keys(desc);
      keys.forEach(key => {
        if (key in tipos) {
          tipos[key]++;
        }
      });
    } catch {
      tipos['otros']++;
    }
  });

  const labels = ['Pago Correcto', 'Pago Incorrecto', 'Apoyo Económico', 'Préstamo', 'Otros'];
  const valores = [tipos['pago_correcto'], tipos['pago_incorrecto'], tipos['apoyo_economico'], tipos['prestamo'], tipos['otros']];
  const colores = ['#10b981', '#ef4444', '#3b82f6', '#8b5cf6', '#6b7280'];

  // Gráfico Dona
  const ctxDona = document.getElementById('chart-dona').getContext('2d');
  new Chart(ctxDona, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: valores,
        backgroundColor: colores,
        borderColor: '#1f2937',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: '#e5e7eb'
          }
        }
      }
    }
  });

  // Gráfico Barras
  const ctxBarras = document.getElementById('chart-barras').getContext('2d');
  new Chart(ctxBarras, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Cantidad',
        data: valores,
        backgroundColor: colores,
        borderColor: '#1f2937',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      indexAxis: 'y',
      plugins: {
        legend: {
          labels: {
            color: '#e5e7eb'
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#e5e7eb'
          },
          grid: {
            color: '#374151'
          }
        },
        y: {
          ticks: {
            color: '#e5e7eb'
          },
          grid: {
            color: '#374151'
          }
        }
      }
    }
  });
}

// Llenar tabla con últimos registros
async function llenarTabla() {
  const datos = await obtenerTodosDashboard();
  const tbody = document.getElementById('tabla-registros');
  tbody.innerHTML = '';

  // Tomar últimos 20 registros
  const ultimos = datos.slice(-20).reverse();

  ultimos.forEach(d => {
    const row = document.createElement('tr');
    row.className = 'border-b border-gray-700 hover:bg-gray-700 transition';
    
    let tipo = 'Otros';
    try {
      const desc = JSON.parse(d.descripcion_incidencia || '{}');
      const keys = Object.keys(desc);
      if (keys.length > 0) {
        tipo = keys[0].replace(/_/g, ' ').toUpperCase();
      }
    } catch {}

    row.innerHTML = `
      <td class="px-4 py-3">${d.dni || '-'}</td>
      <td class="px-4 py-3">${d.trabajador_nombre || '-'}</td>
      <td class="px-4 py-3">${d.usuario_name || '-'}</td>
      <td class="px-4 py-3 text-sm">${tipo}</td>
      <td class="px-4 py-3">${d.estado_incidencia || '-'}</td>
      <td class="px-4 py-3">${d.dias_abierta || '-'}</td>
      <td class="px-4 py-3 text-sm">${new Date(d.fecha_generacion).toLocaleDateString() || '-'}</td>
    `;
    tbody.appendChild(row);
  });
}

// Ejecutar al cargar la página
window.addEventListener('load', cargarDashboard);
