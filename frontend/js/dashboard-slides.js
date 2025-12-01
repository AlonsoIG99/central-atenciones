let currentSlide = 1;
const totalSlides = 9;
let charts = {};

// Registrar el plugin de datalabels
Chart.register(ChartDataLabels);

// Obtener todos los datos del dashboard
async function obtenerDatosDashboard() {
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
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
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
    macrozonasMap[macrozona] = (macrozonasMap[macrozona] || 0) + 1;
  });

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
          position: 'right',
          labels: {
            color: '#e5e7eb',
            font: { size: 11 },
            padding: 25,
            boxWidth: 14
          }
        },
        datalabels: {
          color: '#ffffff',
          font: {
            size: 11,
            weight: 'bold'
          },
          formatter: (value, ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${value} (${percentage}%)`;
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
    companiasMap[compania] = (companiasMap[compania] || 0) + 1;
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
          font: {
            size: 11,
            weight: 'bold'
          }
        }
      },
      layout: {
        padding: {
          top: 10,
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

// Crear gráfico de Barras Horizontal: Tipos de Atenciones
async function crearGraficoTipos(datos) {
  const tiposMap = {
    'Pago correcto': 0,
    'Pago incorrecto': 0,
    'Apoyo económico/Préstamo': 0,
    'Otros/Soporte': 0
  };

  datos.forEach(d => {
    try {
      const desc = JSON.parse(d.descripcion_atencion || '{}');
      
      // Contar cada tipo que esté en true
      for (const key in tiposMap) {
        if (desc[key]) {
          tiposMap[key]++;
        }
      }
    } catch (e) {
      // Si hay error al parsear, no contar nada
    }
  });

  const labels = Object.keys(tiposMap);
  const values = Object.values(tiposMap);
  const colores = ['#10b981', '#ef4444', '#3b82f6', '#8b5cf6'];

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
          align: 'right',
          font: {
            size: 11,
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
  
  // Mostrar total inicial de incidencias
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
            detalleMap[detalle] = (detalleMap[detalle] || 0) + 1;
          }
        }
      } else {
        // Si no hay filtro, procesar todos los tipos
        for (const tipo in desc) {
          if (desc[tipo] && typeof desc[tipo] === 'object') {
            for (const detalle in desc[tipo]) {
              detalleMap[detalle] = (detalleMap[detalle] || 0) + 1;
            }
          }
        }
      }
    } catch (e) {
      // Ignorar errores de parseo
    }
  });

  const labels = Object.keys(detalleMap);
  const values = Object.values(detalleMap);
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

  // Actualizar total de incidencias
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

// Actualizar el total de incidencias
function actualizarTotal(datos) {
  document.getElementById('total-atenciones').textContent = datos.length.toLocaleString('es-ES');
}

// Crear gráfico de macrozonas con tipos de atención (slide 3)
async function crearGraficoMacrozonasTipos(datos) {
  const ctx = document.getElementById('chart-macrozonas-tipos');
  if (!ctx) return;

  // Agrupar por macrozona y tipo de atención (nivel 2)
  const macrozonaMap = {};
  
  datos.forEach(d => {
    if (!d.macrozona) return;
    if (!macrozonaMap[d.macrozona]) {
      macrozonaMap[d.macrozona] = {};
    }
    
    try {
      const desc = JSON.parse(d.descripcion_atencion || '{}');
      // Obtener todos los detalles (nivel 2) de todos los tipos
      for (const tipo in desc) {
        if (desc[tipo] && typeof desc[tipo] === 'object') {
          for (const detalle in desc[tipo]) {
            macrozonaMap[d.macrozona][detalle] = (macrozonaMap[d.macrozona][detalle] || 0) + 1;
          }
        }
      }
    } catch (e) {
      // Ignorar errores de parseo
    }
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
    if (canalesMap.hasOwnProperty(canal)) {
      canalesMap[canal]++;
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
    usuariosMap[usuario] = (usuariosMap[usuario] || 0) + 1;
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

// Actualizar total de atenciones en slide 4
function actualizarTotalSlide4(datos) {
  const totalEl = document.getElementById('total-atenciones-slide4');
  if (totalEl) {
    totalEl.textContent = datos.length.toLocaleString('es-ES');
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
      fechasMap[fechaStr] = (fechasMap[fechaStr] || 0) + 1;
    }
  });

  // Ordenar fechas y crear arrays
  const fechasOrdenadas = Object.keys(fechasMap).sort();
  const valores = fechasOrdenadas.map(f => fechasMap[f]);
  
  // Formatear fechas para mostrar (DD/MM/YYYY)
  const labels = fechasOrdenadas.map(f => {
    const [year, month, day] = f.split('-');
    return `${day}/${month}/${year}`;
  });

  if (charts['atenciones-dia']) {
    charts['atenciones-dia'].destroy();
  }

  charts['atenciones-dia'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Atenciones',
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
    totalEl.textContent = datos.length.toLocaleString('es-ES');
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
    trabajadoresMap[trabajador] = (trabajadoresMap[trabajador] || 0) + 1;
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
    totalEl.textContent = datos.length.toLocaleString('es-ES');
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
  
  // Contar atenciones por mes
  datosAnioActual.forEach(d => {
    if (d.fecha_creacion_atencion) {
      const fecha = new Date(d.fecha_creacion_atencion);
      const mes = fecha.getMonth(); // 0-11
      mesesMap[mes]++;
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

// Actualizar total de atenciones en slide 3
function actualizarTotalSlide3(datos) {
  const totalEl = document.getElementById('total-atenciones-slide3');
  if (totalEl) {
    totalEl.textContent = datos.length.toLocaleString('es-ES');
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

  // Navegación con flechas del teclado
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && currentSlide > 1) {
      mostrarSlide(currentSlide - 1);
    } else if (e.key === 'ArrowRight' && currentSlide < totalSlides) {
      mostrarSlide(currentSlide + 1);
    }
  });
});
