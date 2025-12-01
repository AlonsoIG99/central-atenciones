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
    
    // Cargar datos para slide 2
    cargarDatosSlide2(datos);
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

  // Navegación con flechas del teclado
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && currentSlide > 1) {
      mostrarSlide(currentSlide - 1);
    } else if (e.key === 'ArrowRight' && currentSlide < totalSlides) {
      mostrarSlide(currentSlide + 1);
    }
  });
});
