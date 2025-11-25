const formIncidencia = document.getElementById('incidencia-form');
const incidenciasList = document.getElementById('incidencias-list');
const dniInput = document.getElementById('incidencia-dni');

// Validar que DNI solo acepte números
if (dniInput) {
  dniInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
  });
}

// Autocomplete para DNI de trabajadores
let debounceTimer;
if (dniInput) {
  dniInput.addEventListener('input', async (e) => {
    clearTimeout(debounceTimer);
    const dni = e.target.value.trim();
    const resultadosContainer = document.getElementById('trabajadores-resultados');
    
    if (dni.length === 0) {
      resultadosContainer.classList.add('hidden');
      return;
    }
    
    debounceTimer = setTimeout(async () => {
      const resultados = await buscarTrabajadorPorDni(dni);
      
      if (resultados.length === 0) {
        resultadosContainer.classList.add('hidden');
        return;
      }
      
      resultadosContainer.innerHTML = resultados.map(trabajador => `
        <div class="p-2 border-b border-gray-200 hover:bg-blue-100 cursor-pointer transition flex justify-between items-center" 
             data-dni="${trabajador.dni}"
             data-nombre_completo="${trabajador.nombre_completo}"
             data-fecha_ingreso="${trabajador.fecha_ingreso || ''}"
             data-fecha_cese="${trabajador.fecha_cese || ''}">
          <span class="font-bold text-blue-600">${trabajador.dni}</span>
          <span class="text-gray-700 flex-1 ml-3">${trabajador.nombre_completo}</span>
        </div>
      `).join('');
      
      resultadosContainer.classList.remove('hidden');
      
      // Evento para seleccionar un resultado
      resultadosContainer.querySelectorAll('div[data-dni]').forEach(item => {
        item.addEventListener('click', () => {
          dniInput.value = item.getAttribute('data-dni');
          resultadosContainer.classList.add('hidden');
        });
      });
    }, 300);
  });
  
  // Cerrar el dropdown al hacer click fuera
  document.addEventListener('click', (e) => {
    if (e.target !== dniInput && !e.target.closest('#trabajadores-resultados')) {
      document.getElementById('trabajadores-resultados').classList.add('hidden');
    }
  });
}

const incidenciaSchema = {
  "Pago correcto": {},
  "Pago incorrecto": {
    children: {
      "Planillas/Configuración de Pago": {
        children: {
          "Destiempo/Reintegro": {},
          "Movilidad": {},
          "Horas extras": {},
          "Gratificación incompleta": {},
          "Vacaciones pago incompleto": {},
          "Activación de A.F": {},
          "Compensación de A.F por movilidad": {},
          "Falta la contraparte": {},
          "No amortizó sobregiro": {},
          "Rebote de abono": {},
          "Bonos": {
            children: {
              "Alimentos": {},
              "Armas": {},
              "Referido": {}
            }
          },
          "Quincena incompleta": {},
          "Descuentos errados": {
            children: {
              "Retención 5ta categoría": {},
              "Retención judicial": {},
              "Préstamo": {}
            }
          },
          "CTS": { input: "Detalle" },
          "Feriados": {
            children: {
              "Monto": {},
              "Día": {}
            }
          },
          "Bonificación": {
            children: {
              "Cargo": {},
              "Unidad": {},
              "Reemplazo puesto": {},
              "Nocturna": {}
            }
          }
        }
      },
      "Tareo/Vacaciones/Regularización": {
        children: {
          "Venta de descanso - No tareado": {},
          "Servicio y/o descanso - No tareado": {},
          "Venta de vacaciones - No tareado": {},
          "Goce vacacional - No tareado": {},
          "Bono descansero": {},
          "Feriado pulpo": {},
          "Activación de puesto": {},
          "HH.EE/Reenganche - No tareado": {},
          "DM's / Licencias - No tareado": {
            children: {
              "Paternidad": {},
              "Fallecimiento": {},
              "Subsidios": {},
              "Sin goce": {},
              "Con goce": {}
            }
          }
        }
      }
    }
  },
  "Apoyo económico/Préstamo": {
    children: {
      "Aprobado": { input: "Monto aprobado" },
      "No aprobado": { input: "Motivo de no aprobación" }
    }
  },
  "Otros/Soporte": {
    children: {
      "Entrega de boletas": {},
      "Información de fecha de pago de liquidación": {},
      "Información de aplicativos": {},
      "Información de directorio telefónico": {},
      "Otras consultas": {},
      "Soporte planillas": {
        children: {
          "Cambio cuenta sueldo": {},
          "Traslado/cambio CTS": {},
          "Oncosalud": {},
          "Cambio/exoneración fondo pensionario": {},
          "Certificado baja Sunat": {},
          "Certificado renta 5ta categoría": {}
        }
      },
      "Soporte bienestar social": {
        children: {
          "Descanso médico/Licencias - No reportados": {},
          "Activación A.F": {}
        }
      },
      "Soporte tareo": {},
      "Soporte selección": {
        children: {
          "Bono referidos": {},
          "Licencia de armas": {},
          "Altas a desatiempo": {}
        }
      },
      "Soporte administración de personal": {
        children: {
          "Adendas": {},
          "Fecha renovación contrato": {}
        }
      },
      "Información de fechas de pago": {}
    }
  }
};

// Utilidad: generar ID seguro
function makeId(str) {
  return 'f_' + String(str).toLowerCase().replace(/[^a-z0-9]+/g, '_');
}

// Renderizar esquema jerárquico
function renderIncidenciaSchema(schema, container, parentLabel = '') {
  if (!container) return;
  Object.entries(schema).forEach(([key, value]) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'mb-2';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer';
    checkbox.id = makeId(key);

    const label = document.createElement('label');
    label.textContent = key;
    label.htmlFor = checkbox.id;
    label.className = 'text-gray-700 font-medium cursor-pointer';

    wrapper.appendChild(checkbox);
    wrapper.appendChild(label);

    const nested = document.createElement('div');
    nested.className = 'nested ml-4 hidden mt-2 pl-4 border-l border-gray-300';
    wrapper.appendChild(nested);

    if (value && value.input) {
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = value.input;
      input.className = 'mt-1 p-2 border border-gray-300 rounded w-full text-sm';
      nested.appendChild(input);
    }

    if (value && value.children) {
      renderIncidenciaSchema(value.children, nested, key);
    }

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        nested.classList.remove('hidden');
        
        // Validación exclusiva para "Apoyo económico/Préstamo"
        // Si el padre es "Apoyo económico/Préstamo", solo se puede seleccionar una opción
        if (parentLabel === 'Apoyo económico/Préstamo') {
          // Obtener todos los checkboxes hermanos (hijos del mismo contenedor)
          const allCheckboxes = container.querySelectorAll(':scope > div > input[type="checkbox"]');
          allCheckboxes.forEach(sibling => {
            if (sibling !== checkbox && sibling.checked) {
              sibling.checked = false;
              // Limpiar el contenido del hermano
              const siblingWrapper = sibling.closest('div');
              const siblingNested = siblingWrapper.querySelector('.nested');
              if (siblingNested) {
                siblingNested.classList.add('hidden');
                siblingNested.querySelectorAll('input[type="text"]').forEach(input => {
                  input.value = '';
                });
              }
            }
          });
        }
      } else {
        nested.classList.add('hidden');
        nested.querySelectorAll('input').forEach(i => {
          if (i.type === 'checkbox') i.checked = false;
          if (i.type === 'text') i.value = '';
        });
      }
    });

    container.appendChild(wrapper);
  });
}

// Recopilar datos del esquema
function collectIncidenciaData(schema) {
  const result = {};
  Object.entries(schema).forEach(([key, value]) => {
    const checkbox = document.getElementById(makeId(key));
    if (checkbox && checkbox.checked) {
      const node = {};
      const nested = checkbox.parentElement.querySelector('.nested');
      if (nested) {
        const input = nested.querySelector(':scope > input[type="text"]');
        if (input && input.value) node['valor'] = input.value;
      }
      if (value && value.children) {
        const childrenData = collectIncidenciaData(value.children);
        if (Object.keys(childrenData).length) Object.assign(node, childrenData);
      }
      result[key] = node;
    }
  });
  return result;
}

// Cargar incidencias
async function cargarIncidencias() {
  const incidencias = await obtenerIncidencias();
  incidenciasList.innerHTML = '';
  
  if (incidencias.length === 0) {
    incidenciasList.innerHTML = '<p class="text-gray-500 text-center py-4">No hay incidencias registradas</p>';
    return;
  }
  
  incidencias.forEach(incidencia => {
    const div = document.createElement('div');
    div.className = 'bg-gray-50 p-4 mb-4 rounded-lg border border-gray-200 hover:shadow-md transition';
    div.innerHTML = `
      <div class="flex justify-between items-start mb-2">
        <div>
          <h4 class="font-semibold text-gray-800">Incidencia #${incidencia.id}</h4>
          <p class="text-sm text-gray-600">DNI: ${incidencia.dni}</p>
          <p class="text-sm text-gray-600">Usuario ID: ${incidencia.usuario_id}</p>
          <p class="text-sm text-gray-600">Estado: <span class="font-medium">${incidencia.estado}</span></p>
        </div>
        <button class="btn-delete px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition" onclick="eliminarInc(${incidencia.id})">Eliminar</button>
      </div>
      <pre class="text-xs bg-white p-3 rounded border border-gray-300 overflow-x-auto">${JSON.stringify(JSON.parse(incidencia.descripcion || '{}'), null, 2)}</pre>
    `;
    incidenciasList.appendChild(div);
  });
}

// Crear incidencia
formIncidencia.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const schemaData = collectIncidenciaData(incidenciaSchema);
  
  if (Object.keys(schemaData).length === 0) {
    mostrarError('Por favor selecciona al menos una opción');
    return;
  }
  
  // Obtener el usuario_id del localStorage (del usuario autenticado)
  const usuarioId = localStorage.getItem('user_id');
  
  const incidencia = {
    dni: document.getElementById('incidencia-dni').value,
    titulo: Object.keys(schemaData)[0] || 'Incidencia sin título',
    descripcion: JSON.stringify(schemaData),
    usuario_id: usuarioId,
    estado: document.getElementById('incidencia-estado').value
  };
  
  const resultado = await crearIncidencia(incidencia);
  if (resultado) {
    mostrarExito('Incidencia creada exitosamente');
    formIncidencia.reset();
    // Rellenar nuevamente el usuario_id después de limpiar el formulario
    const userId = localStorage.getItem('user_id');
    const userIdField = document.getElementById('incidencia-usuario_id');
    if (userIdField && userId) {
      userIdField.value = userId;
    }
    // Contraer el esquema: desmarcar todos los checkboxes y ocultar elementos anidados
    const allCheckboxes = document.querySelectorAll('#incidencias-schema-container input[type="checkbox"]');
    allCheckboxes.forEach(checkbox => {
      checkbox.checked = false;
      const nested = checkbox.parentElement.querySelector('.nested');
      if (nested) {
        nested.classList.add('hidden');
        nested.querySelectorAll('input').forEach(i => {
          if (i.type === 'checkbox') i.checked = false;
          if (i.type === 'text') i.value = '';
        });
      }
    });
    cargarIncidencias();
  }
});

// Eliminar incidencia
async function eliminarInc(id) {
  if (confirm('¿Estás seguro de que deseas eliminar esta incidencia?')) {
    const resultado = await eliminarIncidencia(id);
    if (resultado) {
      mostrarExito('Incidencia eliminada exitosamente');
      cargarIncidencias();
    }
  }
}

// Renderizar el esquema al cargar
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('incidencias-schema-container');
  if (container) {
    renderIncidenciaSchema(incidenciaSchema, container);
  }
});