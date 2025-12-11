// Gestión de Asignados
document.addEventListener('DOMContentLoaded', function () {
    setupAsignadosEventListeners();
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

        const response = await fetchConAutoRefresh(`${API_URL}/asignados/cargar-csv`, {
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
                📊 Registros insertados: <strong>${data.insertados}</strong><br>
                🔄 Registros actualizados: <strong>${data.actualizados}</strong><br>
                ⚠️ Errores: <strong>${data.errores}</strong>
            `;
            showAsignadosResult('success', mensaje);

            // Limpiar el formulario
            document.getElementById('asignados-csv-form').reset();
        } else {
            const errorMsg = data.detail || data.error || 'Error desconocido';
            showAsignadosResult('error', `Error: ${errorMsg}`);
        }
    } catch (error) {
        console.error('Error:', error);
        showAsignadosResult('error', `Error al cargar: ${error.message}. Verifica la consola para más detalles.`);
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
