const formIncidencia = document.getElementById('incidencia-form');
const incidenciasList = document.getElementById('incidencias-list');

// Cargar incidencias
async function cargarIncidencias() {
    const incidencias = await obtenerIncidencias();
    incidenciasList.innerHTML = '';
    
    if (incidencias.length === 0) {
        incidenciasList.innerHTML = '<p>No hay incidencias registradas</p>';
        return;
    }
    
    incidencias.forEach(incidencia => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <div class="list-item-content">
                <strong>${incidencia.titulo}</strong><br>
                <p>${incidencia.descripcion}</p>
                <small>Estado: <strong>${incidencia.estado}</strong> | Usuario ID: ${incidencia.usuario_id}</small>
            </div>
            <div class="list-item-actions">
                <button class="btn-delete" onclick="eliminarInc(${incidencia.id})">Eliminar</button>
            </div>
        `;
        incidenciasList.appendChild(div);
    });
}

// Crear incidencia
formIncidencia.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const incidencia = {
        titulo: document.getElementById('incidencia-titulo').value,
        descripcion: document.getElementById('incidencia-descripcion').value,
        usuario_id: parseInt(document.getElementById('incidencia-usuario_id').value),
        estado: document.getElementById('incidencia-estado').value
    };
    
    const resultado = await crearIncidencia(incidencia);
    if (resultado) {
        mostrarExito('Incidencia creada exitosamente');
        formIncidencia.reset();
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
