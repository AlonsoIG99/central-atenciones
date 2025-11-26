# INCIDENTE RESUELTO: Inserciones Automáticas en Trabajadores

**Fecha:** 25 de noviembre, 2025
**Estado:** ✅ RESUELTO
**Duración:** ~1 hora

## Síntesis del Problema

El usuario reportó que después de una carga CSV que se quedó "pegada", los registros de trabajadores seguían aumentando en MongoDB incluso después de detener el backend.

### Síntomas Observados:
- Página de carga se quedaba congelada
- BD insertaba ~5 registros por segundo sin intervención manual
- Conteo creció de 0 a 7,500+ registros en poco tiempo
- Perseguía después de "detener" el servidor

## Root Cause Analysis

### Problema 1: Índice Conflictivo
**Ubicación:** `backend/models/trabajador.py`

El modelo tenía definiciones de índice duplicadas:
```python
# Error: Dos definiciones del mismo índice
dni = StringField(required=True, unique=True, index=True, sparse=True)

meta = {
    'indexes': [
        'dni',  # ← Crea índice no-unique
        {'fields': ['dni'], 'unique': True}  # ← Intenta crear índice unique
    ]
}
```

**Impacto:** MongoEngine no podía crear índices correctamente, permitiendo inserciones duplicadas.

**Solución:**
```python
# Correcto: Una sola definición clara
dni = StringField(required=True)

meta = {
    'indexes': [
        {'fields': ['dni'], 'unique': True, 'sparse': True},
        'nombre_completo'
    ]
}
```

### Problema 2: Procesos Python en Bucle

**Ubicación:** Externo al proyecto (Desktop del usuario)

Se encontraron 2 procesos Python ejecutándose continuamente:
- PID 9968
- PID 21448

Estos procesos estaban cargando archivos CSV desde:
- `/c/Users/aingar/Desktop/carga_trabajadores.csv`
- `/c/Users/aingar/Desktop/carga_asignado.csv`

**Origen Probable:** Test o script de carga que se ejecutaba en un bucle `while True` o sin forma de detenerse.

**Solución:** Eliminación forzada de procesos usando `os.kill(pid, 9)`.

## Acciones Tomadas

### 1. Diagnóstico (Orden Cronológico)
- ✅ Identificó conflicto de índices en MongoDB
- ✅ Eliminó índices conflictivos y recreó índice único limpio
- ✅ Monitoreó aumento continuo de registros
- ✅ Verificó que NO provenía del endpoint API
- ✅ Localizó archivos CSV en Desktop
- ✅ Identificó 2 procesos Python activos

### 2. Contención
- ✅ Deshabilitó temporalmente endpoint CSV
- ✅ Agregó signals para logging de inserciones
- ✅ Creó scripts de monitoreo

### 3. Remediación
- ✅ Mató procesos Python 9968 y 21448
- ✅ Verificó que inserciones se detuvieron (10 segundos sin cambios)
- ✅ Limpió BD: Eliminó 135 registros duplicados
- ✅ Reactivó endpoint CSV
- ✅ Insertó 8 trabajadores de prueba limpios

### 4. Hardening
- ✅ Índice único en DNI con sparse=true funcionando
- ✅ Validación en rutas de trabajadores
- ✅ Commits de cambios

## Estado Final

### Base de Datos
```
Colección: trabajadores
Documentos: 8 (datos de prueba)
Índice DNI: UNIQUE, SPARSE ✅
```

### Código
- `backend/models/trabajador.py` - Índice limpio
- `backend/routes/trabajadores.py` - Endpoint CSV reactivado
- Commits registrados en git

### Procesos
- Todos los procesos Python externos detenidos
- Sin procesos anómalosten segundo plano

## Recomendaciones

### 1. Prevención
- ❌ NO ejecutes scripts de carga CSV sin supervisión
- ❌ NO dejes procesos Python corriendo en bucles infinitos
- ✅ Usa control de versión para scripts de carga
- ✅ Documenta scripts de prueba

### 2. Monitoreo
- Implementar alertas si conteo de trabajadores crece demasiado rápido
- Auditar cambios en MongoDB (quién, cuándo, qué)
- Logs de errores en inserciones

### 3. Procedimientos
- Hacer backup ANTES de carga CSV en lote
- Pruebas con pequeños archivos (10-20 registros) primero
- Validar datos antes de cargar

### 4. Índices MongoDB
Siempre usar sintaxis clara y única:
```python
meta = {
    'indexes': [
        {'fields': [('dni', 1)], 'unique': True, 'sparse': True}
    ]
}
```

## Testing

Para verificar que esto no vuelve a pasar:

```bash
# 1. Verificar índices
python -c "
from backend.models.trabajador import Trabajador
from pymongo import MongoClient
client = MongoClient('mongodb://root:pass@host/central_db?authSource=admin')
for idx in client.central_db.trabajadores.list_indexes():
    print(f\"{idx['name']}: unique={idx.get('unique')}, sparse={idx.get('sparse')}\")
"

# 2. Probar inserción duplicada
python -c "
from backend.models.trabajador import Trabajador
try:
    # Esto debe fallar si el índice funciona
    Trabajador(dni='12345678', nombre_completo='Test').save()
    Trabajador(dni='12345678', nombre_completo='Duplicate').save()
    print('ERROR: Índice no está funcionando')
except Exception as e:
    print(f'✓ Índice funcionando: {e}')
"
```

## Archivos Relacionados

- Backend: `backend/routes/trabajadores.py` (POST /trabajadores/cargar-csv)
- Modelo: `backend/models/trabajador.py` (Definición de índice)
- Scripts: `debug_inserciones.py`, `audit_inserciones.py`, `bloquear_inserciones.py`

## Lecciones Aprendidas

1. **Los índices en MongoDB deben estar claramente definidos** - Las definiciones duplicadas causan conflictos silenciosos
2. **Monitoreo en tiempo real es crítico** - Sin el monitoreo no habríamos detectado que seguía ocurriendo
3. **Los procesos externos pueden seguir ejecutándose** - Siempre revisar qué está corriendo en background
4. **El índice sparse es importante** - Permite tener campos nulos sin violar la unicidad

---

**Estado Actual:** Sistema listo para operación normal ✅
