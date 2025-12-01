# 🔄 Migración: Incidencias → Atenciones

Este documento explica cómo migrar la base de datos MongoDB de "incidencias" a "atenciones".

## 📋 ¿Qué se cambia?

### Colecciones:
- ❌ `incidencias` → ✅ `atenciones`

### Campos en `reporte_dashboards`:
- `incidencia_id` → `atencion_id`
- `titulo_incidencia` → `titulo_atencion`
- `descripcion_incidencia` → `descripcion_atencion`
- `estado_incidencia` → `estado_atencion`
- `fecha_creacion_incidencia` → `fecha_creacion_atencion`
- `fecha_cierre_incidencia` → `fecha_cierre_atencion`

## 🚀 Cómo ejecutar la migración

### Opción 1: Desde el backend (Recomendado)

```bash
# 1. Navega al directorio backend
cd backend

# 2. Activa el entorno virtual
source venv/Scripts/activate  # Windows
# o
source venv/bin/activate      # Linux/Mac

# 3. Instala las dependencias si es necesario
pip install -r requirements.txt

# 4. Ejecuta el script de migración
python migrate_incidencias_to_atenciones.py
```

### Opción 2: Usando MongoDB Compass (Manual)

1. Abre MongoDB Compass
2. Conéctate a `mongodb://nexus.liderman.net.pe:27017/central_db`
3. Click derecho en colección `incidencias` → Rename → `atenciones`
4. En `reporte_dashboards`, usa agregaciones para renombrar campos

## ✅ Verificación

Después de ejecutar la migración, verás:

```
1️⃣  Renombrando colección 'incidencias' → 'atenciones'...
   ✅ Colección renombrada exitosamente

2️⃣  Actualizando campos en 'reporte_dashboards'...
   ✅ 0 documentos actualizados

3️⃣  Verificando índices...
   ✅ Índices verificados/creados

✅ ¡Migración completada exitosamente!

Colecciones en la base de datos:
  - atenciones: X documentos
  - reporte_dashboards: Y documentos
  - usuarios: Z documentos
  - ...
```

## ⚠️ Importante

- **Hacer backup antes de migrar**: `mongodump --uri="mongodb://nexus.liderman.net.pe:27017/central_db"`
- El script es **idempotente**: se puede ejecutar múltiples veces sin problemas
- No modifica datos, solo renombra colecciones y campos
- Los índices se recrean automáticamente

## 🔙 Rollback (si es necesario)

Si necesitas revertir los cambios:

```bash
python rollback_atenciones_to_incidencias.py
```

(Este script se generará si lo necesitas)

## 📝 Notas

- Los modelos de Python ya usan la colección `atenciones`
- Las rutas API ya están en `/atenciones`
- El frontend ya busca campos `atencion_*`
- Después de migrar, todo funcionará normalmente

¿Necesitas ayuda? Ejecuta: `python migrate_incidencias_to_atenciones.py --help`
