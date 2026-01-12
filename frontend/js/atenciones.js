const formAtencion = document.getElementById('atencion-form');
const dniInput = document.getElementById('atencion-dni');

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
    
    // Buscar solo si hay al menos 4 dígitos
    if (dni.length < 4) {
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

const atencionSchema = {
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
          "Retención pagos": {},
          "Rebote de abono": {},
          "Bonos": {
            children: {
              "Alimentos": {},
              "Armas": {},
              "Referido": {},
              "Refrigerante": {},
              "Puntualidad": {}
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
          "CTS incompleto": {},
          "Tareo correcto": {},
          "Deuda reingresante": {},
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
          },
          "Servicios especiales": {}
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
              "Subsidios/DM": {},
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
      "Aprobado": { 
        input: "Monto aprobado",
        select: {
          label: "Motivo",
          options: ["Salud", "Estudios", "Otros - Excepcional"]
        },
        file: {
          label: "Documento PDF",
          accept: ".pdf",
          required: true
        }
      },
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
          "Cambio/exoneración/validación fondo pensionario": {},
          "Certificado baja Sunat": {},
          "Certificado renta 5ta categoría": {},
          "Validación cuenta bancaria": {},
          "Cambio básico/cargo": {},
          "Pago retención judicial": {},
        }
      },
      "Soporte bienestar social": {
        children: {
          "Descanso médico/Licencias - No reportados": {},
          "Activación A.F": {},
          "Retención de pagos": {}
        }
      },
      "Soporte tareo": {},
      "Soporte operaciones": {},
      "Soporte legal": {},
      "Soporte selección": {
        children: {
          "Bono referidos": {},
          "Licencia de armas": {},
          "Altas a desatiempo": {},
          "Deuda reingresante": {},
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
  },
  "Canasta navideña": {}
};

// Utilidad: generar ID seguro
function makeId(str) {
  return 'f_' + String(str).toLowerCase().replace(/[^a-z0-9]+/g, '_');
}

// Renderizar esquema jerárquico
function renderAtencionSchema(schema, container, parentLabel = '') {
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
      input.id = makeId(key + '-valor');
      nested.appendChild(input);
    }

    // Si tiene select, crear combobox
    if (value && value.select) {
      const selectWrapper = document.createElement('div');
      selectWrapper.className = 'mt-2';
      const selectLabel = document.createElement('label');
      selectLabel.className = 'block text-sm text-gray-600 mb-1';
      selectLabel.textContent = value.select.label;
      const selectField = document.createElement('select');
      selectField.className = 'w-full p-2 border border-gray-300 rounded text-sm';
      selectField.id = makeId(key + '-motivo');
      
      // Opción por defecto
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'Selecciona un motivo';
      selectField.appendChild(defaultOption);
      
      // Agregar opciones
      value.select.options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        selectField.appendChild(opt);
      });
      
      selectWrapper.appendChild(selectLabel);
      selectWrapper.appendChild(selectField);
      nested.appendChild(selectWrapper);
    }

    // Si tiene file, crear input de archivo
    if (value && value.file) {
      const fileWrapper = document.createElement('div');
      fileWrapper.className = 'mt-2';
      const fileLabel = document.createElement('label');
      fileLabel.className = 'block text-sm text-gray-600 mb-1';
      fileLabel.textContent = value.file.label;
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = value.file.accept || '.pdf';
      fileInput.className = 'w-full p-2 border-2 border-dashed border-purple-300 rounded text-sm cursor-pointer hover:border-purple-500 transition';
      fileInput.id = makeId(key + '-archivo');
      // El archivo es opcional, no requerido
      // if (value.file.required) {
      //   fileInput.required = true;
      // }
      
      fileWrapper.appendChild(fileLabel);
      fileWrapper.appendChild(fileInput);
      nested.appendChild(fileWrapper);
    }

    if (value && value.children) {
      renderAtencionSchema(value.children, nested, key);
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
                siblingNested.querySelectorAll('select').forEach(select => {
                  select.value = '';
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
        nested.querySelectorAll('select').forEach(s => {
          s.value = '';
        });
      }
    });

    container.appendChild(wrapper);
  });
}

// Recopilar datos del esquema
function collectAtencionData(schema) {
  const result = {};
  const archivos = []; // Array para almacenar archivos
  
  Object.entries(schema).forEach(([key, value]) => {
    const checkbox = document.getElementById(makeId(key));
    if (checkbox && checkbox.checked) {
      const node = {};
      const nested = checkbox.parentElement.querySelector('.nested');
      if (nested) {
        const input = nested.querySelector(':scope > input[type="text"]');
        if (input && input.value) node['valor'] = input.value;
        
        // Capturar valor del select (motivo)
        const select = nested.querySelector(':scope > div > select');
        if (select && select.value) node['motivo'] = select.value;
        
        // Capturar archivo
        const fileInput = nested.querySelector(':scope > div > input[type="file"]');
        if (fileInput && fileInput.files.length > 0) {
          archivos.push({
            key: key,
            file: fileInput.files[0]
          });
        }
      }
      if (value && value.children) {
        const childrenResult = collectAtencionData(value.children);
        const childrenData = childrenResult.data;
        const childrenFiles = childrenResult.archivos;
        if (Object.keys(childrenData).length) Object.assign(node, childrenData);
        if (childrenFiles.length) archivos.push(...childrenFiles);
      }
      result[key] = node;
    }
  });
  
  return { data: result, archivos: archivos };
}

// Extraer hojas finales (consultas específicas) del esquema
function extractLeafNodes(data, path = []) {
  const leaves = [];
  
  for (const [key, value] of Object.entries(data)) {
    const currentPath = [...path, key];
    
    // Si el objeto está vacío o solo tiene propiedades especiales (valor, motivo)
    // y NO tiene otros keys que podrían ser children, es una hoja
    const keys = Object.keys(value);
    const hasChildren = keys.some(k => !['valor', 'motivo'].includes(k));
    
    if (!hasChildren) {
      // Es una hoja final
      leaves.push(currentPath.join(' > '));
    } else {
      // Tiene children, continuar recursivamente
      for (const [childKey, childValue] of Object.entries(value)) {
        if (!['valor', 'motivo'].includes(childKey)) {
          const childLeaves = extractLeafNodes({ [childKey]: childValue }, currentPath);
          leaves.push(...childLeaves);
        }
      }
    }
  }
  
  return leaves;
}

// Crear atencion
if (formAtencion) {
  formAtencion.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const schemaToUse = getSchemaByUserArea();
    const collectedResult = collectAtencionData(schemaToUse);
    const schemaData = collectedResult.data;
    const archivos = collectedResult.archivos;
  
  if (Object.keys(schemaData).length === 0) {
    mostrarError('Por favor selecciona al menos una opción');
    return;
  }
  
  // Extraer hojas finales (consultas específicas)
  const consultas = extractLeafNodes(schemaData);
  console.log('Consultas específicas (hojas finales):', consultas);
  
  // Obtener el usuario_id del localStorage (del usuario autenticado)
  const usuarioId = localStorage.getItem('user_id');
  
  const atencion = {
    dni: document.getElementById('atencion-dni').value,
    canal: document.getElementById('atencion-canal').value,
    titulo: Object.keys(schemaData)[0] || 'Atencion sin título',
    descripcion: JSON.stringify(schemaData),
    comentario: document.getElementById('atencion-comentario').value || null,
    usuario_id: usuarioId,
    estado: document.getElementById('atencion-estado').value,
    consultas: consultas  // Agregar las consultas específicas
  };
  
  console.log('Enviando atención:', atencion);
  
  // Crear la atención primero
  const resultado = await crearAtencion(atencion);
  if (resultado) {
    // Si hay archivos, subirlos
    let uploadExito = true;
    if (archivos.length > 0) {
      for (const archivoData of archivos) {
        const docResult = await subirDocumento(resultado.id, archivoData.file);
        if (!docResult) {
          uploadExito = false;
          // El error ya se mostró en subirDocumento
        }
      }
    }
    
    if (uploadExito) {
      mostrarExito('Atención creada exitosamente' + (archivos.length > 0 ? ' con documento adjunto' : ''));
    } else {
      mostrarError('Atención creada pero hubo un error al subir el documento');
    }
    
    formAtencion.reset();
    // Contraer el esquema: desmarcar todos los checkboxes y ocultar elementos anidados
    const allCheckboxes = document.querySelectorAll('#atencion-schema-container input[type="checkbox"]');
    allCheckboxes.forEach(checkbox => {
      checkbox.checked = false;
      const nested = checkbox.parentElement.querySelector('.nested');
      if (nested) {
        nested.classList.add('hidden');
        nested.querySelectorAll('input').forEach(i => {
          if (i.type === 'checkbox') i.checked = false;
          if (i.type === 'text') i.value = '';
          if (i.type === 'file') i.value = '';
        });
        nested.querySelectorAll('select').forEach(s => s.value = '');
      }
    });
  }
  });
}

// Función para subir documento a MinIO
async function subirDocumento(atencionId, file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('token');
    
    // No usar fetchConAutoRefresh porque necesitamos control sobre los headers
    const response = await fetch(`${API_URL}/documentos/${atencionId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // No incluir Content-Type, el navegador lo configura automáticamente con FormData
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error del servidor:', errorData);
      throw new Error(errorData.detail || 'Error al subir documento');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al subir documento:', error);
    mostrarError('Error al subir el documento PDF: ' + error.message);
    return null;
  }
}

// Eliminar atencion
async function eliminarInc(id) {
  if (confirm('¿Estás seguro de que deseas eliminar esta atencion?')) {
    const resultado = await eliminarAtencion(id);
    if (resultado) {
      mostrarExito('Atencion eliminada exitosamente');
    }
  }
}

// Función para obtener el esquema filtrado según el área del usuario
function getSchemaByUserArea() {
  const userArea = localStorage.getItem('area');
  console.log('[DEBUG] Área del usuario:', userArea);
  
  // Si el usuario es de "Bienestar Social", solo mostrar préstamos
  if (userArea === 'Bienestar Social') {
    console.log('[DEBUG] Usuario de Bienestar Social - Restringiendo a solo préstamos');
    return {
      "Apoyo económico/Préstamo": atencionSchema["Apoyo económico/Préstamo"]
    };
  }
  
  // Para otros usuarios (Central de Atenciones), mostrar todo el esquema
  console.log('[DEBUG] Usuario con acceso completo - Mostrando todas las opciones');
  return atencionSchema;
}

// Renderizar el esquema al cargar
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('atencion-schema-container');
  if (container) {
    const schemaToRender = getSchemaByUserArea();
    renderAtencionSchema(schemaToRender, container);
  }
});