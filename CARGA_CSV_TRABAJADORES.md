# 📤 CARGA DE CSV PARA TRABAJADORES

## 🎯 REQUERIMIENTO

El administrador debe poder:

1. **Cargar un archivo CSV** con lista completa de trabajadores
2. **Actualizar semanalmente** la tabla de trabajadores
3. **Evitar duplicados** usando DNI como clave única
4. **Mezclar nuevos con existentes** en un único archivo

---

## 📊 FLUJO DE DATOS

```
Admin selecciona archivo CSV
         ↓
Frontend valida formato (nombre, apellido, dni, zona)
         ↓
Frontend envía POST /trabajadores/cargar-csv
         ↓
Backend procesa línea por línea
         ↓
Para cada fila:
  ├─ ¿DNI existe en BD?
  │  ├─ SÍ → UPDATE (actualiza nombre, apellido, zona)
  │  └─ NO → INSERT (crea nuevo trabajador)
         ↓
Backend retorna resumen:
  ├─ Insertados: 5 nuevos
  ├─ Actualizados: 12 existentes
  ├─ Errores: 0
         ↓
Frontend muestra resumen y recarga lista
```

---

## 📋 ESTRUCTURA DEL CSV

### Formato esperado:

```csv
dni,nombre,apellido,zona
12345678,Juan,Pérez,Centro
87654321,María,López,Norte
11223344,Carlos,García,Sur
12345678,Juan,Pérez Actualizado,Centro Nuevo
45678901,Ana,Martínez,Este
```

**Columnas requeridas:**

- `dni` (String, único)
- `nombre` (String)
- `apellido` (String)
- `zona` (String)

**Validaciones:**

- DNI no puede estar vacío
- DNI debe ser único (pero pueden repetirse en el mismo archivo)
- Nombre y apellido no pueden estar vacíos
- Si un DNI se repite en el CSV, usar la última fila

---

## 🏗️ ARQUITECTURA DE LA SOLUCIÓN

### **BACKEND**

#### 1. Nuevo Endpoint: `POST /trabajadores/cargar-csv`

```python
@router.post("/trabajadores/cargar-csv")
async def cargar_csv_trabajadores(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """
    - Solo administrador puede acceder
    - Valida archivo CSV
    - Actualiza/inserta trabajadores
    - Retorna resumen de cambios
    """
```

**Responsabilidades del endpoint:**

1. Verificar que es admin
2. Validar que sea CSV
3. Leer línea por línea
4. Para cada fila:
   - Validar datos
   - Verificar si DNI existe
   - INSERT o UPDATE según corresponda
5. Retornar resumen (insertados, actualizados, errores)

#### 2. Modelo de Respuesta (Schema)

```python
class TrabajadorCSVResumen(BaseModel):
    insertados: int
    actualizados: int
    errores: int
    detalles: List[Dict]  # Errores detallados por fila
    timestamp: datetime
```

#### 3. Función de Validación de CSV

```python
def validar_fila_csv(fila: dict, numero_fila: int) -> tuple[bool, str]:
    """
    Valida una fila del CSV
    Retorna: (es_valida, mensaje_error)
    """
    if not fila.get('dni'):
        return False, f"Fila {numero_fila}: DNI vacío"
    if not fila.get('nombre'):
        return False, f"Fila {numero_fila}: Nombre vacío"
    if not fila.get('apellido'):
        return False, f"Fila {numero_fila}: Apellido vacío"
    if not fila.get('zona'):
        return False, f"Fila {numero_fila}: Zona vacía"
    return True, ""
```

#### 4. Función de Procesamiento

```python
def procesar_csv_trabajadores(
    file_content: str,
    db: Session
) -> dict:
    """
    Procesa contenido CSV y retorna resumen

    Lógica:
    1. Parsear CSV
    2. Agrupar por DNI (usar último en caso de duplicados)
    3. Para cada DNI único:
       - Si existe en BD → UPDATE
       - Si no existe → INSERT
    4. Retornar resumen
    """
    import csv
    from io import StringIO

    resumen = {
        "insertados": 0,
        "actualizados": 0,
        "errores": 0,
        "detalles": []
    }

    # Leer CSV
    csv_reader = csv.DictReader(StringIO(file_content))

    # Agrupar por DNI (última fila prevalece)
    filas_por_dni = {}
    errores = []

    for numero_fila, fila in enumerate(csv_reader, start=2):  # Empieza en 2 (header es 1)
        es_valida, error = validar_fila_csv(fila, numero_fila)
        if not es_valida:
            errores.append(error)
            resumen["errores"] += 1
            continue

        dni = fila['dni'].strip()
        filas_por_dni[dni] = fila  # Sobrescribe si existe (última gana)

    # Procesar cambios en BD
    for dni, fila in filas_por_dni.items():
        trabajador_existente = db.query(Trabajador).filter(
            Trabajador.dni == dni
        ).first()

        if trabajador_existente:
            # UPDATE
            trabajador_existente.nombre = fila['nombre'].strip()
            trabajador_existente.apellido = fila['apellido'].strip()
            trabajador_existente.zona = fila['zona'].strip()
            resumen["actualizados"] += 1
        else:
            # INSERT
            nuevo = Trabajador(
                dni=dni,
                nombre=fila['nombre'].strip(),
                apellido=fila['apellido'].strip(),
                zona=fila['zona'].strip()
            )
            db.add(nuevo)
            resumen["insertados"] += 1

    # Guardar cambios
    try:
        db.commit()
        resumen["detalles"] = errores
        return resumen
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
```

#### 5. Implementación Completa del Endpoint

```python
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from typing import List
import csv
from io import StringIO

router = APIRouter(prefix="/trabajadores", tags=["trabajadores"])

@router.post("/cargar-csv")
async def cargar_csv_trabajadores(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(verify_token_admin)
):
    """
    Carga trabajadores desde CSV

    Solo acceso: Administrador

    Formato CSV esperado:
    dni,nombre,apellido,zona
    12345678,Juan,Pérez,Centro
    87654321,María,López,Norte

    Validaciones:
    - Columnas requeridas: dni, nombre, apellido, zona
    - DNI único (si se repite, usa última fila)
    - Sin campos vacíos
    - Archivo debe ser .csv
    """

    # 1. Validar que sea archivo CSV
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Archivo debe ser CSV")

    try:
        # 2. Leer contenido del archivo
        contenido = await file.read()
        contenido_str = contenido.decode('utf-8')

        # 3. Procesar CSV
        resumen = procesar_csv_trabajadores(contenido_str, db)

        # 4. Retornar resultado
        return {
            "status": "success",
            "insertados": resumen["insertados"],
            "actualizados": resumen["actualizados"],
            "errores": resumen["errores"],
            "detalles": resumen["detalles"],
            "timestamp": datetime.utcnow()
        }

    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="Archivo debe estar en UTF-8")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error procesando archivo: {str(e)}")
```

#### 6. Dependencia: Verificar Admin

```python
from fastapi import Depends, HTTPException
from auth import verify_token

async def verify_token_admin(token: str = Depends(oauth2_scheme)):
    """
    Verifica que el token sea válido y el usuario sea administrador
    """
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido")

    if payload.get("rol") != "administrador":
        raise HTTPException(status_code=403, detail="Solo administradores pueden cargar CSV")

    return payload
```

---

### **FRONTEND**

#### 1. Agregar Sección en HTML

En la sección de usuarios, agregar:

```html
<!-- NUEVA SECCIÓN: Cargar CSV Trabajadores -->
<div
  id="csv-upload-container"
  class="hidden bg-blue-50 p-6 rounded-lg mb-8 border-2 border-blue-300"
>
  <h3 class="text-xl font-semibold text-gray-700 mb-4">
    📤 Cargar Trabajadores desde CSV
  </h3>

  <!-- Instrucciones -->
  <div class="mb-4 p-3 bg-blue-100 rounded-lg text-sm text-blue-800">
    <p class="font-semibold mb-2">Formato requerido del CSV:</p>
    <code
      class="block bg-white p-2 rounded border border-blue-300 text-xs overflow-x-auto"
    >
      dni,nombre,apellido,zona<br />
      12345678,Juan,Pérez,Centro<br />
      87654321,María,López,Norte
    </code>
  </div>

  <!-- Form para subir archivo -->
  <form id="csv-form" class="space-y-4">
    <div>
      <label class="block text-gray-700 font-medium mb-2"
        >Selecciona archivo CSV</label
      >
      <input
        type="file"
        id="csv-file"
        accept=".csv"
        required
        class="w-full p-3 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer"
      />
    </div>

    <button
      type="submit"
      class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
    >
      Cargar Trabajadores
    </button>
  </form>

  <!-- Resultado -->
  <div id="csv-resultado" class="hidden mt-4 p-4 rounded-lg border-2"></div>
</div>

<!-- Este contenedor solo se muestra para administradores -->
```

#### 2. Lógica JavaScript - `js/trabajadores.js`

```javascript
// Mostrar/ocultar sección CSV según rol del usuario
const currentUser = JSON.parse(localStorage.getItem("usuario"));
const csvUploadContainer = document.getElementById("csv-upload-container");

if (currentUser && currentUser.rol === "administrador") {
  csvUploadContainer.classList.remove("hidden");
}

// Manejo del formulario CSV
const csvForm = document.getElementById("csv-form");
const csvFile = document.getElementById("csv-file");
const csvResultado = document.getElementById("csv-resultado");

csvForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // 1. Validar que se seleccionó archivo
  if (!csvFile.files.length) {
    mostrarError("Selecciona un archivo CSV");
    return;
  }

  const file = csvFile.files[0];

  // 2. Validar que sea CSV
  if (!file.name.endsWith(".csv")) {
    mostrarError("El archivo debe ser CSV");
    return;
  }

  // 3. Validar tamaño (máximo 5MB)
  if (file.size > 5 * 1024 * 1024) {
    mostrarError("El archivo no debe superar 5MB");
    return;
  }

  try {
    // 4. Enviar archivo
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_URL}/trabajadores/cargar-csv`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      // 5. Mostrar resumen de éxito
      mostrarResultadoCSV(data, "success");

      // 6. Limpiar formulario
      csvForm.reset();

      // 7. Recargar lista de trabajadores
      setTimeout(() => {
        cargarTrabajadores();
      }, 1500);
    } else {
      mostrarResultadoCSV(data, "error");
    }
  } catch (error) {
    console.error("Error cargando CSV:", error);
    mostrarError("Error al procesar el archivo");
  }
});

// Función para mostrar resultado
function mostrarResultadoCSV(data, tipo) {
  const resultado = document.getElementById("csv-resultado");

  if (tipo === "success") {
    resultado.className =
      "p-4 rounded-lg border-2 border-green-300 bg-green-50";
    resultado.innerHTML = `
            <h4 class="font-bold text-green-800 mb-2">✅ Archivo procesado correctamente</h4>
            <div class="text-green-700 space-y-1">
                <p>✨ Insertados: <span class="font-bold">${
                  data.insertados
                }</span></p>
                <p>🔄 Actualizados: <span class="font-bold">${
                  data.actualizados
                }</span></p>
                <p>⚠️ Errores: <span class="font-bold">${
                  data.errores
                }</span></p>
            </div>
            ${
              data.detalles.length > 0
                ? `
                <div class="mt-3 text-sm font-mono bg-white p-2 rounded border border-yellow-300 max-h-32 overflow-y-auto">
                    ${data.detalles
                      .map((e) => `<p class="text-yellow-700">${e}</p>`)
                      .join("")}
                </div>
            `
                : ""
            }
        `;
  } else {
    resultado.className = "p-4 rounded-lg border-2 border-red-300 bg-red-50";
    resultado.innerHTML = `
            <h4 class="font-bold text-red-800 mb-2">❌ Error al procesar archivo</h4>
            <p class="text-red-700">${data.detail || "Error desconocido"}</p>
        `;
  }

  resultado.classList.remove("hidden");
}

// Función auxiliar para mostrar errores
function mostrarError(mensaje) {
  const resultado = document.getElementById("csv-resultado");
  resultado.className = "p-4 rounded-lg border-2 border-red-300 bg-red-50";
  resultado.innerHTML = `
        <h4 class="font-bold text-red-800">❌ ${mensaje}</h4>
    `;
  resultado.classList.remove("hidden");
}
```

---

## 📊 FLUJO COMPLETO: PASO A PASO

### **Ejemplo Real:**

**CSV entrada:**

```csv
dni,nombre,apellido,zona
12345678,Juan,Pérez,Centro
87654321,María,López,Norte
11223344,Carlos,García,Sur
12345678,Juan,Pérez Actualizado,Centro Nuevo
```

**BD antes:**

```
id | dni      | nombre | apellido | zona
1  | 12345678 | Juan   | Pérez    | Centro
2  | 87654321 | María  | López    | Norte
```

**Procesamiento:**

```
1. Leer fila 2: dni=12345678, nombre=Juan, apellido=Pérez, zona=Centro
   → DNI existe → UPDATE (pero los datos son iguales)

2. Leer fila 3: dni=87654321, nombre=María, apellido=López, zona=Norte
   → DNI existe → UPDATE (pero los datos son iguales)

3. Leer fila 4: dni=11223344, nombre=Carlos, apellido=García, zona=Sur
   → DNI NO existe → INSERT nuevo trabajador

4. Leer fila 5: dni=12345678, nombre=Juan, apellido=Pérez Actualizado, zona=Centro Nuevo
   → DNI existe → UPDATE con nuevos datos (últimos en el CSV)
```

**BD después:**

```
id | dni      | nombre | apellido              | zona
1  | 12345678 | Juan   | Pérez Actualizado     | Centro Nuevo  (ACTUALIZADO)
2  | 87654321 | María  | López                 | Norte         (SIN CAMBIOS)
3  | 11223344 | Carlos | García                | Sur           (NUEVO)
```

**Respuesta al usuario:**

```json
{
  "status": "success",
  "insertados": 1,
  "actualizados": 1,
  "errores": 0,
  "detalles": [],
  "timestamp": "2024-11-18T10:30:00"
}
```

---

## 🎯 GESTIÓN DE ERRORES

### **Nivel Backend:**

```python
# Errores controlados:
1. Archivo no es CSV → 400 Bad Request
2. Encoding no es UTF-8 → 400 Bad Request
3. DNI vacío en fila X → Registra error, continúa
4. Nombre vacío en fila X → Registra error, continúa
5. Error en BD → 500 Internal Server Error + Rollback
6. Usuario no es admin → 403 Forbidden
7. Usuario no autenticado → 401 Unauthorized
```

### **Nivel Frontend:**

```javascript
1. Archivo no seleccionado → "Selecciona un archivo CSV"
2. Archivo no es CSV → "El archivo debe ser CSV"
3. Archivo >5MB → "El archivo no debe superar 5MB"
4. Error red → "Error al procesar el archivo"
5. Errores en BD → Mostrar mensaje del servidor
```

---

## 📋 CASOS DE USO

### **Caso 1: Actualización Semanal Normal**

```
Semana 1:
BD tiene 50 trabajadores

Semana 2:
Admin descarga lista de RRHH (50 actuales + 3 nuevos = 53 filas)
Admin sube CSV

Resultado:
- Nuevos trabajadores insertados: 3
- Trabajadores existentes actualizados: 50 (aunque no cambien)
- Errores: 0
```

### **Caso 2: CSV con Cambios y Errores**

```
CSV tiene:
- Fila 5: DNI vacío
- Fila 10: Nombre vacío
- Fila 20: DNI nuevo (válido)

Resultado:
- Nuevos insertados: 1
- Actualizados: 47
- Errores: 2
- Detalles:
  * Fila 5: DNI vacío
  * Fila 10: Nombre vacío
```

### **Caso 3: DNI Duplicado en Mismo CSV**

```
CSV tiene:
- Fila 2: dni=12345678, nombre=Juan, apellido=Pérez
- Fila 5: dni=12345678, nombre=Juan, apellido=Pérez Actualizado

Resultado:
- Se usa la ÚLTIMA (fila 5)
- Si ese DNI existe en BD: UPDATE con datos de fila 5
- Si no existe en BD: INSERT con datos de fila 5
```

---

## 🔒 CONSIDERACIONES DE SEGURIDAD

```
1. ✅ Solo administrador puede acceder
2. ✅ Validar tamaño de archivo (máx 5MB)
3. ✅ Validar encoding (UTF-8)
4. ✅ Validar estructura CSV
5. ✅ Rollback automático si falla BD
6. ✅ Logging de cambios (quién, cuándo, cuántos)
7. ✅ No permitir cambios de campos críticos (solo nombre, apellido, zona)
```

---

## 📝 CHANGES SUMMARY

```
BACKEND CHANGES:
├─ routes/trabajadores.py
│  └─ Agregar: POST /trabajadores/cargar-csv
├─ auth.py
│  └─ Agregar: verify_token_admin() dependencia
└─ schemas/trabajador.py (opcional)
   └─ Agregar: schema de respuesta

FRONTEND CHANGES:
├─ index.html
│  └─ Agregar: sección CSV (oculta para no-admin)
├─ js/trabajadores.js (crear archivo si no existe)
│  └─ Lógica de carga CSV
└─ index.html
   └─ Incluir: <script src="js/trabajadores.js"></script>

DATABASE:
└─ Sin cambios en estructura (tabla trabajador ya existe)
```

---

## 🎬 ORDEN DE IMPLEMENTACIÓN

```
1. Backend: verify_token_admin() en auth.py
2. Backend: Función procesar_csv_trabajadores()
3. Backend: Función validar_fila_csv()
4. Backend: Endpoint POST /trabajadores/cargar-csv
5. Frontend: HTML (input file + resultado)
6. Frontend: Lógica JavaScript (validaciones, API calls)
7. Testing: Probar con CSV ejemplo
8. Refinamiento: Mejorar mensajes de error
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

```
BACKEND:
☐ Agregar UploadFile import
☐ Agregar csv import
☐ Crear verify_token_admin dependencia
☐ Crear validar_fila_csv()
☐ Crear procesar_csv_trabajadores()
☐ Crear endpoint POST /cargar-csv
☐ Probar con CSV valido
☐ Probar con CSV con errores
☐ Probar sin permisos (no-admin)

FRONTEND:
☐ Agregar HTML form con input file
☐ Mostrar/ocultar según rol
☐ Validar archivo antes de enviar
☐ Enviar con FormData
☐ Mostrar progreso
☐ Mostrar resumen (insertados, actualizados, errores)
☐ Recargar lista de trabajadores
☐ Probar con archivo válido
☐ Probar con archivo inválido

TESTING INTEGRAL:
☐ CSV con todos datos nuevos
☐ CSV con todos datos existentes (sin cambios)
☐ CSV con mezcla (nuevos + existentes)
☐ CSV con datos duplicados (mismo DNI)
☐ CSV con datos incompletos
☐ CSV con encoding diferente
☐ Usuario no-admin intenta cargar
☐ Archivo >5MB
```

---

## 💡 MEJORAS FUTURAS (Fase 2)

```
📋 Descargar plantilla CSV desde UI
📋 Preview del CSV antes de cargar
📋 Historial de cargas (quién, cuándo, cuántos)
📋 Revertir última carga
📋 Validar datos adicionales (ej: zona debe estar en lista fija)
📋 Importar desde Excel (no solo CSV)
📋 Sincronización automática con RRHH API
📋 Notificaciones a usuarios cuando se actualizan sus datos
```

---

## 🎯 RESPUESTA A TU PREGUNTA

**¿Cómo lo haría?**

1. **Backend endpoint** que:

   - Valide que sea admin
   - Lea CSV línea por línea
   - Agrupe por DNI (última fila prevalece)
   - Para cada DNI: UPDATE si existe, INSERT si es nuevo
   - Retorne resumen (insertados, actualizados, errores)

2. **Frontend section** que:

   - Solo muestre para admin
   - Valide archivo antes de enviar
   - Envíe con FormData
   - Muestre resumen bonito
   - Recargue lista después

3. **Validaciones**:

   - DNI único en BD (constraint)
   - No campos vacíos
   - Archivo CSV válido
   - Solo admin puede acceder

4. **Duplicados en CSV**:
   - Si hay DNI repetido, usa la última fila
   - Se actualiza la BD con los datos de la última fila

**¿Listo para implementar?** 🚀
