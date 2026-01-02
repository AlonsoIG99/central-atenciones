// ========== VARIABLES GLOBALES ==========
let visitaActualId = null;
let clientesCache = [];
let dnisAtencionesVisita = []; // DNIs para las atenciones de la visita actual

// Variables de paginación
let paginaActualVisitas = 1;
let paginaActualAtenciones = 1;
const ITEMS_POR_PAGINA = 5;
let visitasGlobal = [];
let atencionesGlobal = [];

// ========== FUNCIONES DE MENSAJES ==========
function mostrarMensaje(mensaje, tipo = 'success') {
    const iconos = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };
    
    const colores = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };
    
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 ${colores[tipo]} text-white px-6 py-4 rounded-lg shadow-2xl z-[9999] flex items-center gap-3 animate-slide-in`;
    toast.innerHTML = `
        <i class="fas ${iconos[tipo]} text-2xl"></i>
        <span class="font-medium">${mensaje}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slide-out 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function mostrarConfirmacion(mensaje) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
                <div class="flex items-center gap-3 mb-4">
                    <i class="fas fa-question-circle text-4xl text-blue-600"></i>
                    <h3 class="text-xl font-bold text-gray-800">Confirmación</h3>
                </div>
                <p class="text-gray-700 mb-6">${mensaje}</p>
                <div class="flex gap-3">
                    <button id="btn-confirmar-si" class="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition">
                        <i class="fas fa-check mr-2"></i>Sí
                    </button>
                    <button id="btn-confirmar-no" class="flex-1 px-4 py-3 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-semibold transition">
                        <i class="fas fa-times mr-2"></i>No
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('btn-confirmar-si').addEventListener('click', () => {
            modal.remove();
            resolve(true);
        });
        
        document.getElementById('btn-confirmar-no').addEventListener('click', () => {
            modal.remove();
            resolve(false);
        });
    });
}

// ========== ELEMENTOS DOM ==========
const visitaForm = document.getElementById('visita-form');
const visitasList = document.getElementById('visitas-list');

// Formulario de atención directa
const atencionDirectaForm = document.getElementById('atencion-directa-form');
const atencionDirectaDniInput = document.getElementById('atencion-directa-dni');
const atencionDirectaDerivacionSelect = document.getElementById('atencion-directa-derivacion');
const atencionDirectaComentarioInput = document.getElementById('atencion-directa-comentario');
const atencionDirectaUsuarioIdInput = document.getElementById('atencion-directa-usuario_id');
const trabajadoresDirectaResultados = document.getElementById('trabajadores-directa-resultados');

// Inputs de visita
const visitaClienteInput = document.getElementById('visita-cliente');
const visitaFechaInput = document.getElementById('visita-fecha');
const visitaUnidadInput = document.getElementById('visita-unidad');
const visitaLiderInput = document.getElementById('visita-lider');
const visitaComentarioInput = document.getElementById('visita-comentario');
const visitaUsuarioIdInput = document.getElementById('visita-usuario_id');

// ========== INICIALIZACIÓN ==========
async function inicializarCultura() {
    console.log('🚀 Inicializando módulo de Cultura');
    const userId = localStorage.getItem('user_id');
    visitaUsuarioIdInput.value = userId;
    if (atencionDirectaUsuarioIdInput) {
        atencionDirectaUsuarioIdInput.value = userId;
    }
    
    await cargarCatalogos();
    await cargarVisitas();
    
    configurarEventos();
    console.log('🚀 Configurando pestañas...');
    configurarPestanas(); // Nueva función para pestañas
    console.log('🚀 Pestañas configuradas');
}

// ========== CONFIGURAR PESTAÑAS ==========
function configurarPestanas() {
    const tabVisitas = document.getElementById('tab-visitas');
    const tabAtenciones = document.getElementById('tab-atenciones-directas');
    const tabReportes = document.getElementById('tab-reportes');
    
    const moduloVisitas = document.getElementById('modulo-visitas');
    const moduloAtenciones = document.getElementById('modulo-atenciones-directas');
    const moduloReportes = document.getElementById('modulo-reportes');
    
    if (!tabVisitas || !tabAtenciones || !tabReportes) {
        console.error('No se encontraron las pestañas');
        return;
    }
    
    function cambiarModulo(moduloActivo, tabActiva) {
        // Ocultar todos los módulos
        [moduloVisitas, moduloAtenciones, moduloReportes].forEach(m => {
            if (m) m.classList.add('hidden');
        });
        
        // Desactivar todas las pestañas
        [tabVisitas, tabAtenciones, tabReportes].forEach(t => {
            if (t) t.classList.remove('tab-active');
        });
        
        // Mostrar módulo activo y activar pestaña
        if (moduloActivo) moduloActivo.classList.remove('hidden');
        if (tabActiva) tabActiva.classList.add('tab-active');
    }
    
    tabVisitas.addEventListener('click', () => {
        cambiarModulo(moduloVisitas, tabVisitas);
    });
    
    tabAtenciones.addEventListener('click', () => {
        cambiarModulo(moduloAtenciones, tabAtenciones);
    });
    
    tabReportes.addEventListener('click', async () => {
        console.log('🔍 Click en pestaña Reportes');
        cambiarModulo(moduloReportes, tabReportes);
        console.log('🔍 Llamando a cargarReportes...');
        await cargarReportes(); // Cargar reportes al abrir la pestaña
        console.log('🔍 cargarReportes completado');
    });
}

// ========== CARGAR CATÁLOGOS ==========
async function cargarCatalogos() {
    try {
        // Cargar clientes
        const respClientes = await fetchConAutoRefresh(`${API_URL}/cultura/clientes`, {
            headers: obtenerHeaders()
        });
        clientesCache = await respClientes.json();
    } catch (error) {
        console.error('Error al cargar catálogos:', error);
        mostrarMensaje('Error al cargar catálogos', 'error');
    }
}

// ========== CONFIGURAR EVENTOS ==========
function configurarEventos() {
    // Búsqueda de cliente con autocompletado desde asignados
    let debounceTimerCliente = null;
    const clientesResultados = document.getElementById('clientes-resultados');
    
    visitaClienteInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimerCliente);
        const texto = e.target.value.trim();
        
        // Buscar solo si hay al menos 4 caracteres
        if (texto.length < 4) {
            clientesResultados.classList.add('hidden');
            return;
        }
        
        debounceTimerCliente = setTimeout(async () => {
            try {
                const response = await fetchConAutoRefresh(`${API_URL}/asignados/buscar/clientes/${encodeURIComponent(texto)}`, {
                    headers: await obtenerHeaders()
                });
                
                if (!response.ok) throw new Error('Error al buscar clientes');
                
                const data = await response.json();
                
                if (data.clientes && data.clientes.length > 0) {
                    clientesResultados.innerHTML = data.clientes.map(cliente => `
                        <div class="p-3 border-b border-purple-200 hover:bg-purple-50 cursor-pointer transition" 
                             data-cliente="${cliente}">
                            <span class="text-gray-700">${cliente}</span>
                        </div>
                    `).join('');
                    
                    clientesResultados.classList.remove('hidden');
                    
                    // Evento para seleccionar un resultado
                    clientesResultados.querySelectorAll('div[data-cliente]').forEach(item => {
                        item.addEventListener('click', () => {
                            visitaClienteInput.value = item.getAttribute('data-cliente');
                            clientesResultados.classList.add('hidden');
                        });
                    });
                } else {
                    clientesResultados.classList.add('hidden');
                }
            } catch (error) {
                console.error('Error buscando clientes:', error);
                clientesResultados.classList.add('hidden');
            }
        }, 300);
    });
    
    // Ocultar resultados al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!visitaClienteInput.contains(e.target) && !clientesResultados.contains(e.target)) {
            clientesResultados.classList.add('hidden');
        }
    });
    
    // Búsqueda de líder zonal con autocompletado desde asignados
    let debounceTimerLider = null;
    const lideresResultados = document.getElementById('lideres-resultados');
    const visitaLiderInput = document.getElementById('visita-lider');
    
    visitaLiderInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimerLider);
        const texto = e.target.value.trim();
        
        // Buscar solo si hay al menos 4 caracteres
        if (texto.length < 4) {
            lideresResultados.classList.add('hidden');
            return;
        }
        
        debounceTimerLider = setTimeout(async () => {
            try {
                const response = await fetchConAutoRefresh(`${API_URL}/asignados/buscar/lideres/${encodeURIComponent(texto)}`, {
                    headers: await obtenerHeaders()
                });
                
                if (!response.ok) throw new Error('Error al buscar líderes zonales');
                
                const data = await response.json();
                
                if (data.lideres && data.lideres.length > 0) {
                    lideresResultados.innerHTML = data.lideres.map(lider => `
                        <div class="p-3 border-b border-purple-200 hover:bg-purple-50 cursor-pointer transition" 
                             data-lider="${lider}">
                            <span class="text-gray-700">${lider}</span>
                        </div>
                    `).join('');
                    
                    lideresResultados.classList.remove('hidden');
                    
                    // Evento para seleccionar un resultado
                    lideresResultados.querySelectorAll('div[data-lider]').forEach(item => {
                        item.addEventListener('click', () => {
                            visitaLiderInput.value = item.getAttribute('data-lider');
                            lideresResultados.classList.add('hidden');
                        });
                    });
                } else {
                    lideresResultados.classList.add('hidden');
                }
            } catch (error) {
                console.error('Error buscando líderes zonales:', error);
                lideresResultados.classList.add('hidden');
            }
        }, 300);
    });
    
    // Ocultar resultados al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!visitaLiderInput.contains(e.target) && !lideresResultados.contains(e.target)) {
            lideresResultados.classList.add('hidden');
        }
    });
    
    // Búsqueda de unidad con autocompletado desde asignados
    let debounceTimerUnidad = null;
    const unidadesResultados = document.getElementById('unidades-resultados');
    const visitaUnidadInput = document.getElementById('visita-unidad');
    
    visitaUnidadInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimerUnidad);
        const texto = e.target.value.trim();
        
        // Buscar solo si hay al menos 4 caracteres
        if (texto.length < 4) {
            unidadesResultados.classList.add('hidden');
            return;
        }
        
        debounceTimerUnidad = setTimeout(async () => {
            try {
                const response = await fetchConAutoRefresh(`${API_URL}/asignados/buscar/unidades/${encodeURIComponent(texto)}`, {
                    headers: await obtenerHeaders()
                });
                
                if (!response.ok) throw new Error('Error al buscar unidades');
                
                const data = await response.json();
                
                if (data.unidades && data.unidades.length > 0) {
                    unidadesResultados.innerHTML = data.unidades.map(unidad => `
                        <div class="p-3 border-b border-purple-200 hover:bg-purple-50 cursor-pointer transition" 
                             data-unidad="${unidad}">
                            <span class="text-gray-700">${unidad}</span>
                        </div>
                    `).join('');
                    
                    unidadesResultados.classList.remove('hidden');
                    
                    // Evento para seleccionar un resultado
                    unidadesResultados.querySelectorAll('div[data-unidad]').forEach(item => {
                        item.addEventListener('click', () => {
                            visitaUnidadInput.value = item.getAttribute('data-unidad');
                            unidadesResultados.classList.add('hidden');
                        });
                    });
                } else {
                    unidadesResultados.classList.add('hidden');
                }
            } catch (error) {
                console.error('Error buscando unidades:', error);
                unidadesResultados.classList.add('hidden');
            }
        }, 300);
    });
    
    // Ocultar resultados al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!visitaUnidadInput.contains(e.target) && !unidadesResultados.contains(e.target)) {
            unidadesResultados.classList.add('hidden');
        }
    });
    
    // ========== EVENTOS DEL MODAL DE ATENCIONES ==========
    const btnCerrarModal = document.getElementById('btn-cerrar-modal-atencion');
    const formAgregarAtencion = document.getElementById('form-agregar-atencion');
    const modalDniInput = document.getElementById('modal-dni');
    const modalTrabajadoresResultados = document.getElementById('modal-trabajadores-resultados');
    
    if (btnCerrarModal) {
        btnCerrarModal.addEventListener('click', cerrarModalAgregarAtencion);
    }
    
    if (formAgregarAtencion) {
        formAgregarAtencion.addEventListener('submit', guardarAtencionIndividual);
    }
    
    // Autocompletado de DNI en modal
    let debounceTimerModal = null;
    if (modalDniInput && modalTrabajadoresResultados) {
        modalDniInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimerModal);
            const dni = e.target.value.trim();
            
            // Buscar solo si hay al menos 4 dígitos
            if (dni.length < 4) {
                modalTrabajadoresResultados.classList.add('hidden');
                return;
            }
            
            debounceTimerModal = setTimeout(async () => {
                const resultados = await buscarTrabajadorPorDni(dni);
                
                if (resultados.length === 0) {
                    modalTrabajadoresResultados.classList.add('hidden');
                    return;
                }
                
                modalTrabajadoresResultados.innerHTML = resultados.map(trabajador => `
                    <div class="p-3 border-b border-blue-200 hover:bg-blue-50 cursor-pointer transition flex justify-between items-center" 
                         data-dni="${trabajador.dni}">
                        <span class="font-bold text-blue-600">${trabajador.dni}</span>
                        <span class="text-gray-700 flex-1 ml-3">${trabajador.nombre_completo}</span>
                    </div>
                `).join('');
                
                modalTrabajadoresResultados.classList.remove('hidden');
                
                // Evento para seleccionar un resultado
                modalTrabajadoresResultados.querySelectorAll('div[data-dni]').forEach(item => {
                    item.addEventListener('click', () => {
                        modalDniInput.value = item.getAttribute('data-dni');
                        modalTrabajadoresResultados.classList.add('hidden');
                    });
                });
            }, 300);
        });
        
        // Cerrar dropdown al hacer click fuera
        document.addEventListener('click', (e) => {
            if (e.target !== modalDniInput && !e.target.closest('#modal-trabajadores-resultados')) {
                modalTrabajadoresResultados.classList.add('hidden');
            }
        });
    }
    
    // ========== EVENTOS DEL MODAL DE CONFIRMACIÓN ==========
    const btnSiAgregarAtenciones = document.getElementById('btn-si-agregar-atenciones');
    const btnNoAgregarAtenciones = document.getElementById('btn-no-agregar-atenciones');
    
    if (btnSiAgregarAtenciones) {
        btnSiAgregarAtenciones.addEventListener('click', async () => {
            console.log('✅ Click en Sí, Agregar');
            console.log('✅ visitaTemporal:', visitaTemporal);
            
            // Guardar datos ANTES de cerrar el modal
            const datosVisita = { ...visitaTemporal };
            
            cerrarModalConfirmarAtenciones();
            
            if (datosVisita && datosVisita.id) {
                await abrirModalAgregarAtencion(datosVisita.id, datosVisita.cliente, datosVisita.fecha);
            } else {
                console.error('❌ No hay datos de visita');
            }
        });
    } else {
        console.error('❌ No se encontró btn-si-agregar-atenciones');
    }
    
    if (btnNoAgregarAtenciones) {
        btnNoAgregarAtenciones.addEventListener('click', () => {
            cerrarModalConfirmarAtenciones();
        });
    }
    
    // Submit del formulario de visita
    visitaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await crearVisita();
    });
    
    // ========== EVENTOS DE ATENCIÓN DIRECTA ==========
    // Submit del formulario de atención directa
    if (atencionDirectaForm) {
        atencionDirectaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await crearAtencionDirecta();
        });
    }
    
    // Autocompletado de DNI en atención directa (mismo patrón que el modal)
    let debounceTimerDirecta = null;
    if (atencionDirectaDniInput && trabajadoresDirectaResultados) {
        atencionDirectaDniInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimerDirecta);
            const dni = e.target.value.trim();
            
            // Buscar solo si hay al menos 4 dígitos
            if (dni.length < 4) {
                trabajadoresDirectaResultados.classList.add('hidden');
                return;
            }
            
            debounceTimerDirecta = setTimeout(async () => {
                const resultados = await buscarTrabajadorPorDni(dni);
                
                if (resultados.length === 0) {
                    trabajadoresDirectaResultados.classList.add('hidden');
                    return;
                }
                
                trabajadoresDirectaResultados.innerHTML = resultados.map(trabajador => `
                    <div class="p-3 border-b border-green-200 hover:bg-green-50 cursor-pointer transition flex justify-between items-center" 
                         data-dni="${trabajador.dni}">
                        <span class="font-bold text-green-600">${trabajador.dni}</span>
                        <span class="text-gray-700 flex-1 ml-3">${trabajador.nombre_completo}</span>
                    </div>
                `).join('');
                
                trabajadoresDirectaResultados.classList.remove('hidden');
                
                // Evento para seleccionar un resultado
                trabajadoresDirectaResultados.querySelectorAll('div[data-dni]').forEach(item => {
                    item.addEventListener('click', () => {
                        atencionDirectaDniInput.value = item.getAttribute('data-dni');
                        trabajadoresDirectaResultados.classList.add('hidden');
                    });
                });
            }, 300);
        });
        
        // Cerrar dropdown al hacer click fuera
        document.addEventListener('click', (e) => {
            if (e.target !== atencionDirectaDniInput && !e.target.closest('#trabajadores-directa-resultados')) {
                trabajadoresDirectaResultados.classList.add('hidden');
            }
        });
    }
}

// ========== CREAR VISITA ==========
async function crearVisita() {
    try {
        const visitaData = {
            cliente: visitaClienteInput.value,
            fecha_visita: new Date(visitaFechaInput.value).toISOString(),
            unidad: visitaUnidadInput.value,
            lider_zonal: visitaLiderInput.value,
            comentario: visitaComentarioInput.value || null,
            usuario_id: visitaUsuarioIdInput.value
        };
        
        console.log('Enviando visita:', visitaData);
        
        const respuesta = await fetchConAutoRefresh(`${API_URL}/cultura/visitas`, {
            method: 'POST',
            headers: obtenerHeaders(),
            body: JSON.stringify(visitaData)
        });
        
        console.log('Respuesta status:', respuesta.status);
        
        if (!respuesta.ok) {
            const errorText = await respuesta.text();
            console.error('Error del servidor:', errorText);
            throw new Error(`Error ${respuesta.status}: ${errorText}`);
        }
        
        const data = await respuesta.json();
        console.log('Visita creada:', data);
        
        mostrarMensaje('✓ Visita registrada exitosamente', 'success');
        
        // Limpiar formulario
        visitaForm.reset();
        visitaUsuarioIdInput.value = localStorage.getItem('user_id');
        
        await cargarVisitas();
        
        // Mostrar modal de confirmación para agregar atenciones
        mostrarModalConfirmarAtenciones(data.id, visitaData.cliente, visitaData.fecha_visita);
    } catch (error) {
        console.error('Error al crear visita:', error);
        mostrarMensaje('Error al registrar visita: ' + error.message, 'error');
    }
}

// ========== MODAL DE CONFIRMACIÓN ==========
let visitaTemporal = null;

function mostrarModalConfirmarAtenciones(visitaId, nombreCliente, fechaVisita) {
    console.log('📋 mostrarModalConfirmarAtenciones llamado', visitaId, nombreCliente);
    visitaTemporal = { id: visitaId, cliente: nombreCliente, fecha: fechaVisita };
    const modal = document.getElementById('modal-confirmar-atenciones');
    console.log('📋 Modal confirmación encontrado:', modal);
    if (modal) {
        modal.classList.remove('hidden');
        console.log('📋 Modal confirmación mostrado');
    }
}

function cerrarModalConfirmarAtenciones() {
    console.log('📋 Cerrando modal confirmación');
    const modal = document.getElementById('modal-confirmar-atenciones');
    if (modal) {
        modal.classList.add('hidden');
    }
    visitaTemporal = null;
}

// ========== MODAL DE ATENCIONES ==========
async function abrirModalAgregarAtencion(visitaId, nombreCliente, fechaVisita) {
    console.log('🔵 abrirModalAgregarAtencion llamado', visitaId, nombreCliente);
    const modal = document.getElementById('modal-agregar-atencion');
    const infoVisita = document.getElementById('info-visita-modal');
    const modalVisitaId = document.getElementById('modal-visita-id');
    
    console.log('🔵 Modal atenciones encontrado:', modal);
    
    // Guardar ID de visita
    modalVisitaId.value = visitaId;
    
    // Mostrar información de la visita
    const fecha = new Date(fechaVisita).toLocaleDateString('es-ES');
    infoVisita.querySelector('p').textContent = `${nombreCliente} - ${fecha}`;
    
    // Limpiar campos del formulario
    document.getElementById('modal-dni').value = '';
    document.getElementById('modal-derivacion').value = '';
    document.getElementById('modal-comentario').value = '';
    
    // Cargar atenciones ya registradas
    await cargarAtencionesDeVisita(visitaId);
    
    // Mostrar modal
    if (modal) {
        modal.classList.remove('hidden');
        console.log('🔵 Modal atenciones mostrado');
    }
    
    // Enfocar DNI
    setTimeout(() => {
        document.getElementById('modal-dni').focus();
    }, 100);
}

async function cargarAtencionesDeVisita(visitaId) {
    try {
        const respuesta = await fetchConAutoRefresh(`${API_URL}/cultura/atenciones`, {
            headers: obtenerHeaders()
        });
        const todasAtenciones = await respuesta.json();
        
        // Filtrar solo las atenciones de esta visita
        const atencionesVisita = todasAtenciones.filter(a => a.visita_id === visitaId);
        
        const contenedor = document.getElementById('contenedor-atenciones-registradas');
        const contador = document.getElementById('contador-atenciones');
        const listaWrapper = document.getElementById('lista-atenciones-registradas');
        
        contador.textContent = atencionesVisita.length;
        
        if (atencionesVisita.length > 0) {
            listaWrapper.classList.remove('hidden');
            contenedor.innerHTML = atencionesVisita.map(atencion => {
                const derivacionTexto = {
                    'atencion_propia': 'Atención Propia',
                    'central_atenciones': 'Central de Atenciones',
                    'bienestar_social': 'Bienestar Social',
                    'logistica': 'Logística',
                    'archivo': 'Archivo',
                    'operaciones': 'Operaciones'
                }[atencion.derivacion] || atencion.derivacion;
                
                return `
                    <div class="bg-white border border-green-300 rounded-lg p-3">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <p class="font-semibold text-gray-800">
                                    <i class="fas fa-id-card text-green-600 mr-1"></i>
                                    DNI: ${atencion.dni}
                                </p>
                                <p class="text-sm text-gray-600 mt-1">
                                    <i class="fas fa-share text-blue-600 mr-1"></i>
                                    ${derivacionTexto}
                                </p>
                                <p class="text-sm text-gray-600 mt-1">
                                    <i class="fas fa-comment text-purple-600 mr-1"></i>
                                    ${atencion.comentario}
                                </p>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            listaWrapper.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error al cargar atenciones:', error);
    }
}

function cerrarModalAgregarAtencion() {
    const modal = document.getElementById('modal-agregar-atencion');
    modal.classList.add('hidden');
}

async function guardarAtencionIndividual(event) {
    event.preventDefault();
    
    try {
        const visitaId = document.getElementById('modal-visita-id').value;
        const dni = document.getElementById('modal-dni').value;
        const derivacion = document.getElementById('modal-derivacion').value;
        const comentario = document.getElementById('modal-comentario').value;
        
        const atencionData = {
            visita_id: visitaId,
            dni: dni,
            derivacion: derivacion,
            comentario: comentario,
            usuario_id: localStorage.getItem('user_id')
        };
        
        console.log('📤 Enviando atención:', atencionData);
        
        const respuesta = await fetchConAutoRefresh(`${API_URL}/cultura/atenciones`, {
            method: 'POST',
            headers: obtenerHeaders(),
            body: JSON.stringify(atencionData)
        });
        
        if (!respuesta.ok) {
            const errorData = await respuesta.json();
            console.error('❌ Error del servidor:', errorData);
            throw new Error(errorData.detail || 'Error al guardar atención');
        }
        
        mostrarMensaje('✓ Atención registrada exitosamente', 'success');
        
        // Recargar lista de atenciones
        await cargarAtencionesDeVisita(visitaId);
        
        // Limpiar campos para la siguiente atención
        document.getElementById('modal-dni').value = '';
        document.getElementById('modal-derivacion').value = '';
        document.getElementById('modal-comentario').value = '';
        
        // Enfocar DNI para continuar agregando
        document.getElementById('modal-dni').focus();
        
    } catch (error) {
        console.error('Error al guardar atención:', error);
        mostrarMensaje('Error al registrar atención', 'error');
    }
}

// ========== REGISTRAR ATENCIONES DE LA VISITA (LEGACY - NO SE USA) ==========
async function registrarAtencionesVisita(visitaId, dnis, derivacion, comentario) {
    let exitosas = 0;
    let errores = 0;
    
    for (const dni of dnis) {
        try {
            const atencionData = {
                visita_id: visitaId,
                dni: dni,
                derivacion: derivacion,
                comentario: comentario,
                usuario_id: localStorage.getItem('user_id')
            };
            
            const respuesta = await fetchConAutoRefresh(`${API_URL}/cultura/atenciones`, {
                method: 'POST',
                headers: obtenerHeaders(),
                body: JSON.stringify(atencionData)
            });
            
            if (respuesta.ok) {
                exitosas++;
            } else {
                errores++;
                console.error('Error al registrar DNI:', dni);
            }
        } catch (error) {
            errores++;
            console.error('Error al crear atención para DNI:', dni, error);
        }
    }
    
    if (exitosas > 0) {
        const mensaje = exitosas === 1 
            ? '✓ 1 atención registrada' 
            : `✓ ${exitosas} atenciones registradas`;
        mostrarMensaje(mensaje, 'success');
    }
    
    if (errores > 0) {
        mostrarMensaje(`⚠️ ${errores} atención(es) no pudieron ser registradas`, 'error');
    }
}

// ========== CREAR ATENCIÓN DIRECTA (SIN VISITA) ==========
async function crearAtencionDirecta() {
    try {
        const atencionData = {
            visita_id: null, // Sin visita
            dni: atencionDirectaDniInput.value,
            derivacion: atencionDirectaDerivacionSelect.value,
            comentario: atencionDirectaComentarioInput.value,
            usuario_id: atencionDirectaUsuarioIdInput.value
        };
        
        const respuesta = await fetchConAutoRefresh(`${API_URL}/cultura/atenciones`, {
            method: 'POST',
            headers: obtenerHeaders(),
            body: JSON.stringify(atencionData)
        });
        
        await respuesta.json();
        mostrarMensaje('Atención directa registrada exitosamente', 'success');
        
        // Limpiar formulario
        atencionDirectaForm.reset();
        atencionDirectaUsuarioIdInput.value = localStorage.getItem('user_id');
    } catch (error) {
        console.error('Error al crear atención directa:', error);
        mostrarMensaje('Error al registrar atención directa', 'error');
    }
}

// ========== CARGAR VISITAS ==========
async function cargarVisitas() {
    try {
        const respuesta = await fetchConAutoRefresh(`${API_URL}/cultura/visitas`, {
            headers: obtenerHeaders()
        });
        const visitas = await respuesta.json();
        
        if (visitas.length === 0) {
            visitasList.innerHTML = '<p class="text-gray-500 text-center py-8">No hay visitas registradas</p>';
            return;
        }
        
        visitasList.innerHTML = '';
        visitas.forEach(visita => {
            const card = document.createElement('div');
            card.className = 'bg-white shadow-md rounded-xl p-5 hover:shadow-lg transition border border-purple-200';
            
            const fecha = new Date(visita.fecha_visita).toLocaleString('es-ES');
            
            card.innerHTML = `
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <p class="text-lg font-semibold text-gray-800">
                            <i class="fas fa-building text-purple-600 mr-2"></i>${visita.cliente}
                        </p>
                        <p class="text-sm text-gray-600 mt-1">
                            <i class="fas fa-calendar mr-1"></i>${fecha}
                        </p>
                        <p class="text-sm text-gray-600">
                            <i class="fas fa-map-marker-alt mr-1"></i>${visita.unidad}
                        </p>
                        <p class="text-sm text-gray-600">
                            <i class="fas fa-user-tie mr-1"></i>${visita.lider_zonal}
                        </p>
                        ${visita.comentario ? `<p class="text-sm text-blue-600 mt-2"><i class="fas fa-comment mr-1"></i>${visita.comentario}</p>` : ''}
                    </div>
                    <div class="flex gap-2">
                        <button class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition" onclick="mostrarModalAtenciones('${visita.id}')">
                            <i class="fas fa-plus mr-1"></i>Atenciones
                        </button>
                        <button class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition" onclick="eliminarVisita('${visita.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            visitasList.appendChild(card);
        });
    } catch (error) {
        console.error('Error al cargar visitas:', error);
        visitasList.innerHTML = '<p class="text-red-500 text-center py-8">Error al cargar visitas</p>';
    }
}

// ========== ELIMINAR VISITA ==========
async function eliminarVisita(visitaId) {
    const confirmar = await mostrarConfirmacion('¿Estás seguro de eliminar esta visita?');
    if (!confirmar) return;
    
    try {
        const respuesta = await fetchConAutoRefresh(`${API_URL}/cultura/visitas/${visitaId}`, {
            method: 'DELETE',
            headers: obtenerHeaders()
        });
        await respuesta.json();
        mostrarMensaje('Visita eliminada correctamente', 'success');
        await cargarVisitas();
    } catch (error) {
        console.error('Error al eliminar visita:', error);
        mostrarMensaje('Error al eliminar visita', 'error');
    }
}

// Eliminar visita desde reportes
async function eliminarVisitaReporte(visitaId) {
    const confirmar = await mostrarConfirmacion('¿Estás seguro de eliminar esta visita?');
    if (!confirmar) return;
    
    try {
        const respuesta = await fetchConAutoRefresh(`${API_URL}/cultura/visitas/${visitaId}`, {
            method: 'DELETE',
            headers: obtenerHeaders()
        });
        await respuesta.json();
        mostrarMensaje('Visita eliminada correctamente', 'success');
        await cargarReportes(); // Recargar reportes
    } catch (error) {
        console.error('Error al eliminar visita:', error);
        mostrarMensaje('Error al eliminar visita', 'error');
    }
}

// ========== MODAL DE ATENCIONES ==========
function mostrarModalAtenciones(visitaId) {
    // Crear modal dinámicamente
    const modalHTML = `
        <div id="modal-atenciones" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
                <div class="bg-gradient-to-r from-green-600 to-teal-600 p-6 rounded-t-xl">
                    <h3 class="text-2xl font-bold text-white flex items-center gap-2">
                        <i class="fas fa-clipboard-list"></i>
                        Registrar Atenciones
                    </h3>
                </div>
                
                <div class="p-6">
                    <form id="atencion-cultura-form" class="space-y-4">
                        <input type="hidden" id="atencion-visita-id" value="${visitaId}">
                        <input type="hidden" id="atencion-usuario-id" value="${localStorage.getItem('user_id')}">
                        
                        <div>
                            <label class="block text-gray-700 font-medium mb-2">
                                <i class="fas fa-users text-green-600 mr-2"></i>Trabajadores (DNI)
                            </label>
                            <div class="bg-blue-50 border-2 border-blue-300 rounded-lg p-3 mb-3">
                                <p class="text-sm text-blue-800 mb-3"><i class="fas fa-info-circle mr-1"></i>Agregar DNIs de trabajadores atendidos:</p>
                                
                                <div class="grid grid-cols-1 gap-2">
                                    <!-- Botón para agregar un DNI -->
                                    <button type="button" id="btn-abrir-ingreso-dni" class="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition font-semibold shadow-lg">
                                        <i class="fas fa-plus-circle mr-2"></i>Ingresar 1 DNI
                                    </button>
                                    
                                    <!-- Botón para pegar lista de DNIs -->
                                    <button type="button" id="btn-pegar-lista-dni" class="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition font-semibold shadow-lg">
                                        <i class="fas fa-list mr-2"></i>Pegar Lista de DNIs
                                    </button>
                                </div>
                                
                                <p class="text-xs text-gray-600 mt-2 text-center">Para varios DNIs: pega la lista separada por saltos de línea</p>
                            </div>
                            <div id="trabajadores-atenciones-resultados" class="mt-2 bg-white border border-green-300 rounded-lg shadow-xl max-h-48 overflow-y-auto hidden hide-scrollbar"></div>
                            
                            <!-- Lista de DNIs agregados -->
                            <div id="lista-dnis-agregados" class="mt-3 space-y-2"></div>
                        </div>
                        
                        <div>
                            <label class="block text-gray-700 font-medium mb-2">
                                <i class="fas fa-share text-green-600 mr-2"></i>Derivación
                            </label>
                            <select id="atencion-derivacion" required 
                                class="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                                <option value="">Seleccionar área</option>
                                <option value="central_atenciones">Central de Atenciones</option>
                                <option value="bienestar_social">Bienestar Social</option>
                                <option value="logistica">Logística</option>
                                <option value="archivo">Archivo</option>
                                <option value="operaciones">Operaciones</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-gray-700 font-medium mb-2">
                                <i class="fas fa-comment text-green-600 mr-2"></i>Comentario
                            </label>
                            <div class="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                                <p class="text-sm text-gray-700 mb-3" id="comentario-preview">
                                    <em class="text-gray-500">No se ha ingresado comentario aún</em>
                                </p>
                                <button type="button" id="btn-editar-comentario" class="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-semibold">
                                    <i class="fas fa-edit mr-2"></i>Editar Comentario
                                </button>
                            </div>
                            <input type="hidden" id="atencion-comentario" value="">
                        </div>
                        
                        <div class="flex gap-4 pt-4">
                            <button type="submit" class="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold">
                                <i class="fas fa-save mr-2"></i>Registrar Atención(es)
                            </button>
                            <button type="button" onclick="cerrarModalAtenciones()" class="flex-1 px-6 py-3 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition font-semibold">
                                <i class="fas fa-times mr-2"></i>Cerrar
                            </button>
                        </div>
                    </form>
                    
                    <div id="atenciones-registradas" class="mt-6">
                        <h4 class="text-lg font-semibold text-gray-800 mb-3">Atenciones de esta visita:</h4>
                        <div id="lista-atenciones-visita" class="space-y-2"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Configurar eventos del modal
    const atencionForm = document.getElementById('atencion-cultura-form');
    const btnAbrirIngresoDni = document.getElementById('btn-abrir-ingreso-dni');
    const btnPegarListaDni = document.getElementById('btn-pegar-lista-dni');
    const btnEditarComentario = document.getElementById('btn-editar-comentario');
    const comentarioPreview = document.getElementById('comentario-preview');
    const comentarioInput = document.getElementById('atencion-comentario');
    const listaDnisAgregados = document.getElementById('lista-dnis-agregados');
    
    console.log('Elementos encontrados:', {
        form: !!atencionForm,
        botonIngresar: !!btnAbrirIngresoDni,
        botonPegar: !!btnPegarListaDni,
        botonComentario: !!btnEditarComentario,
        lista: !!listaDnisAgregados
    });
    
    if (!btnAbrirIngresoDni || !btnPegarListaDni || !btnEditarComentario) {
        console.error('No se encontraron los botones necesarios');
        return;
    }
    
    // Array para almacenar los DNIs agregados
    let dnisAgregados = [];
    let comentarioActual = '';
    
    // Función para renderizar la lista de DNIs
    function renderizarListaDnis() {
        if (dnisAgregados.length === 0) {
            listaDnisAgregados.innerHTML = '<p class="text-sm text-gray-500 italic">No hay DNIs agregados aún</p>';
            return;
        }
        
        listaDnisAgregados.innerHTML = dnisAgregados.map((item, index) => `
            <div class="flex items-center justify-between bg-green-50 border border-green-300 rounded-lg px-4 py-2">
                <div class="flex items-center gap-2">
                    <i class="fas fa-user text-green-600"></i>
                    <span class="font-medium text-gray-800">${item.dni}</span>
                    ${item.nombre ? `<span class="text-sm text-gray-600">- ${item.nombre}</span>` : ''}
                </div>
                <button type="button" onclick="eliminarDniLista(${index})" class="text-red-600 hover:text-red-800 transition">
                    <i class="fas fa-times-circle text-lg"></i>
                </button>
            </div>
        `).join('');
    }
    

    
    // Función global para eliminar DNI (llamada desde el onclick)
    window.eliminarDniLista = function(index) {
        dnisAgregados.splice(index, 1);
        renderizarListaDnis();
    };
    
    // Renderizar lista inicial
    renderizarListaDnis();
    
    // EVENTO: Editar comentario
    btnEditarComentario.addEventListener('click', () => {
        const nuevoComentario = prompt('Ingresa el comentario o descripción de la atención:', comentarioActual);
        
        if (nuevoComentario !== null) { // null = usuario canceló
            comentarioActual = nuevoComentario.trim();
            comentarioInput.value = comentarioActual;
            
            if (comentarioActual) {
                comentarioPreview.innerHTML = `<strong>Comentario:</strong> ${comentarioActual}`;
                comentarioPreview.className = 'text-sm text-gray-800';
            } else {
                comentarioPreview.innerHTML = '<em class="text-gray-500">No se ha ingresado comentario aún</em>';
                comentarioPreview.className = 'text-sm text-gray-700';
            }
        }
    });
    
    // EVENTO: Ingresar un solo DNI
    btnAbrirIngresoDni.addEventListener('click', async () => {
        const dni = prompt('Ingresa el DNI del trabajador (7 u 8 dígitos):');
        
        if (!dni) {
            return; // Usuario canceló
        }
        
        await agregarDniConValor(dni.trim());
    });
    
    // EVENTO: Pegar lista de DNIs
    btnPegarListaDni.addEventListener('click', async () => {
        const listaDnis = prompt('Pega la lista de DNIs (uno por línea):\n\nEjemplo:\n12345678\n87654321\n11223344');
        
        if (!listaDnis) {
            return; // Usuario canceló
        }
        
        await procesarListaDnis(listaDnis);
    });
    
    // Función para procesar lista de DNIs
    async function procesarListaDnis(texto) {
        // Dividir por saltos de línea y limpiar
        const lineas = texto.split(/[\r\n]+/).map(linea => linea.trim()).filter(linea => linea.length > 0);
        
        if (lineas.length === 0) {
            mostrarMensaje('No se encontraron DNIs en el texto pegado', 'error');
            return;
        }
        
        console.log(`📋 Procesando ${lineas.length} línea(s)`);
        
        let agregados = 0;
        let duplicados = 0;
        let invalidos = 0;
        
        for (const linea of lineas) {
            const dni = linea.trim();
            
            // Validar longitud
            if (dni.length < 7 || dni.length > 8) {
                console.log(`❌ DNI inválido (longitud): ${dni}`);
                invalidos++;
                continue;
            }
            
            // Validar que solo contenga números
            if (!/^\d+$/.test(dni)) {
                console.log(`❌ DNI inválido (no numérico): ${dni}`);
                invalidos++;
                continue;
            }
            
            // Verificar si ya está en la lista
            if (dnisAgregados.some(item => item.dni === dni)) {
                console.log(`⚠️ DNI duplicado: ${dni}`);
                duplicados++;
                continue;
            }
            
            // Buscar trabajador y agregar
            try {
                const trabajadores = await obtenerTrabajadoresPorDNI(dni);
                const trabajador = trabajadores.find(t => t.dni === dni);
                
                dnisAgregados.push({
                    dni: dni,
                    nombre: trabajador ? trabajador.nombre_completo : null
                });
                
                agregados++;
                console.log(`✅ DNI agregado: ${dni}`);
            } catch (error) {
                console.error('Error al buscar trabajador:', dni, error);
                // Agregar sin nombre si hay error
                dnisAgregados.push({ dni: dni, nombre: null });
                agregados++;
            }
        }
        
        // Renderizar lista actualizada
        renderizarListaDnis();
        
        // Mostrar resumen
        let mensaje = `✓ ${agregados} DNI(s) agregado(s)`;
        if (duplicados > 0) mensaje += ` | ${duplicados} duplicado(s)`;
        if (invalidos > 0) mensaje += ` | ${invalidos} inválido(s)`;
        
        mostrarMensaje(mensaje, agregados > 0 ? 'success' : 'info');
        
        console.log(`📊 Resumen: ${agregados} agregados, ${duplicados} duplicados, ${invalidos} inválidos`);
    }
    
    // Nueva función que recibe el valor como parámetro
    async function agregarDniConValor(valorDni) {
        const dni = valorDni.trim();
        
        console.log('Procesando DNI:', dni, 'Longitud:', dni.length);
        
        if (!dni || dni.length < 7 || dni.length > 8) {
            console.log('DNI no válido - longitud incorrecta');
            mostrarMensaje('El DNI debe tener 7 u 8 dígitos', 'error');
            return;
        }
        
        // Validar que solo contenga números
        if (!/^\d+$/.test(dni)) {
            console.log('DNI no válido - no es numérico');
            mostrarMensaje('El DNI solo debe contener números', 'error');
            return;
        }
        
        // Verificar si ya está agregado
        if (dnisAgregados.some(item => item.dni === dni)) {
            console.log('DNI duplicado');
            mostrarMensaje('Este DNI ya fue agregado a la lista', 'info');
            return;
        }
        
        console.log('Buscando trabajador con DNI:', dni);
        
        // Buscar el nombre del trabajador
        try {
            const trabajadores = await obtenerTrabajadoresPorDNI(dni);
            console.log('Trabajadores encontrados:', trabajadores);
            const trabajador = trabajadores.find(t => t.dni === dni);
            
            dnisAgregados.push({
                dni: dni,
                nombre: trabajador ? trabajador.nombre_completo : null
            });
            
            console.log('✅ DNI agregado exitosamente. Total:', dnisAgregados.length);
            mostrarMensaje(`✓ DNI ${dni} agregado correctamente`, 'success');
            
            renderizarListaDnis();
        } catch (error) {
            console.error('Error al buscar trabajador:', error);
            // Agregar el DNI sin nombre si hay error
            dnisAgregados.push({ dni: dni, nombre: null });
            console.log('✅ DNI agregado sin nombre. Total:', dnisAgregados.length);
            mostrarMensaje(`✓ DNI ${dni} agregado`, 'success');
            renderizarListaDnis();
        }
    }
    
    // Submit del formulario de atención
    atencionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await crearAtencionCultura(visitaId, dnisAgregados);
    });
    
    // Cargar atenciones existentes de esta visita
    cargarAtencionesVisita(visitaId);
}

function cerrarModalAtenciones() {
    const modal = document.getElementById('modal-atenciones');
    if (modal) {
        modal.remove();
    }
}

// ========== CREAR ATENCIÓN CULTURA ==========
async function crearAtencionCultura(visitaId, dnisAgregados) {
    try {
        console.log('🔍 Iniciando creación de atención...');
        console.log('📋 DNIs agregados:', dnisAgregados);
        console.log('🆔 Visita ID:', visitaId);
        
        // Validar que haya DNIs agregados
        if (!dnisAgregados || dnisAgregados.length === 0) {
            mostrarMensaje('Por favor agrega al menos un DNI', 'error');
            return;
        }
        
        const derivacion = document.getElementById('atencion-derivacion').value;
        const comentario = document.getElementById('atencion-comentario').value;
        const usuario_id = document.getElementById('atencion-usuario-id').value;
        
        console.log('📝 Valores del formulario:', {
            derivacion: derivacion,
            comentario: comentario,
            usuario_id: usuario_id,
            'comentario length': comentario.length,
            'comentario trim': comentario.trim()
        });
        
        if (!derivacion || !comentario || !comentario.trim()) {
            console.log('❌ Validación fallida');
            if (!derivacion) console.log('  - Falta derivación');
            if (!comentario) console.log('  - Comentario está vacío');
            if (comentario && !comentario.trim()) console.log('  - Comentario solo tiene espacios');
            
            mostrarMensaje('Por favor completa todos los campos (derivación y comentario)', 'error');
            return;
        }
        
        console.log('✅ Validación exitosa. Registrando atenciones para', dnisAgregados.length, 'trabajador(es)');
        
        // Crear una atención por cada DNI
        let exitosas = 0;
        let errores = 0;
        
        for (const item of dnisAgregados) {
            try {
                const atencionData = {
                    visita_id: visitaId,
                    dni: item.dni,
                    derivacion: derivacion,
                    comentario: comentario,
                    usuario_id: usuario_id
                };
                
                const respuesta = await fetchConAutoRefresh(`${API_URL}/cultura/atenciones`, {
                    method: 'POST',
                    headers: obtenerHeaders(),
                    body: JSON.stringify(atencionData)
                });
                
                if (respuesta.ok) {
                    exitosas++;
                } else {
                    errores++;
                    console.error('Error al registrar DNI:', item.dni);
                }
            } catch (error) {
                errores++;
                console.error('Error al crear atención para DNI:', item.dni, error);
            }
        }
        
        // Mostrar resultado
        if (exitosas > 0) {
            const mensaje = exitosas === 1 
                ? 'Atención registrada exitosamente' 
                : `${exitosas} atenciones registradas exitosamente`;
            mostrarMensaje(mensaje, 'success');
        }
        
        if (errores > 0) {
            mostrarMensaje(`${errores} atención(es) no pudieron ser registradas`, 'error');
        }
        
        // Limpiar formulario solo si hubo al menos una exitosa
        if (exitosas > 0) {
            document.getElementById('atencion-derivacion').value = '';
            document.getElementById('atencion-comentario').value = '';
            dnisAgregados.length = 0; // Limpiar array
            document.getElementById('lista-dnis-agregados').innerHTML = '<p class="text-sm text-gray-500 italic">No hay DNIs agregados aún</p>';
            
            // Recargar lista de atenciones
            await cargarAtencionesVisita(visitaId);
        }
    } catch (error) {
        console.error('Error al crear atención:', error);
        mostrarMensaje('Error al registrar atención: ' + error.message, 'error');
    }
}

// ========== CARGAR ATENCIONES DE UNA VISITA ==========
async function cargarAtencionesVisita(visitaId) {
    try {
        const respuesta = await fetchConAutoRefresh(`${API_URL}/cultura/atenciones`, {
            headers: obtenerHeaders()
        });
        const atenciones = await respuesta.json();
        const atencionesVisita = atenciones.filter(a => a.visita_id === visitaId);
        
        const listaDiv = document.getElementById('lista-atenciones-visita');
        
        if (atencionesVisita.length === 0) {
            listaDiv.innerHTML = '<p class="text-gray-500 text-sm">No hay atenciones registradas para esta visita</p>';
            return;
        }
        
        listaDiv.innerHTML = '';
        atencionesVisita.forEach(atencion => {
            const div = document.createElement('div');
            div.className = 'bg-gray-50 p-3 rounded-lg border border-gray-200';
            div.innerHTML = `
                <p class="text-sm font-semibold text-gray-800">DNI: ${atencion.dni} ${atencion.nombre_trabajador ? `- ${atencion.nombre_trabajador}` : ''}</p>
                <p class="text-sm text-gray-600">Derivación: <span class="font-medium">${atencion.derivacion}</span></p>
                <p class="text-sm text-gray-600">${atencion.comentario}</p>
            `;
            listaDiv.appendChild(div);
        });
    } catch (error) {
        console.error('Error al cargar atenciones de visita:', error);
    }
}

// Inicializar cuando se carga la sección
if (document.getElementById('visitas-section')) {
    // La inicialización se hará cuando se muestre la sección
}

// ========== FUNCIONES DE REPORTES ==========
async function cargarReportes() {
    console.log('📊 === INICIO cargarReportes ===');
    try {
        console.log('📊 Iniciando carga de visitas...');
        // Cargar visitas
        const respVisitas = await fetchConAutoRefresh(`${API_URL}/cultura/visitas`, {
            headers: obtenerHeaders()
        });
        console.log('📊 Respuesta visitas recibida');
        visitasGlobal = await respVisitas.json();
        console.log('Visitas cargadas:', visitasGlobal.length, visitasGlobal);
        
        console.log('📊 Iniciando carga de atenciones...');
        // Cargar atenciones
        const respAtenciones = await fetchConAutoRefresh(`${API_URL}/cultura/atenciones`, {
            headers: obtenerHeaders()
        });
        console.log('📊 Respuesta atenciones recibida');
        atencionesGlobal = await respAtenciones.json();
        console.log('Atenciones cargadas:', atencionesGlobal.length, atencionesGlobal);
        
        // Calcular estadísticas
        const atencionesDirectas = atencionesGlobal.filter(a => !a.visita_id);
        const atencionesEnVisitas = atencionesGlobal.filter(a => a.visita_id);
        console.log('Atenciones directas:', atencionesDirectas.length);
        console.log('Atenciones en visitas:', atencionesEnVisitas.length);
        
        document.getElementById('stat-total-visitas').textContent = visitasGlobal.length;
        document.getElementById('stat-total-atenciones').textContent = atencionesGlobal.length;
        document.getElementById('stat-atenciones-directas').textContent = atencionesDirectas.length;
        document.getElementById('stat-atenciones-visitas').textContent = atencionesEnVisitas.length;
        
        // Renderizar listas con paginación
        paginaActualVisitas = 1;
        paginaActualAtenciones = 1;
        renderizarListaVisitasReporte();
        renderizarListaAtencionesReporte();
    } catch (error) {
        console.error('Error al cargar reportes:', error);
        mostrarMensaje('Error al cargar reportes', 'error');
    }
}

function renderizarListaVisitasReporte() {
    const container = document.getElementById('visitas-list');
    const paginacionContainer = document.getElementById('paginacion-visitas');
    
    if (visitasGlobal.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">No hay visitas registradas</p>';
        paginacionContainer.innerHTML = '';
        return;
    }
    
    // Calcular paginación
    const totalPaginas = Math.ceil(visitasGlobal.length / ITEMS_POR_PAGINA);
    const inicio = (paginaActualVisitas - 1) * ITEMS_POR_PAGINA;
    const fin = inicio + ITEMS_POR_PAGINA;
    const visitasPagina = visitasGlobal.slice(inicio, fin);
    
    // Renderizar visitas de la página actual
    container.innerHTML = '';
    visitasPagina.forEach(visita => {
        const fecha = new Date(visita.fecha_visita).toLocaleDateString('es-ES');
        
        const card = document.createElement('div');
        card.className = 'bg-white border border-purple-200 rounded-lg p-4 hover:shadow-md transition';
        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <p class="font-semibold text-gray-800">
                        <i class="fas fa-building text-purple-600 mr-2"></i>${visita.cliente}
                    </p>
                    <div class="text-sm text-gray-600 mt-2 space-y-1">
                        <p><i class="fas fa-calendar mr-2"></i>${fecha}</p>
                        <p><i class="fas fa-map-marker-alt mr-2"></i>${visita.unidad}</p>
                        <p><i class="fas fa-user-tie mr-2"></i>${visita.lider_zonal}</p>
                        ${visita.comentario ? `<p class="text-blue-600"><i class="fas fa-comment mr-2"></i>${visita.comentario}</p>` : ''}
                    </div>
                </div>
                <button class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition" onclick="eliminarVisitaReporte('${visita.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(card);
    });
    
    // Renderizar controles de paginación
    renderizarPaginacion(paginacionContainer, paginaActualVisitas, totalPaginas, (nuevaPagina) => {
        paginaActualVisitas = nuevaPagina;
        renderizarListaVisitasReporte();
    });
}

function renderizarListaAtencionesReporte() {
    const container = document.getElementById('atenciones-list');
    const paginacionContainer = document.getElementById('paginacion-atenciones');
    
    console.log('=== renderizarListaAtencionesReporte ===');
    console.log('Container:', container);
    console.log('atencionesGlobal:', atencionesGlobal);
    console.log('Cantidad de atenciones:', atencionesGlobal.length);
    
    if (atencionesGlobal.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">No hay atenciones registradas</p>';
        paginacionContainer.innerHTML = '';
        return;
    }
    
    // Calcular paginación
    const totalPaginas = Math.ceil(atencionesGlobal.length / ITEMS_POR_PAGINA);
    const inicio = (paginaActualAtenciones - 1) * ITEMS_POR_PAGINA;
    const fin = inicio + ITEMS_POR_PAGINA;
    const atencionesPagina = atencionesGlobal.slice(inicio, fin);
    
    // Renderizar atenciones de la página actual
    container.innerHTML = '';
    atencionesPagina.forEach(atencion => {
        const esDirecta = !atencion.visita_id;
        const colorBorde = esDirecta ? 'border-green-200' : 'border-blue-200';
        const colorIcono = esDirecta ? 'text-green-600' : 'text-blue-600';
        const tipoLabel = esDirecta ? 'Directa' : 'En Visita';
        
        const card = document.createElement('div');
        card.className = `bg-white border ${colorBorde} rounded-lg p-4 hover:shadow-md transition`;
        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="px-2 py-1 text-xs font-semibold rounded ${esDirecta ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}">
                            ${tipoLabel}
                        </span>
                    </div>
                    <p class="font-semibold text-gray-800">
                        <i class="fas fa-id-card ${colorIcono} mr-2"></i>DNI: ${atencion.dni}
                    </p>
                    <div class="text-sm text-gray-600 mt-2 space-y-1">
                        <p><i class="fas fa-share mr-2"></i><strong>Derivación:</strong> ${atencion.derivacion}</p>
                        <p><i class="fas fa-comment mr-2"></i>${atencion.comentario}</p>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
    
    // Renderizar controles de paginación
    renderizarPaginacion(paginacionContainer, paginaActualAtenciones, totalPaginas, (nuevaPagina) => {
        paginaActualAtenciones = nuevaPagina;
        renderizarListaAtencionesReporte();
    });
}

function renderizarPaginacion(container, paginaActual, totalPaginas, callback) {
    if (totalPaginas <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Botón anterior
    html += `
        <button 
            class="px-3 py-2 rounded-lg border ${paginaActual === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}"
            ${paginaActual === 1 ? 'disabled' : ''}
            onclick="cambiarPagina(${paginaActual - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Información de página
    html += `
        <span class="px-4 py-2 text-gray-700 font-medium">
            Página ${paginaActual} de ${totalPaginas}
        </span>
    `;
    
    // Botón siguiente
    html += `
        <button 
            class="px-3 py-2 rounded-lg border ${paginaActual === totalPaginas ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}"
            ${paginaActual === totalPaginas ? 'disabled' : ''}
            onclick="cambiarPagina(${paginaActual + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    container.innerHTML = html;
    
    // Guardar callback en el contenedor para usarlo en cambiarPagina
    container.dataset.callback = 'paginacion_' + Date.now();
    window[container.dataset.callback] = callback;
    
    // Reemplazar onclick con el callback correcto
    const botones = container.querySelectorAll('button');
    botones.forEach((btn, index) => {
        btn.onclick = () => {
            const nuevaPagina = index === 0 ? paginaActual - 1 : paginaActual + 1;
            if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
                callback(nuevaPagina);
            }
        };
    });
}

// Configurar filtros de reportes
document.addEventListener('DOMContentLoaded', () => {
    const btnFiltrar = document.getElementById('btn-filtrar-reportes');
    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', () => {
            // TODO: Implementar filtrado por fechas
            mostrarMensaje('Filtrado por fechas próximamente', 'info');
        });
    }
});

// ========== EXPONER FUNCIONES AL SCOPE GLOBAL ==========
window.mostrarModalAtenciones = mostrarModalAtenciones;
window.cerrarModalAtenciones = cerrarModalAtenciones;
window.eliminarVisita = eliminarVisita;
window.eliminarVisitaReporte = eliminarVisitaReporte;
