let currentSlide = 1;
const totalSlides = 8;
let charts = {};

// Registrar el plugin de datalabels
Chart.register(ChartDataLabels);

// Función auxiliar para extraer hojas finales del JSON de descripción
function extraerConsultasDeDescripcion(descripcionJson) {
  const leaves = [];
  
  function extractLeaves(data, path = []) {
    for (const [key, value] of Object.entries(data)) {
      const currentPath = [...path, key];
      
      if (!value || typeof value !== 'object') {
        continue;
      }
      
      const keys = Object.keys(value);
      const hasChildren = keys.some(k => !['valor', 'motivo'].includes(k));
      
      if (!hasChildren) {
        // Es una hoja final
        leaves.push(currentPath.join(' > '));
      } else {
        // Tiene children, continuar recursivamente
        for (const [childKey, childValue] of Object.entries(value)) {
          if (!['valor', 'motivo'].includes(childKey) && childValue && typeof childValue === 'object') {
            extractLeaves({ [childKey]: childValue }, currentPath);
          }
        }
      }
    }
  }
  
  try {
    const data = typeof descripcionJson === 'string' ? JSON.parse(descripcionJson) : descripcionJson;
    extractLeaves(data);
  } catch (e) {
    console.error('Error al parsear descripción:', e);
  }
  
  return leaves;
}

// Función para obtener consultas de una atención (compatible con atenciones antiguas)
function obtenerConsultas(atencion) {
  // Si ya tiene el campo consultas, usarlo
  if (atencion.consultas && Array.isArray(atencion.consultas) && atencion.consultas.length > 0) {
    return atencion.consultas;
  }
  
  // Si no, extraer del campo descripcion
  if (atencion.descripcion_atencion) {
    return extraerConsultasDeDescripcion(atencion.descripcion_atencion);
  }
  
  return [];
}

// Obtener todos los datos del dashboard
async function obtenerDatosDashboard() {
  try {
    const headers = obtenerHeaders();
    const response = await fetchConAutoRefresh(`${API_URL}/reporte-dashboards/`, {
      method: 'GET',
      headers
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error('Error al obtener datos');
      return [];
    }
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

// Mostrar un slide específico
function mostrarSlide(numero) {
  // Ocultar todos los slides
  document.querySelectorAll('.slide-container').forEach(slide => {
    slide.classList.remove('active');
  });

  // Mostrar el slide actual
  const slide = document.getElementById(`slide-${numero}`);
  if (slide) {
    slide.classList.add('active');
  }

  // Actualizar número de slide
  const slideNumberEl = document.getElementById('slide-number');
  if (slideNumberEl) {
    slideNumberEl.textContent = numero;
  }

  // Actualizar dots
  document.querySelectorAll('.slide-dot').forEach((dot, index) => {
    if (index + 1 === numero) {
      dot.classList.add('active', 'bg-indigo-600');
      dot.classList.remove('bg-gray-600');
    } else {
      dot.classList.remove('active', 'bg-indigo-600');
      dot.classList.add('bg-gray-600');
    }
  });

  // Redibujar gráficos si es el primer slide
  if (numero === 1) {
    setTimeout(() => {
      // Destruir y recrear los gráficos
      if (charts['macrozona']) charts['macrozona'].destroy();
      if (charts['compania']) charts['compania'].destroy();
      if (charts['tipos']) charts['tipos'].destroy();
      
      obtenerDatosDashboard().then(datos => {
        if (datos.length > 0) {
          crearGraficoMacrozona(datos);
          crearGraficoCompania(datos);
          crearGraficoTipos(datos);
        }
      });
    }, 100);
  }

  // Redibujar gráficos del slide 4
  if (numero === 4) {
    setTimeout(() => {
      if (charts['canales']) charts['canales'].destroy();
      if (charts['usuarios']) charts['usuarios'].destroy();
      
      obtenerDatosDashboard().then(datos => {
        if (datos.length > 0) {
          crearGraficoCanales(datos);
          crearGraficoUsuarios(datos);
        }
      });
    }, 100);
  }

  // Redibujar gráfico del slide 5
  if (numero === 5) {
    setTimeout(() => {
      if (charts['atenciones-dia']) charts['atenciones-dia'].destroy();
      
      obtenerDatosDashboard().then(datos => {
        if (datos.length > 0) {
          crearGraficoAtencionesPorDia(datos);
        }
      });
    }, 100);
  }

  // Redibujar gráfico del slide 6
  if (numero === 6) {
    setTimeout(() => {
      if (charts['top-trabajadores']) charts['top-trabajadores'].destroy();
      
      obtenerDatosDashboard().then(datos => {
        if (datos.length > 0) {
          const topN = parseInt(document.getElementById('filtro-top-slide6')?.value || '20');
          crearGraficoTopTrabajadores(datos, topN);
        }
      });
    }, 100);
  }

  // Redibujar gráfico del slide 7
  if (numero === 7) {
    setTimeout(() => {
      if (charts['atenciones-mes']) charts['atenciones-mes'].destroy();
      
      obtenerDatosDashboard().then(datos => {
        if (datos.length > 0) {
          crearGraficoAtencionesPorMes(datos);
        }
      });
    }, 100);
  }

  // Redibujar gráficos del slide 8
  if (numero === 8) {
    setTimeout(() => {
      if (charts['prestamos-macrozona']) charts['prestamos-macrozona'].destroy();
      if (charts['montos-prestamos-macrozona']) charts['montos-prestamos-macrozona'].destroy();
      
      obtenerDatosDashboard().then(datos => {
        if (datos.length > 0) {
          crearGraficoPrestamosPorMacrozona(datos);
          crearGraficoMontosPorMacrozona(datos);
          crearTablaMontosPorUsuario(datos);
        }
      });
    }, 100);
  }

  currentSlide = numero;
}

// Crear los dots de navegación
function crearDots() {
  const dotsContainer = document.getElementById('slide-dots');
  for (let i = 1; i <= totalSlides; i++) {
    const dot = document.createElement('button');
    dot.className = `slide-dot w-3 h-3 rounded-full bg-gray-600 hover:bg-gray-400 transition ${i === 1 ? 'active bg-indigo-600' : ''}`;
    dot.addEventListener('click', () => mostrarSlide(i));
    dotsContainer.appendChild(dot);
  }
}

// Crear gráfico de Pie: Macrozona
async function crearGraficoMacrozona(datos) {
  const macrozonasMap = {};
  
  datos.forEach(d => {
    const macrozona = d.macrozona || 'Sin especificar';
    const consultas = obtenerConsultas(d);
    macrozonasMap[macrozona] = (macrozonasMap[macrozona] || 0) + consultas.length;
  });

  console.log('Macrozonas encontradas:', macrozonasMap);

  const labels = Object.keys(macrozonasMap);
  const values = Object.values(macrozonasMap);
  const colores = [
    '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4',
    '#8b5cf6', '#ef4444', '#f97316', '#14b8a6', '#3b82f6'
  ];

  const ctx = document.getElementById('chart-macrozona');
  if (!ctx) return;

  if (charts['macrozona']) {
    charts['macrozona'].destroy();
  }

  charts['macrozona'] = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: colores.slice(0, labels.length),
        borderColor: '#1f2937',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'left',
          labels: {
            color: '#e5e7eb',
            font: { size: 10 },
            padding: 8,
            boxWidth: 12,
            boxHeight: 12
          },
          maxHeight: 400,
          maxWidth: 200
        },
        datalabels: {
          color: '#ffffff',
          font: {
            size: 10,
            weight: 'bold'
          },
          formatter: (value, ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(2);
            if (percentage < 3) return '';
            return `${value}\n(${percentage}%)`;
          },
          anchor: 'end',
          align: 'start',
          offset: -10
        }
      },
      layout: {
        padding: {
          top: 10,
          bottom: 10,
          left: 10,
          right: 50
        }
      }
    },
    plugins: [{
      id: 'textCenter',
      beforeDatasetsDraw(chart) {
        const {ctx, chartArea: {left, top, width, height}} = chart;
        ctx.save();
      }
    }]
  });
}

// Crear gráfico de Barras Verticales: Razón Social
async function crearGraficoCompania(datos) {
  const companiasMap = {};
  
  datos.forEach(d => {
    const compania = d.tipo_compania || 'Sin especificar';
    const consultas = obtenerConsultas(d);
    companiasMap[compania] = (companiasMap[compania] || 0) + consultas.length;
  });

  const labels = Object.keys(companiasMap);
  const values = Object.values(companiasMap);
  const colores = [
    '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4',
    '#8b5cf6', '#ef4444', '#f97316', '#14b8a6', '#3b82f6'
  ];

  const ctx = document.getElementById('chart-compania');
  if (!ctx) return;

  if (charts['compania']) {
    charts['compania'].destroy();
  }

  charts['compania'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Atenciones',
        data: values,
        backgroundColor: colores.slice(0, labels.length),
        borderColor: '#1f2937',
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'x',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#e5e7eb'
          }
        },
        datalabels: {
          color: '#ffffff',
          anchor: 'end',
          align: 'top',
          offset: 2,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      layout: {
        padding: {
          top: 20,
          bottom: 10,
          left: 10,
          right: 10
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

// Crear gráfico de Barras Horizontal: Tipos de Consultas
async function crearGraficoTipos(datos) {
  const tiposMap = {
    'Pago correcto': 0,
    'Pago incorrecto': 0,
    'Apoyo económico/Préstamo': 0,
    'Otros/Soporte': 0,
    'Canasta navideña': 0
  };

  datos.forEach(d => {
    const consultas = obtenerConsultas(d);
    // Cada consulta es un string con formato "Tipo > Subtipo > ..."
    consultas.forEach(consulta => {
      // Extraer el primer nivel (tipo principal)
      const tipoPrincipal = consulta.split(' > ')[0];
      if (tiposMap.hasOwnProperty(tipoPrincipal)) {
        tiposMap[tipoPrincipal]++;
      }
    });
  });

  // Ordenar por cantidad de mayor a menor
  const tiposOrdenados = Object.entries(tiposMap)
    .sort((a, b) => b[1] - a[1]);

  const labels = tiposOrdenados.map(t => t[0]);
  const values = tiposOrdenados.map(t => t[1]);
  
  // Asignar colores según el tipo
  const coloresMap = {
    'Pago correcto': '#10b981',
    'Pago incorrecto': '#ef4444',
    'Apoyo económico/Préstamo': '#3b82f6',
    'Otros/Soporte': '#8b5cf6'
  };
  const colores = labels.map(label => coloresMap[label]);

  const ctx = document.getElementById('chart-tipos');
  if (!ctx) return;

  if (charts['tipos']) {
    charts['tipos'].destroy();
  }

  charts['tipos'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Cantidad',
        data: values,
        backgroundColor: colores,
        borderColor: '#1f2937',
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#e5e7eb'
          }
        },
        datalabels: {
          color: '#ffffff',
          anchor: 'end',
          align: 'end',
          offset: 4,
          font: {
            size: 12,
            weight: 'bold'
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
            color: '#e5e7eb',
            font: {
              size: 14
            }
          },
          grid: {
            color: '#374151'
          }
        }
      }
    }
  });
}

// Cargar y crear todos los gráficos del slide 1
async function cargarGraficos() {
  const datos = await obtenerDatosDashboard();
  
  if (datos.length > 0) {
    await crearGraficoMacrozona(datos);
    await crearGraficoCompania(datos);
    await crearGraficoTipos(datos);
    actualizarTotal(datos);
    
    // Cargar gráfico del slide 3
    await crearGraficoMacrozonasTipos(datos);
    actualizarTotalSlide3(datos);
    
    // Cargar gráficos del slide 4
    await crearGraficoCanales(datos);
    await crearGraficoUsuarios(datos);
    actualizarTotalSlide4(datos);
    
    // Cargar gráfico del slide 5
    await crearGraficoAtencionesPorDia(datos);
    actualizarTotalSlide5(datos);
    
    // Cargar gráfico del slide 6
    await crearGraficoTopTrabajadores(datos);
    actualizarTotalSlide6(datos);
    
    // Cargar gráfico del slide 7
    await crearGraficoAtencionesPorMes(datos);
    actualizarTotalSlide7(datos);
    
    // Cargar gráficos del slide 8
    await crearGraficoPrestamosPorMacrozona(datos);
    await crearGraficoMontosPorMacrozona(datos);
    await crearTablaMontosPorUsuario(datos);
    actualizarEstadisticasSlide8(datos);
    
    // Cargar datos para slide 2
    cargarDatosSlide2(datos);
    
    // Cargar datos para slide 4
    cargarDatosSlide4(datos);
    
    // Cargar datos para slide 6
    cargarDatosSlide6(datos);
    
    // Cargar datos para slide 7
    cargarDatosSlide7(datos);
  }
}

// Cargar datos y opciones para slide 2
async function cargarDatosSlide2(datos) {
  // Poblar select de cliente
  const clientes = [...new Set(datos.map(d => d.cliente).filter(Boolean))];
  const selectCliente = document.getElementById('filtro-cliente');
  clientes.forEach(cliente => {
    const option = document.createElement('option');
    option.value = cliente;
    option.textContent = cliente;
    selectCliente.appendChild(option);
  });

  // Poblar select de tipo de atención (nivel 1 del JSON)
  const tiposAtencion = new Set();
  datos.forEach(d => {
    try {
      const desc = JSON.parse(d.descripcion_atencion || '{}');
      for (const tipo in desc) {
        if (desc[tipo] && typeof desc[tipo] === 'object') {
          tiposAtencion.add(tipo);
        }
      }
    } catch (e) {
      // Ignorar errores
    }
  });
  
  const selectTipoAtencion = document.getElementById('filtro-tipo-atencion');
  Array.from(tiposAtencion).forEach(tipo => {
    const option = document.createElement('option');
    option.value = tipo;
    option.textContent = tipo;
    selectTipoAtencion.appendChild(option);
  });

  // Poblar select de jurisdicción
  const jurisdicciones = [...new Set(datos.map(d => d.jurisdiccion).filter(Boolean))];
  const selectJurisdiccion = document.getElementById('filtro-jurisdiccion');
  jurisdicciones.forEach(jurisdiccion => {
    const option = document.createElement('option');
    option.value = jurisdiccion;
    option.textContent = jurisdiccion;
    selectJurisdiccion.appendChild(option);
  });

  // Crear gráfico inicial
  crearGraficoDetalleSlide2(datos);
  
  // Mostrar total inicial de atenciones
  document.getElementById('total-atenciones-slide2').textContent = datos.length;
  
  // Cargar tabla de jurisdicciones
  actualizarTablaJurisdicciones(datos);
}

// Crear gráfico de detalle del slide 2 (segundo nivel del JSON)
async function crearGraficoDetalleSlide2(datos) {
  const detalleMap = {};
  const tipoAtencionFiltro = document.getElementById('filtro-tipo-atencion').value;

  datos.forEach(d => {
    try {
      const desc = JSON.parse(d.descripcion_atencion || '{}');
      
      // Si hay filtro de tipo de atención, solo procesar ese tipo
      if (tipoAtencionFiltro) {
        if (desc[tipoAtencionFiltro] && typeof desc[tipoAtencionFiltro] === 'object') {
          for (const detalle in desc[tipoAtencionFiltro]) {
            // Agrupar "Aprobado" y "No aprobado" como "Préstamo"
            let detalleNombre = detalle;
            if (detalle === 'Aprobado' || detalle === 'No aprobado') {
              detalleNombre = 'Préstamo';
            }
            detalleMap[detalleNombre] = (detalleMap[detalleNombre] || 0) + 1;
          }
        }
      } else {
        // Si no hay filtro, procesar todos los tipos
        for (const tipo in desc) {
          if (desc[tipo] && typeof desc[tipo] === 'object') {
            for (const detalle in desc[tipo]) {
              // Agrupar "Aprobado" y "No aprobado" como "Préstamo"
              let detalleNombre = detalle;
              if (detalle === 'Aprobado' || detalle === 'No aprobado') {
                detalleNombre = 'Préstamo';
              }
              detalleMap[detalleNombre] = (detalleMap[detalleNombre] || 0) + 1;
            }
          }
        }
      }
    } catch (e) {
      // Ignorar errores de parseo
    }
  });

  // Ordenar por cantidad de mayor a menor
  const detalleOrdenado = Object.entries(detalleMap)
    .sort((a, b) => b[1] - a[1]);

  const labels = detalleOrdenado.map(d => d[0]);
  const values = detalleOrdenado.map(d => d[1]);
  const colores = [
    '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4',
    '#8b5cf6', '#ef4444', '#f97316', '#14b8a6', '#3b82f6'
  ];

  // Crear gráfico de barras horizontal
  const ctx = document.getElementById('chart-detalle-tipos');
  if (!ctx) return;

  if (charts['detalle-tipos']) {
    charts['detalle-tipos'].destroy();
  }

  charts['detalle-tipos'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Cantidad',
        data: values,
        backgroundColor: colores.slice(0, labels.length),
        borderColor: '#1f2937',
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#e5e7eb'
          }
        },
        datalabels: {
          color: '#ffffff',
          anchor: 'end',
          align: 'right',
          font: {
            size: 11,
            weight: 'bold'
          }
        }
      },
      layout: {
        padding: {
          right: 40
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
            color: '#e5e7eb',
            font: {
              size: 12
            }
          },
          grid: {
            color: '#374151'
          }
        }
      }
    }
  });

  // Crear gráfico de dona
  const ctxDona = document.getElementById('chart-detalle-dona');
  if (!ctxDona) return;

  if (charts['detalle-dona']) {
    charts['detalle-dona'].destroy();
  }

  charts['detalle-dona'] = new Chart(ctxDona, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: colores.slice(0, labels.length),
        borderColor: '#1f2937',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#e5e7eb',
            font: { size: 10 },
            padding: 15,
            boxWidth: 12
          }
        },
        datalabels: {
          color: '#ffffff',
          font: {
            size: 10,
            weight: 'bold'
          },
          formatter: (value, ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${value}\n${percentage}%`;
          },
          anchor: 'center',
          align: 'center'
        }
      },
      layout: {
        padding: {
          top: 10,
          bottom: 10,
          left: 10,
          right: 20
        }
      }
    }
  });
}

// Filtrar datos del slide 2
async function aplicarFiltroSlide2() {
  const cliente = document.getElementById('filtro-cliente').value;
  const tipoAtencion = document.getElementById('filtro-tipo-atencion').value;
  const jurisdiccion = document.getElementById('filtro-jurisdiccion').value;
  const fechaInicio = document.getElementById('filtro-fecha-inicio').value;
  const fechaFin = document.getElementById('filtro-fecha-fin').value;

  let datos = await obtenerDatosDashboard();

  // Aplicar filtros
  if (cliente) {
    datos = datos.filter(d => d.cliente === cliente);
  }
  if (tipoAtencion) {
    datos = datos.filter(d => {
      try {
        const desc = JSON.parse(d.descripcion_atencion || '{}');
        return desc[tipoAtencion] && typeof desc[tipoAtencion] === 'object';
      } catch (e) {
        return false;
      }
    });
  }
  if (jurisdiccion) {
    datos = datos.filter(d => d.jurisdiccion === jurisdiccion);
  }
  if (fechaInicio && fechaFin) {
    datos = filtrarPorFechas(datos, fechaInicio, fechaFin);
  }

  if (datos.length === 0) {
    alert('No hay datos para los filtros seleccionados');
    document.getElementById('total-atenciones-slide2').textContent = '0';
    return;
  }

  // Actualizar total de atenciones
  document.getElementById('total-atenciones-slide2').textContent = datos.length;

  await crearGraficoDetalleSlide2(datos);
  actualizarTablaJurisdicciones(datos);
}

// Filtrar datos por rango de fechas
function filtrarPorFechas(datos, fechaInicio, fechaFin) {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  fin.setHours(23, 59, 59, 999); // Incluir todo el último día
  
  return datos.filter(d => {
    if (!d.fecha_creacion_atencion) return false;
    const fecha = new Date(d.fecha_creacion_atencion);
    return fecha >= inicio && fecha <= fin;
  });
}

// Actualizar tabla de jurisdicciones
function actualizarTablaJurisdicciones(datos) {
  const jurisdiccionMap = {};
  
  datos.forEach(d => {
    if (d.jurisdiccion) {
      jurisdiccionMap[d.jurisdiccion] = (jurisdiccionMap[d.jurisdiccion] || 0) + 1;
    }
  });
  
  const tbody = document.getElementById('tabla-jurisdicciones');
  tbody.innerHTML = '';
  
  // Ordenar por cantidad descendente
  const sorted = Object.entries(jurisdiccionMap).sort((a, b) => b[1] - a[1]);
  
  if (sorted.length === 0) {
    tbody.innerHTML = '<tr><td colspan="2" class="text-center px-2 py-2 text-gray-400">No hay datos</td></tr>';
    return;
  }
  
  sorted.forEach(([jurisdiccion, cantidad]) => {
    const row = document.createElement('tr');
    row.className = 'border-b border-gray-700 hover:bg-gray-700 transition';
    row.innerHTML = `
      <td class="text-left px-2 py-2">${jurisdiccion}</td>
      <td class="text-right px-2 py-2 font-semibold text-indigo-400">${cantidad}</td>
    `;
    tbody.appendChild(row);
  });
}

// Actualizar el total de consultas
function actualizarTotal(datos) {
  let totalConsultas = 0;
  datos.forEach(d => {
    const consultas = obtenerConsultas(d);
    totalConsultas += consultas.length;
  });
  document.getElementById('total-atenciones').textContent = totalConsultas.toLocaleString('es-ES');
}

// Crear gráfico de macrozonas con tipos de atención (slide 3)
async function crearGraficoMacrozonasTipos(datos) {
  const ctx = document.getElementById('chart-macrozonas-tipos');
  if (!ctx) return;

  // Agrupar por macrozona y tipo de consulta
  const macrozonaMap = {};
  
  datos.forEach(d => {
    if (!d.macrozona) return;
    if (!macrozonaMap[d.macrozona]) {
      macrozonaMap[d.macrozona] = {};
    }
    
    const consultas = obtenerConsultas(d);
    consultas.forEach(consulta => {
      // Extraer el tipo principal (primer nivel)
      const tipoPrincipal = consulta.split(' > ')[0];
      macrozonaMap[d.macrozona][tipoPrincipal] = (macrozonaMap[d.macrozona][tipoPrincipal] || 0) + 1;
    });
  });

  // Obtener todos los detalles únicos
  const allDetalles = new Set();
  Object.values(macrozonaMap).forEach(detalles => {
    Object.keys(detalles).forEach(d => allDetalles.add(d));
  });
  
  const detallesArray = Array.from(allDetalles).sort();
  const macrozonas = Object.keys(macrozonaMap).sort();

  // Crear datasets para cada detalle
  const colores = [
    '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4',
    '#8b5cf6', '#ef4444', '#f97316', '#14b8a6', '#3b82f6',
    '#a855f7', '#d946ef', '#0d9488', '#2563eb', '#dc2626',
    '#ea580c', '#7c3aed', '#4f46e5', '#0891b2', '#059669'
  ];

  const datasets = detallesArray.map((detalle, index) => ({
    label: detalle,
    data: macrozonas.map(macrozona => macrozonaMap[macrozona][detalle] || 0),
    backgroundColor: colores[index % colores.length],
    borderColor: colores[index % colores.length],
    borderWidth: 1
  }));

  if (charts['macrozonas-tipos']) {
    charts['macrozonas-tipos'].destroy();
  }

  charts['macrozonas-tipos'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: macrozonas,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'x',
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#e5e7eb',
            font: { size: 10 },
            padding: 10,
            boxWidth: 10
          }
        },
        datalabels: {
          color: '#ffffff',
          anchor: 'end',
          align: 'top',
          font: {
            size: 9,
            weight: 'bold'
          },
          formatter: (value) => {
            return value > 0 ? value : '';
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            color: '#e5e7eb',
            font: { size: 11 }
          },
          grid: {
            color: '#374151'
          }
        },
        y: {
          stacked: true,
          ticks: {
            color: '#e5e7eb',
            font: { size: 11 }
          },
          grid: {
            color: '#374151'
          }
        }
      }
    }
  });
}

// Crear gráfico de dona: Canales de Atención (slide 4)
async function crearGraficoCanales(datos) {
  const ctx = document.getElementById('chart-canales');
  if (!ctx) return;

  // Agrupar por canal
  const canalesMap = {
    'llamada_telefonica': 0,
    'whatsapp': 0,
    'presencial': 0,
    'correo': 0
  };
  
  datos.forEach(d => {
    const canal = d.canal || 'llamada_telefonica';
    const consultas = obtenerConsultas(d);
    if (canalesMap.hasOwnProperty(canal)) {
      canalesMap[canal] += consultas.length;
    }
  });

  // Mapeo de nombres más legibles
  const nombresCanales = {
    'llamada_telefonica': 'Llamada Telefónica',
    'whatsapp': 'WhatsApp',
    'presencial': 'Presencial',
    'correo': 'Correo'
  };

  const labels = Object.keys(canalesMap).map(k => nombresCanales[k]);
  const values = Object.values(canalesMap);
  const colores = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  if (charts['canales']) {
    charts['canales'].destroy();
  }

  charts['canales'] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: colores,
        borderColor: '#1f2937',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#e5e7eb',
            font: { size: 12 },
            padding: 15,
            boxWidth: 15
          }
        },
        datalabels: {
          color: '#ffffff',
          font: {
            size: 14,
            weight: 'bold'
          },
          formatter: (value, ctx) => {
            const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return value > 0 ? `${value}\n(${percentage}%)` : '';
          }
        }
      }
    }
  });
}

// Crear gráfico de barras vertical: Atenciones por Usuario (slide 4)
async function crearGraficoUsuarios(datos) {
  const ctx = document.getElementById('chart-usuarios');
  if (!ctx) return;

  // Agrupar por usuario
  const usuariosMap = {};
  
  datos.forEach(d => {
    const usuario = d.usuario_nombre || 'Sin especificar';
    const consultas = obtenerConsultas(d);
    usuariosMap[usuario] = (usuariosMap[usuario] || 0) + consultas.length;
  });

  // Ordenar por cantidad descendente
  const usuariosOrdenados = Object.entries(usuariosMap)
    .sort((a, b) => b[1] - a[1]);

  const labels = usuariosOrdenados.map(u => u[0]);
  const values = usuariosOrdenados.map(u => u[1]);

  // Generar colores para cada usuario
  const colores = labels.map((_, index) => {
    const baseColors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ef4444'];
    return baseColors[index % baseColors.length];
  });

  if (charts['usuarios']) {
    charts['usuarios'].destroy();
  }

  charts['usuarios'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Cantidad de Atenciones',
        data: values,
        backgroundColor: colores,
        borderColor: colores,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'x',
      plugins: {
        legend: {
          display: false
        },
        datalabels: {
          color: '#ffffff',
          anchor: 'end',
          align: 'top',
          font: {
            size: 11,
            weight: 'bold'
          },
          formatter: (value) => {
            return value > 0 ? value : '';
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#e5e7eb',
            font: { size: 10 },
            maxRotation: 45,
            minRotation: 45
          },
          grid: {
            color: '#374151'
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#e5e7eb',
            font: { size: 11 },
            precision: 0
          },
          grid: {
            color: '#374151'
          }
        }
      }
    }
  });
}

// Cargar datos y opciones para slide 4
async function cargarDatosSlide4(datos) {
  // Poblar select de cliente
  const clientes = [...new Set(datos.map(d => d.cliente).filter(Boolean))];
  const selectCliente = document.getElementById('filtro-cliente-slide4');
  if (selectCliente) {
    // Limpiar opciones existentes excepto "Todos"
    selectCliente.innerHTML = '<option value="">Todos</option>';
    clientes.forEach(cliente => {
      const option = document.createElement('option');
      option.value = cliente;
      option.textContent = cliente;
      selectCliente.appendChild(option);
    });
  }
}

// Actualizar total de consultas en slide 4
function actualizarTotalSlide4(datos) {
  const totalEl = document.getElementById('total-atenciones-slide4');
  if (totalEl) {
    let totalConsultas = 0;
    datos.forEach(d => {
      totalConsultas += obtenerConsultas(d).length;
    });
    totalEl.textContent = totalConsultas.toLocaleString('es-ES');
  }
}

// Aplicar filtros del slide 4
async function aplicarFiltroSlide4() {
  const cliente = document.getElementById('filtro-cliente-slide4').value;
  const fechaInicio = document.getElementById('filtro-fecha-inicio-slide4').value;
  const fechaFin = document.getElementById('filtro-fecha-fin-slide4').value;
  
  let todos = await obtenerDatosDashboard();
  let datosFiltrados = todos;
  
  // Filtrar por cliente
  if (cliente) {
    datosFiltrados = datosFiltrados.filter(d => d.cliente === cliente);
  }
  
  // Filtrar por fechas
  if (fechaInicio && fechaFin) {
    datosFiltrados = filtrarPorFechas(datosFiltrados, fechaInicio, fechaFin);
  } else if (fechaInicio || fechaFin) {
    alert('Por favor completa ambas fechas o déjalas vacías');
    return;
  }
  
  if (datosFiltrados.length === 0) {
    alert('No hay datos para los filtros seleccionados');
    return;
  }
  
  // Actualizar gráficos
  await crearGraficoCanales(datosFiltrados);
  await crearGraficoUsuarios(datosFiltrados);
  actualizarTotalSlide4(datosFiltrados);
}

// Limpiar filtros del slide 4
async function limpiarFiltrosSlide4() {
  document.getElementById('filtro-cliente-slide4').value = '';
  document.getElementById('filtro-fecha-inicio-slide4').value = '';
  document.getElementById('filtro-fecha-fin-slide4').value = '';
  
  const todos = await obtenerDatosDashboard();
  await crearGraficoCanales(todos);
  await crearGraficoUsuarios(todos);
  actualizarTotalSlide4(todos);
}

// Crear gráfico de líneas: Atenciones por Día (slide 5)
async function crearGraficoAtencionesPorDia(datos) {
  const ctx = document.getElementById('chart-atenciones-dia');
  if (!ctx) return;

  // Agrupar por fecha
  const fechasMap = {};
  
  datos.forEach(d => {
    if (d.fecha_creacion_atencion) {
      // Convertir a fecha solo (sin hora)
      const fecha = new Date(d.fecha_creacion_atencion);
      const fechaStr = fecha.toISOString().split('T')[0]; // YYYY-MM-DD
      const consultas = obtenerConsultas(d);
      fechasMap[fechaStr] = (fechasMap[fechaStr] || 0) + consultas.length;
    }
  });

  // Ordenar fechas y crear arrays
  const fechasOrdenadas = Object.keys(fechasMap).sort();
  const valores = fechasOrdenadas.map(f => fechasMap[f]);
  
  // Mapeo de días de la semana
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  
  // Formatear fechas para mostrar (DD/MM/YYYY - Día)
  const labels = fechasOrdenadas.map(f => {
    const [year, month, day] = f.split('-');
    const fecha = new Date(year, month - 1, day);
    const diaSemana = diasSemana[fecha.getDay()];
    return `${day}/${month}/${year} - ${diaSemana}`;
  });

  if (charts['atenciones-dia']) {
    charts['atenciones-dia'].destroy();
  }

  charts['atenciones-dia'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Consultas',
        data: valores,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        datalabels: {
          color: '#ffffff',
          anchor: 'end',
          align: 'top',
          font: {
            size: 10,
            weight: 'bold'
          },
          formatter: (value) => {
            return value > 0 ? value : '';
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(17, 24, 39, 0.9)',
          titleColor: '#e5e7eb',
          bodyColor: '#e5e7eb',
          borderColor: '#6366f1',
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: function(context) {
              return `Atenciones: ${context.parsed.y}`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#e5e7eb',
            font: { size: 10 },
            maxRotation: 45,
            minRotation: 45
          },
          grid: {
            color: '#374151',
            display: false
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#e5e7eb',
            font: { size: 11 },
            precision: 0,
            callback: function(value) {
              return Number.isInteger(value) ? value : '';
            }
          },
          grid: {
            color: '#374151'
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    }
  });
}

// Actualizar total de atenciones en slide 5
function actualizarTotalSlide5(datos) {
  const totalEl = document.getElementById('total-atenciones-slide5');
  if (totalEl) {
    let totalConsultas = 0;
    datos.forEach(d => {
      totalConsultas += obtenerConsultas(d).length;
    });
    totalEl.textContent = totalConsultas.toLocaleString('es-ES');
  }
}

// Aplicar filtros del slide 5
async function aplicarFiltroSlide5() {
  const fechaInicio = document.getElementById('filtro-fecha-inicio-slide5').value;
  const fechaFin = document.getElementById('filtro-fecha-fin-slide5').value;
  
  if (!fechaInicio || !fechaFin) {
    alert('Por favor completa ambas fechas');
    return;
  }
  
  const todos = await obtenerDatosDashboard();
  const datosFiltrados = filtrarPorFechas(todos, fechaInicio, fechaFin);
  
  if (datosFiltrados.length === 0) {
    alert('No hay datos para el rango de fechas seleccionado');
    return;
  }
  
  // Actualizar gráfico
  await crearGraficoAtencionesPorDia(datosFiltrados);
  actualizarTotalSlide5(datosFiltrados);
}

// Limpiar filtros del slide 5
async function limpiarFiltrosSlide5() {
  document.getElementById('filtro-fecha-inicio-slide5').value = '';
  document.getElementById('filtro-fecha-fin-slide5').value = '';
  
  const todos = await obtenerDatosDashboard();
  await crearGraficoAtencionesPorDia(todos);
  actualizarTotalSlide5(todos);
}

// Crear gráfico de barras: Top Trabajadores (slide 6)
async function crearGraficoTopTrabajadores(datos, topN = 20) {
  const ctx = document.getElementById('chart-top-trabajadores');
  if (!ctx) return;

  // Agrupar por trabajador
  const trabajadoresMap = {};
  
  datos.forEach(d => {
    const trabajador = d.nombre_completo_trabajador || 'Sin especificar';
    const consultas = obtenerConsultas(d);
    trabajadoresMap[trabajador] = (trabajadoresMap[trabajador] || 0) + consultas.length;
  });

  // Ordenar por cantidad descendente y tomar el top N
  const trabajadoresOrdenados = Object.entries(trabajadoresMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN);

  const labels = trabajadoresOrdenados.map(t => t[0]);
  const values = trabajadoresOrdenados.map(t => t[1]);

  // Generar colores degradados
  const colores = values.map((_, index) => {
    const intensity = 1 - (index / topN) * 0.5;
    return `rgba(99, 102, 241, ${intensity})`;
  });

  if (charts['top-trabajadores']) {
    charts['top-trabajadores'].destroy();
  }

  charts['top-trabajadores'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Cantidad de Atenciones',
        data: values,
        backgroundColor: colores,
        borderColor: colores.map(c => c.replace(/[\d.]+\)$/g, '1)')),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: {
          display: false
        },
        datalabels: {
          color: '#ffffff',
          anchor: 'end',
          align: 'right',
          offset: 5,
          font: {
            size: 10,
            weight: 'bold'
          },
          formatter: (value) => {
            return value > 0 ? value : '';
          }
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.9)',
          titleColor: '#e5e7eb',
          bodyColor: '#e5e7eb',
          borderColor: '#6366f1',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: function(context) {
              return `Atenciones: ${context.parsed.x}`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            color: '#e5e7eb',
            font: { size: 11 },
            precision: 0
          },
          grid: {
            color: '#374151'
          }
        },
        y: {
          ticks: {
            color: '#e5e7eb',
            font: { size: 10 },
            autoSkip: false
          },
          grid: {
            color: '#374151',
            display: false
          }
        }
      }
    }
  });
}

// Cargar datos y opciones para slide 6
async function cargarDatosSlide6(datos) {
  // Poblar select de cliente
  const clientes = [...new Set(datos.map(d => d.cliente).filter(Boolean))];
  const selectCliente = document.getElementById('filtro-cliente-slide6');
  if (selectCliente) {
    selectCliente.innerHTML = '<option value="">Todos</option>';
    clientes.forEach(cliente => {
      const option = document.createElement('option');
      option.value = cliente;
      option.textContent = cliente;
      selectCliente.appendChild(option);
    });
  }
}

// Actualizar total de atenciones en slide 6
function actualizarTotalSlide6(datos) {
  const totalEl = document.getElementById('total-atenciones-slide6');
  if (totalEl) {
    let totalConsultas = 0;
    datos.forEach(d => {
      totalConsultas += obtenerConsultas(d).length;
    });
    totalEl.textContent = totalConsultas.toLocaleString('es-ES');
  }
}

// Aplicar filtros del slide 6
async function aplicarFiltroSlide6() {
  const cliente = document.getElementById('filtro-cliente-slide6').value;
  const fechaInicio = document.getElementById('filtro-fecha-inicio-slide6').value;
  const fechaFin = document.getElementById('filtro-fecha-fin-slide6').value;
  const topN = parseInt(document.getElementById('filtro-top-slide6').value);
  
  let todos = await obtenerDatosDashboard();
  let datosFiltrados = todos;
  
  // Filtrar por cliente
  if (cliente) {
    datosFiltrados = datosFiltrados.filter(d => d.cliente === cliente);
  }
  
  // Filtrar por fechas
  if (fechaInicio && fechaFin) {
    datosFiltrados = filtrarPorFechas(datosFiltrados, fechaInicio, fechaFin);
  } else if (fechaInicio || fechaFin) {
    alert('Por favor completa ambas fechas o déjalas vacías');
    return;
  }
  
  if (datosFiltrados.length === 0) {
    alert('No hay datos para los filtros seleccionados');
    return;
  }
  
  // Actualizar gráfico
  await crearGraficoTopTrabajadores(datosFiltrados, topN);
  actualizarTotalSlide6(datosFiltrados);
}

// Limpiar filtros del slide 6
async function limpiarFiltrosSlide6() {
  document.getElementById('filtro-cliente-slide6').value = '';
  document.getElementById('filtro-fecha-inicio-slide6').value = '';
  document.getElementById('filtro-fecha-fin-slide6').value = '';
  document.getElementById('filtro-top-slide6').value = '20';
  
  const todos = await obtenerDatosDashboard();
  await crearGraficoTopTrabajadores(todos, 20);
  actualizarTotalSlide6(todos);
}

// Crear gráfico de barras: Atenciones por Mes del Año Actual (slide 7)
async function crearGraficoAtencionesPorMes(datos) {
  const ctx = document.getElementById('chart-atenciones-mes');
  if (!ctx) return;

  // Obtener el año actual
  const anioActual = new Date().getFullYear();
  
  // Actualizar el año en el HTML
  const anioEl = document.getElementById('anio-actual-slide7');
  if (anioEl) {
    anioEl.textContent = anioActual;
  }

  // Filtrar solo atenciones del año actual
  const datosAnioActual = datos.filter(d => {
    if (d.fecha_creacion_atencion) {
      const fecha = new Date(d.fecha_creacion_atencion);
      return fecha.getFullYear() === anioActual;
    }
    return false;
  });

  // Inicializar meses con 0
  const mesesMap = {
    0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
    6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0
  };
  
  // Contar consultas por mes
  datosAnioActual.forEach(d => {
    if (d.fecha_creacion_atencion) {
      const fecha = new Date(d.fecha_creacion_atencion);
      const mes = fecha.getMonth(); // 0-11
      const consultas = obtenerConsultas(d);
      mesesMap[mes] += consultas.length;
    }
  });

  // Nombres de los meses
  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const labels = nombresMeses;
  const values = Object.values(mesesMap);

  // Colores para cada mes (gradiente de azul a púrpura)
  const colores = [
    '#3b82f6', '#4f46e5', '#6366f1', '#7c3aed',
    '#8b5cf6', '#a855f7', '#c026d3', '#d946ef',
    '#ec4899', '#f43f5e', '#ef4444', '#f97316'
  ];

  if (charts['atenciones-mes']) {
    charts['atenciones-mes'].destroy();
  }

  charts['atenciones-mes'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Atenciones',
        data: values,
        backgroundColor: colores,
        borderColor: colores,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        datalabels: {
          color: '#ffffff',
          anchor: 'end',
          align: 'top',
          font: {
            size: 11,
            weight: 'bold'
          },
          formatter: (value) => {
            return value > 0 ? value : '';
          }
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.9)',
          titleColor: '#e5e7eb',
          bodyColor: '#e5e7eb',
          borderColor: '#6366f1',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: function(context) {
              return `Atenciones: ${context.parsed.y}`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#e5e7eb',
            font: { size: 11 }
          },
          grid: {
            color: '#374151',
            display: false
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#e5e7eb',
            font: { size: 11 },
            precision: 0,
            callback: function(value) {
              return Number.isInteger(value) ? value : '';
            }
          },
          grid: {
            color: '#374151'
          }
        }
      }
    }
  });
}

// Actualizar total de atenciones en slide 7
function actualizarTotalSlide7(datos) {
  const anioActual = new Date().getFullYear();
  
  // Filtrar solo atenciones del año actual
  const datosAnioActual = datos.filter(d => {
    if (d.fecha_creacion_atencion) {
      const fecha = new Date(d.fecha_creacion_atencion);
      return fecha.getFullYear() === anioActual;
    }
    return false;
  });
  
  const totalEl = document.getElementById('total-atenciones-slide7');
  if (totalEl) {
    totalEl.textContent = datosAnioActual.length.toLocaleString('es-ES');
  }
}

// Cargar datos y opciones para slide 7
async function cargarDatosSlide7(datos) {
  // Poblar select de cliente
  const clientes = [...new Set(datos.map(d => d.cliente).filter(Boolean))];
  const selectCliente = document.getElementById('filtro-cliente-slide7');
  if (selectCliente) {
    selectCliente.innerHTML = '<option value="">Todos</option>';
    clientes.forEach(cliente => {
      const option = document.createElement('option');
      option.value = cliente;
      option.textContent = cliente;
      selectCliente.appendChild(option);
    });
  }
  
  // Poblar select de jurisdicción
  const jurisdicciones = [...new Set(datos.map(d => d.jurisdiccion).filter(Boolean))];
  const selectJurisdiccion = document.getElementById('filtro-jurisdiccion-slide7');
  if (selectJurisdiccion) {
    selectJurisdiccion.innerHTML = '<option value="">Todas</option>';
    jurisdicciones.forEach(jurisdiccion => {
      const option = document.createElement('option');
      option.value = jurisdiccion;
      option.textContent = jurisdiccion;
      selectJurisdiccion.appendChild(option);
    });
  }
}

// Aplicar filtros del slide 7
async function aplicarFiltroSlide7() {
  const cliente = document.getElementById('filtro-cliente-slide7').value;
  const jurisdiccion = document.getElementById('filtro-jurisdiccion-slide7').value;
  
  let todos = await obtenerDatosDashboard();
  let datosFiltrados = todos;
  
  // Filtrar por cliente
  if (cliente) {
    datosFiltrados = datosFiltrados.filter(d => d.cliente === cliente);
  }
  
  // Filtrar por jurisdicción
  if (jurisdiccion) {
    datosFiltrados = datosFiltrados.filter(d => d.jurisdiccion === jurisdiccion);
  }
  
  if (datosFiltrados.length === 0) {
    alert('No hay datos para los filtros seleccionados');
    return;
  }
  
  // Actualizar gráfico
  await crearGraficoAtencionesPorMes(datosFiltrados);
  actualizarTotalSlide7(datosFiltrados);
}

// Limpiar filtros del slide 7
async function limpiarFiltrosSlide7() {
  document.getElementById('filtro-cliente-slide7').value = '';
  document.getElementById('filtro-jurisdiccion-slide7').value = '';
  
  const todos = await obtenerDatosDashboard();
  await crearGraficoAtencionesPorMes(todos);
  actualizarTotalSlide7(todos);
}

// Crear gráfico de barras horizontal: Préstamos por Macrozona (slide 8)
async function crearGraficoPrestamosPorMacrozona(datos) {
  const ctx = document.getElementById('chart-prestamos-macrozona');
  if (!ctx) return;

  // Filtrar solo atenciones que tienen "Apoyo Económico/Préstamo"
  const prestamosPorMacrozona = {};
  
  datos.forEach(d => {
    if (d.descripcion_atencion) {
      try {
        const desc = JSON.parse(d.descripcion_atencion);
        
        // Buscar si existe "Apoyo Económico/Préstamo" en cualquier nivel del JSON
        let tienePrestamo = false;
        
        // Buscar en todos los niveles del objeto
        const buscarPrestamo = (obj) => {
          for (const key in obj) {
            if (key.includes('Préstamo') || key.includes('Prestamo') || key.includes('Apoyo Económico')) {
              return true;
            }
            if (typeof obj[key] === 'object' && obj[key] !== null) {
              if (buscarPrestamo(obj[key])) {
                return true;
              }
            }
          }
          return false;
        };
        
        tienePrestamo = buscarPrestamo(desc);
        
        if (tienePrestamo) {
          const macrozona = d.macrozona || 'Sin Macrozona';
          prestamosPorMacrozona[macrozona] = (prestamosPorMacrozona[macrozona] || 0) + 1;
        }
      } catch (e) {
        // Ignorar errores de parseo
      }
    }
  });

  // Ordenar por cantidad descendente
  const macrozonasordenadas = Object.entries(prestamosPorMacrozona)
    .sort((a, b) => b[1] - a[1]);

  const labels = macrozonasordenadas.map(m => m[0]);
  const values = macrozonasordenadas.map(m => m[1]);

  // Generar colores degradados
  const colores = values.map((_, index) => {
    const intensity = 1 - (index / values.length) * 0.5;
    return `rgba(236, 72, 153, ${intensity})`; // Rosa/magenta
  });

  if (charts['prestamos-macrozona']) {
    charts['prestamos-macrozona'].destroy();
  }

  charts['prestamos-macrozona'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Cantidad de Préstamos',
        data: values,
        backgroundColor: colores,
        borderColor: colores.map(c => c.replace(/[\d.]+\)$/g, '1)')),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: {
          display: false
        },
        datalabels: {
          color: '#ffffff',
          anchor: 'end',
          align: 'right',
          offset: 5,
          font: {
            size: 11,
            weight: 'bold'
          },
          formatter: (value) => {
            return value > 0 ? value : '';
          }
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.9)',
          titleColor: '#e5e7eb',
          bodyColor: '#e5e7eb',
          borderColor: '#ec4899',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: function(context) {
              return `Préstamos: ${context.parsed.x}`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            color: '#e5e7eb',
            font: { size: 11 },
            precision: 0
          },
          grid: {
            color: '#374151'
          }
        },
        y: {
          ticks: {
            color: '#e5e7eb',
            font: { size: 10 },
            autoSkip: false
          },
          grid: {
            color: '#374151',
            display: false
          }
        }
      }
    }
  });
}

// Crear gráfico de barras horizontal: Montos de Préstamos por Macrozona (slide 8)
async function crearGraficoMontosPorMacrozona(datos) {
  const ctx = document.getElementById('chart-montos-prestamos-macrozona');
  if (!ctx) return;

  // Sumar montos de préstamos por macrozona
  const montosPorMacrozona = {};
  
  datos.forEach(d => {
    if (d.descripcion_atencion) {
      try {
        const desc = JSON.parse(d.descripcion_atencion);
        
        // Buscar "Apoyo económico/Préstamo" -> "Aprobado" -> "valor"
        let monto = 0;
        
        for (const key in desc) {
          if (key.includes('Préstamo') || key.includes('Prestamo') || key.includes('Apoyo económico') || key.includes('Apoyo Económico')) {
            if (desc[key] && typeof desc[key] === 'object') {
              // Buscar dentro de "Aprobado"
              if (desc[key]['Aprobado'] && typeof desc[key]['Aprobado'] === 'object') {
                if (desc[key]['Aprobado']['valor']) {
                  const valor = parseFloat(desc[key]['Aprobado']['valor']);
                  if (!isNaN(valor) && valor > 0) {
                    monto = valor;
                    break;
                  }
                }
              }
            }
          }
        }
        
        if (monto > 0) {
          const macrozona = d.macrozona || 'Sin Macrozona';
          montosPorMacrozona[macrozona] = (montosPorMacrozona[macrozona] || 0) + monto;
        }
      } catch (e) {
        // Ignorar errores de parseo
      }
    }
  });

  // Ordenar por monto descendente
  const macrozonasordenadas = Object.entries(montosPorMacrozona)
    .sort((a, b) => b[1] - a[1]);

  const labels = macrozonasordenadas.map(m => m[0]);
  const values = macrozonasordenadas.map(m => m[1]);

  // Generar colores degradados (azul/cyan)
  const colores = values.map((_, index) => {
    const intensity = 1 - (index / values.length) * 0.5;
    return `rgba(59, 130, 246, ${intensity})`; // Azul
  });

  if (charts['montos-prestamos-macrozona']) {
    charts['montos-prestamos-macrozona'].destroy();
  }

  charts['montos-prestamos-macrozona'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Monto Total (S/)',
        data: values,
        backgroundColor: colores,
        borderColor: colores.map(c => c.replace(/[\d.]+\)$/g, '1)')),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: {
          display: false
        },
        datalabels: {
          color: '#ffffff',
          anchor: 'end',
          align: 'right',
          offset: 5,
          font: {
            size: 11,
            weight: 'bold'
          },
          formatter: (value) => {
            return value > 0 ? `S/ ${value.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '';
          }
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.9)',
          titleColor: '#e5e7eb',
          bodyColor: '#e5e7eb',
          borderColor: '#3b82f6',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: function(context) {
              return `Monto: S/ ${context.parsed.x.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            color: '#e5e7eb',
            font: { size: 11 },
            callback: function(value) {
              return 'S/ ' + value.toLocaleString('es-PE');
            }
          },
          grid: {
            color: '#374151'
          }
        },
        y: {
          ticks: {
            color: '#e5e7eb',
            font: { size: 10 },
            autoSkip: false
          },
          grid: {
            color: '#374151',
            display: false
          }
        }
      }
    }
  });
}

// Crear gráfico de barras horizontal: Montos de Préstamos por Usuario (slide 8)
async function crearGraficoMontosPorUsuario(datos) {
  const ctx = document.getElementById('chart-montos-prestamos-usuario');
  if (!ctx) return;

  // Sumar montos de préstamos por usuario
  const montosPorUsuario = {};
  
  datos.forEach(d => {
    if (d.descripcion_atencion && d.usuario_nombre) {
      try {
        const desc = JSON.parse(d.descripcion_atencion);
        
        // Buscar "Apoyo económico/Préstamo" -> "Aprobado" -> "valor"
        let monto = 0;
        
        for (const key in desc) {
          if (key.includes('Préstamo') || key.includes('Prestamo') || key.includes('Apoyo económico') || key.includes('Apoyo Económico')) {
            if (desc[key] && typeof desc[key] === 'object') {
              // Buscar dentro de "Aprobado"
              if (desc[key]['Aprobado'] && typeof desc[key]['Aprobado'] === 'object') {
                if (desc[key]['Aprobado']['valor']) {
                  const valor = parseFloat(desc[key]['Aprobado']['valor']);
                  if (!isNaN(valor) && valor > 0) {
                    monto = valor;
                    break;
                  }
                }
              }
            }
          }
        }
        
        if (monto > 0) {
          const usuario = d.usuario_nombre || 'Sin Usuario';
          montosPorUsuario[usuario] = (montosPorUsuario[usuario] || 0) + monto;
        }
      } catch (e) {
        // Ignorar errores de parseo
      }
    }
  });

  // Ordenar por monto descendente
  const usuariosOrdenados = Object.entries(montosPorUsuario)
    .sort((a, b) => b[1] - a[1]);

  const labels = usuariosOrdenados.map(u => u[0]);
  const values = usuariosOrdenados.map(u => u[1]);

  // Generar colores degradados (verde)
  const colores = values.map((_, index) => {
    const intensity = 1 - (index / values.length) * 0.5;
    return `rgba(16, 185, 129, ${intensity})`; // Verde
  });

  if (charts['montos-prestamos-usuario']) {
    charts['montos-prestamos-usuario'].destroy();
  }

  charts['montos-prestamos-usuario'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Monto Total (S/)',
        data: values,
        backgroundColor: colores,
        borderColor: colores.map(c => c.replace(/[\d.]+\)$/g, '1)')),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: {
          display: false
        },
        datalabels: {
          color: '#ffffff',
          anchor: 'end',
          align: 'right',
          offset: 5,
          font: {
            size: 11,
            weight: 'bold'
          },
          formatter: (value) => {
            return value > 0 ? `S/ ${value.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '';
          }
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.9)',
          titleColor: '#e5e7eb',
          bodyColor: '#e5e7eb',
          borderColor: '#10b981',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: function(context) {
              return `Monto: S/ ${context.parsed.x.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            color: '#e5e7eb',
            font: { size: 11 },
            callback: function(value) {
              return 'S/ ' + value.toLocaleString('es-PE');
            }
          },
          grid: {
            color: '#374151'
          }
        },
        y: {
          ticks: {
            color: '#e5e7eb',
            font: { size: 10 },
            autoSkip: false
          },
          grid: {
            color: '#374151',
            display: false
          }
        }
      }
    }
  });
}

// Crear tabla: Montos de Préstamos por Usuario (slide 8)
async function crearTablaMontosPorUsuario(datos) {
  const tbody = document.getElementById('tabla-montos-usuario');
  if (!tbody) return;

  // Sumar montos y cantidad de préstamos por usuario
  const datosPorUsuario = {};
  
  datos.forEach(d => {
    if (d.descripcion_atencion && d.usuario_nombre) {
      try {
        const desc = JSON.parse(d.descripcion_atencion);
        
        // Buscar "Apoyo económico/Préstamo" -> "Aprobado" -> "valor"
        let monto = 0;
        
        for (const key in desc) {
          if (key.includes('Préstamo') || key.includes('Prestamo') || key.includes('Apoyo económico') || key.includes('Apoyo Económico')) {
            if (desc[key] && typeof desc[key] === 'object') {
              // Buscar dentro de "Aprobado"
              if (desc[key]['Aprobado'] && typeof desc[key]['Aprobado'] === 'object') {
                if (desc[key]['Aprobado']['valor']) {
                  const valor = parseFloat(desc[key]['Aprobado']['valor']);
                  if (!isNaN(valor) && valor > 0) {
                    monto = valor;
                    break;
                  }
                }
              }
            }
          }
        }
        
        if (monto > 0) {
          const usuario = d.usuario_nombre || 'Sin Usuario';
          if (!datosPorUsuario[usuario]) {
            datosPorUsuario[usuario] = { cantidad: 0, monto: 0 };
          }
          datosPorUsuario[usuario].cantidad++;
          datosPorUsuario[usuario].monto += monto;
        }
      } catch (e) {
        // Ignorar errores de parseo
      }
    }
  });

  // Ordenar por monto descendente
  const usuariosOrdenados = Object.entries(datosPorUsuario)
    .sort((a, b) => b[1].monto - a[1].monto);

  // Limpiar tabla
  tbody.innerHTML = '';

  // Generar filas
  usuariosOrdenados.forEach((item, index) => {
    const [usuario, data] = item;
    const fila = document.createElement('tr');
    fila.className = 'border-b border-gray-700 hover:bg-gray-700';
    fila.innerHTML = `
      <td class="px-4 py-2 text-gray-400">${index + 1}</td>
      <td class="px-4 py-2">${usuario}</td>
      <td class="px-4 py-2 text-right text-indigo-400 font-semibold">${data.cantidad}</td>
      <td class="px-4 py-2 text-right text-green-400 font-bold">S/ ${data.monto.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
    `;
    tbody.appendChild(fila);
  });

  // Si no hay datos, mostrar mensaje
  if (usuariosOrdenados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="px-4 py-8 text-center text-gray-400">No hay datos disponibles</td></tr>';
  }
}

// Actualizar estadísticas del slide 8
function actualizarEstadisticasSlide8(datos) {
  // Contar total de solicitudes de préstamos (aprobados y no aprobados)
  let totalSolicitudes = 0;
  let totalAprobados = 0;
  let sumaMontos = 0;
  
  datos.forEach(d => {
    if (d.descripcion_atencion) {
      try {
        const desc = JSON.parse(d.descripcion_atencion);
        
        // Buscar si existe "Apoyo económico/Préstamo" o "Apoyo Económico/Préstamo"
        for (const key in desc) {
          if (key.includes('Préstamo') || key.includes('Prestamo') || key.includes('Apoyo económico') || key.includes('Apoyo Económico')) {
            totalSolicitudes++;
            
            // Verificar si está aprobado y obtener el monto
            if (desc[key] && typeof desc[key] === 'object') {
              if (desc[key]['Aprobado'] && typeof desc[key]['Aprobado'] === 'object') {
                totalAprobados++;
                
                if (desc[key]['Aprobado']['valor']) {
                  const valor = parseFloat(desc[key]['Aprobado']['valor']);
                  if (!isNaN(valor) && valor > 0) {
                    sumaMontos += valor;
                  }
                }
              }
            }
            break;
          }
        }
      } catch (e) {
        // Ignorar errores
      }
    }
  });
  
  const promedio = totalAprobados > 0 ? sumaMontos / totalAprobados : 0;
  
  // Actualizar elementos HTML
  const totalSolicitudesEl = document.getElementById('total-solicitudes-slide8');
  const totalAprobadosEl = document.getElementById('total-prestamos-slide8');
  const promedioEl = document.getElementById('promedio-prestamos-slide8');
  
  if (totalSolicitudesEl) {
    totalSolicitudesEl.textContent = totalSolicitudes.toLocaleString('es-ES');
  }
  if (totalAprobadosEl) {
    totalAprobadosEl.textContent = totalAprobados.toLocaleString('es-ES');
  }
  if (promedioEl) {
    promedioEl.textContent = `S/ ${promedio.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  }
}

// Aplicar filtros del slide 8
async function aplicarFiltroSlide8() {
  const fechaDesde = document.getElementById('fecha-desde-slide8').value;
  const fechaHasta = document.getElementById('fecha-hasta-slide8').value;
  
  if (!fechaDesde || !fechaHasta) {
    alert('Por favor completa ambas fechas');
    return;
  }
  
  const todos = await obtenerDatosDashboard();
  const datosFiltrados = filtrarPorFechas(todos, fechaDesde, fechaHasta);
  
  if (datosFiltrados.length === 0) {
    alert('No hay datos para el rango de fechas seleccionado');
    return;
  }
  
  // Actualizar gráficos y tabla
  await crearGraficoPrestamosPorMacrozona(datosFiltrados);
  await crearGraficoMontosPorMacrozona(datosFiltrados);
  await crearTablaMontosPorUsuario(datosFiltrados);
  actualizarEstadisticasSlide8(datosFiltrados);
}

// Limpiar filtros del slide 8
async function limpiarFiltroSlide8() {
  document.getElementById('fecha-desde-slide8').value = '';
  document.getElementById('fecha-hasta-slide8').value = '';
  
  const todos = await obtenerDatosDashboard();
  
  // Actualizar gráficos y tabla
  await crearGraficoPrestamosPorMacrozona(todos);
  await crearGraficoMontosPorMacrozona(todos);
  await crearTablaMontosPorUsuario(todos);
  actualizarEstadisticasSlide8(todos);
}

// Actualizar total de atenciones en slide 3
function actualizarTotalSlide3(datos) {
  const totalEl = document.getElementById('total-atenciones-slide3');
  if (totalEl) {
    let totalConsultas = 0;
    datos.forEach(d => {
      totalConsultas += obtenerConsultas(d).length;
    });
    totalEl.textContent = totalConsultas.toLocaleString('es-ES');
  }
}

// Aplicar filtros del slide 3
async function aplicarFiltroSlide3() {
  const fechaInicio = document.getElementById('filtro-fecha-inicio-slide3').value;
  const fechaFin = document.getElementById('filtro-fecha-fin-slide3').value;
  
  if (!fechaInicio || !fechaFin) {
    alert('Por favor completa ambas fechas');
    return;
  }
  
  const todos = await obtenerDatosDashboard();
  const datosFiltrados = filtrarPorFechas(todos, fechaInicio, fechaFin);
  
  if (datosFiltrados.length === 0) {
    alert('No hay datos para el rango de fechas seleccionado');
    return;
  }
  
  // Actualizar gráfico
  await crearGraficoMacrozonasTipos(datosFiltrados);
  actualizarTotalSlide3(datosFiltrados);
}

// Limpiar filtros del slide 3
async function limpiarFiltrosSlide3() {
  document.getElementById('filtro-fecha-inicio-slide3').value = '';
  document.getElementById('filtro-fecha-fin-slide3').value = '';
  
  const todos = await obtenerDatosDashboard();
  await crearGraficoMacrozonasTipos(todos);
  actualizarTotalSlide3(todos);
}

// Manejar el filtro
async function aplicarFiltro() {
  const fechaInicio = document.getElementById('fecha-inicio').value;
  const fechaFin = document.getElementById('fecha-fin').value;
  
  if (!fechaInicio || !fechaFin) {
    alert('Por favor completa ambas fechas');
    return;
  }
  
  const todos = await obtenerDatosDashboard();
  const datos = filtrarPorFechas(todos, fechaInicio, fechaFin);
  
  if (datos.length === 0) {
    alert('No hay datos para el rango de fechas seleccionado');
    return;
  }
  
  await crearGraficoMacrozona(datos);
  await crearGraficoCompania(datos);
  await crearGraficoTipos(datos);
  actualizarTotal(datos);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar el total de slides
  const totalSlidesEl = document.getElementById('total-slides');
  if (totalSlidesEl) {
    totalSlidesEl.textContent = totalSlides;
  }
  
  // Crear dots de navegación
  crearDots();

  // Cargar gráficos
  cargarGraficos();

  // Botones de navegación
  document.getElementById('btn-anterior').addEventListener('click', () => {
    if (currentSlide > 1) {
      mostrarSlide(currentSlide - 1);
    }
  });

  document.getElementById('btn-siguiente').addEventListener('click', () => {
    if (currentSlide < totalSlides) {
      mostrarSlide(currentSlide + 1);
    }
  });

  // Botón cerrar
  document.getElementById('btn-cerrar').addEventListener('click', () => {
    window.close();
  });

  // Botón filtrar slide 1
  document.getElementById('btn-filtrar').addEventListener('click', () => {
    aplicarFiltro();
  });

  // Botón filtrar slide 2
  document.getElementById('btn-filtrar-slide2').addEventListener('click', () => {
    aplicarFiltroSlide2();
  });

  // Botón filtrar slide 3
  document.getElementById('btn-filtrar-slide3').addEventListener('click', () => {
    aplicarFiltroSlide3();
  });

  // Botón limpiar slide 3
  document.getElementById('btn-limpiar-slide3').addEventListener('click', () => {
    limpiarFiltrosSlide3();
  });

  // Botón filtrar slide 4
  document.getElementById('btn-filtrar-slide4').addEventListener('click', () => {
    aplicarFiltroSlide4();
  });

  // Botón limpiar slide 4
  document.getElementById('btn-limpiar-slide4').addEventListener('click', () => {
    limpiarFiltrosSlide4();
  });

  // Botón filtrar slide 5
  document.getElementById('btn-filtrar-slide5').addEventListener('click', () => {
    aplicarFiltroSlide5();
  });

  // Botón limpiar slide 5
  document.getElementById('btn-limpiar-slide5').addEventListener('click', () => {
    limpiarFiltrosSlide5();
  });

  // Botón filtrar slide 6
  document.getElementById('btn-filtrar-slide6').addEventListener('click', () => {
    aplicarFiltroSlide6();
  });

  // Botón limpiar slide 6
  document.getElementById('btn-limpiar-slide6').addEventListener('click', () => {
    limpiarFiltrosSlide6();
  });

  // Botón filtrar slide 7
  document.getElementById('btn-filtrar-slide7').addEventListener('click', () => {
    aplicarFiltroSlide7();
  });

  // Botón limpiar slide 7
  document.getElementById('btn-limpiar-slide7').addEventListener('click', () => {
    limpiarFiltrosSlide7();
  });

  // Botón aplicar filtro slide 8
  document.getElementById('btn-aplicar-filtro-slide8').addEventListener('click', () => {
    aplicarFiltroSlide8();
  });

  // Botón limpiar filtro slide 8
  document.getElementById('btn-limpiar-filtro-slide8').addEventListener('click', () => {
    limpiarFiltroSlide8();
  });

  // Navegación con flechas del teclado
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && currentSlide > 1) {
      mostrarSlide(currentSlide - 1);
    } else if (e.key === 'ArrowRight' && currentSlide < totalSlides) {
      mostrarSlide(currentSlide + 1);
    }
  });
});
