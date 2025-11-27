let currentSlide = 1;
const totalSlides = 9;
let charts = {};

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
  document.getElementById('slide-number').textContent = numero;

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
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#e5e7eb',
            font: { size: 12 },
            padding: 15
          }
        }
      },
      layout: {
        padding: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 10
        }
      }
    }
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
      maintainAspectRatio: true,
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
      const desc = JSON.parse(d.descripcion_incidencia || '{}');
      Object.keys(desc).forEach(key => {
        if (key in tiposMap) {
          tiposMap[key]++;
        }
      });
    } catch (e) {
      tiposMap['Otros/Soporte']++;
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

// Cargar y crear todos los gráficos
async function cargarGraficos() {
  const datos = await obtenerDatosDashboard();
  
  if (datos.length > 0) {
    await crearGraficoMacrozona(datos);
    await crearGraficoCompania(datos);
    await crearGraficoTipos(datos);
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
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

  // Navegación con flechas del teclado
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && currentSlide > 1) {
      mostrarSlide(currentSlide - 1);
    } else if (e.key === 'ArrowRight' && currentSlide < totalSlides) {
      mostrarSlide(currentSlide + 1);
    }
  });
});
