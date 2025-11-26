// Gestión de Asignados
document.addEventListener('DOMContentLoaded', function () {
    setupAsignadosEventListeners();
    loadAsignadosList();
});

function setupAsignadosEventListeners() {
    const form = document.getElementById('asignados-csv-form');
    if (form) {
        form.addEventListener('submit', handleAsignadosCSVUpload);
    }

    const asignadosBtn = document.getElementById('btn-asignados');
    if (asignadosBtn) {
        asignadosBtn.addEventListener('click', function () {
            mostrarSeccion('asignados');
            loadAsignadosList();
        });
    }
}

async function handleAsignadosCSVUpload(event) {
    event.preventDefault();

    const fileInput = document.getElementById('asignados-csv-file');
    const file = fileInput.files[0];

    if (!file) {
        showAsignadosResult('error', 'Por favor selecciona un archivo CSV');
        return;
    }

    // Validar que sea un archivo CSV
    if (!file.name.endsWith('.csv')) {
        showAsignadosResult('error', 'El archivo debe ser un CSV');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        showAsignadosResult('loading', 'Cargando asignados...');

        const response = await fetch('http://127.0.0.1:8000/asignados/cargar-csv', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            const mensaje = `
                ✅ <strong>Carga completada exitosamente</strong><br>
                📊 Registros insertados: <strong>${data.resumen.insertados}</strong><br>
                🔄 Registros actualizados: <strong>${data.resumen.actualizados}</strong><br>
                ⚠️ Errores: <strong>${data.resumen.errores}</strong><br>
                ⏱️ Tiempo total: <strong>${data.resumen.tiempo_segundos.toFixed(2)}s</strong>
            `;
            showAsignadosResult('success', mensaje);

            // Limpiar el formulario
            document.getElementById('asignados-csv-form').reset();

            // Recargar la lista
            setTimeout(loadAsignadosList, 1000);
        } else {
            showAsignadosResult('error', `Error: ${data.detail || 'Error desconocido'}`);
        }
    } catch (error) {
        console.error('Error:', error);
        showAsignadosResult('error', `Error al cargar: ${error.message}`);
    }
}

function showAsignadosResult(type, message) {
    const resultDiv = document.getElementById('asignados-csv-resultado');
    resultDiv.innerHTML = message;
    resultDiv.className = '';

    if (type === 'success') {
        resultDiv.className = 'p-4 rounded-lg border-2 bg-green-100 border-green-300 text-green-800';
    } else if (type === 'error') {
        resultDiv.className = 'p-4 rounded-lg border-2 bg-red-100 border-red-300 text-red-800';
    } else if (type === 'loading') {
        resultDiv.className = 'p-4 rounded-lg border-2 bg-blue-100 border-blue-300 text-blue-800';
    }

    resultDiv.classList.remove('hidden');
}

async function loadAsignadosList() {
    try {
        const response = await fetch('http://127.0.0.1:8000/asignados/', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            displayAsignadosList(data);
        }
    } catch (error) {
        console.error('Error cargando lista de asignados:', error);
    }
}

function displayAsignadosList(asignados) {
    const listDiv = document.getElementById('asignados-list');

    if (!asignados || asignados.length === 0) {
        listDiv.innerHTML = '<p class="text-gray-500">No hay asignados registrados</p>';
        return;
    }

    let html = `
        <div class="overflow-x-auto">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="bg-green-600 text-white">
                    <tr>
                        <th class="border border-gray-300 p-3 text-left">Nombre Completo</th>
                        <th class="border border-gray-300 p-3 text-left">DNI</th>
                        <th class="border border-gray-300 p-3 text-left">Tipo Compañía</th>
                        <th class="border border-gray-300 p-3 text-left">Zona</th>
                        <th class="border border-gray-300 p-3 text-left">MacroZona</th>
                        <th class="border border-gray-300 p-3 text-left">Sector</th>
                        <th class="border border-gray-300 p-3 text-left">Estado</th>
                    </tr>
                </thead>
                <tbody>
    `;

    asignados.forEach((asignado) => {
        const estado = asignado.estado || 'activo';
        const estadoColor = estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

        html += `
            <tr class="hover:bg-gray-100">
                <td class="border border-gray-300 p-3">${asignado.nombre_completo || '-'}</td>
                <td class="border border-gray-300 p-3">${asignado.dni || '-'}</td>
                <td class="border border-gray-300 p-3">${asignado.tipo_compania || '-'}</td>
                <td class="border border-gray-300 p-3">${asignado.zona || '-'}</td>
                <td class="border border-gray-300 p-3">${asignado.macrozona || '-'}</td>
                <td class="border border-gray-300 p-3">${asignado.sector || '-'}</td>
                <td class="border border-gray-300 p-3">
                    <span class="px-3 py-1 rounded-full text-sm font-semibold ${estadoColor}">
                        ${estado}
                    </span>
                </td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
            <p class="text-sm text-gray-500 mt-3">Total de registros: ${asignados.length}</p>
        </div>
    `;

    listDiv.innerHTML = html;
}
