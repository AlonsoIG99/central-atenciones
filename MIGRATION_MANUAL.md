# 🔄 Migración Manual de MongoDB

Como la base de datos requiere autenticación y no tenemos las credenciales configuradas, aquí hay dos opciones:

## Opción 1: Usando MongoDB Compass (Interfaz Gráfica - Más Fácil)

### Pasos:

1. **Abre MongoDB Compass**

   - Descarga desde: https://www.mongodb.com/products/tools/compass
   - O usa tu instalación local

2. **Conéctate a la BD**

   - URI: `mongodb://nexus.liderman.net.pe:27017/central_db`
   - Si pide credenciales, usa tu usuario/contraseña

3. **Renombra la colección**

   - Click derecho en `incidencias` → "Rename Collection"
   - Nuevo nombre: `atenciones`
   - Click "Rename"

4. **Actualiza campos en `reporte_dashboards`**
   - Click en colección `reporte_dashboards`
   - Abre "Aggregation" tab
   - Pega este pipeline:

```javascript
[
  {
    $set: {
      atencion_id: "$incidencia_id",
      titulo_atencion: "$titulo_incidencia",
      descripcion_atencion: "$descripcion_incidencia",
      estado_atencion: "$estado_incidencia",
      fecha_creacion_atencion: "$fecha_creacion_incidencia",
      fecha_cierre_atencion: "$fecha_cierre_incidencia",
    },
  },
  {
    $unset: [
      "incidencia_id",
      "titulo_incidencia",
      "descripcion_incidencia",
      "estado_incidencia",
      "fecha_creacion_incidencia",
      "fecha_cierre_incidencia",
    ],
  },
  {
    $merge: {
      into: "reporte_dashboards",
      whenMatched: "replace",
    },
  },
];
```

5. Click en "Execute Aggregation"

---

## Opción 2: Script Python (Si tienes credenciales)

### Pasos:

1. **Edita `migrate_db.py`**

Reemplaza esta línea:

```python
MONGO_URL = "mongodb://nexus.liderman.net.pe:27017/central_db"
```

Con:

```python
MONGO_URL = "mongodb://usuario:contraseña@nexus.liderman.net.pe:27017/central_db?authSource=admin"
```

2. **Ejecuta el script**

```bash
cd backend
python migrate_db.py
```

---

## Opción 3: Línea de Comandos MongoDB

Si tienes MongoDB CLI instalado:

```bash
# Conectar y ejecutar comandos
mongosh "mongodb://usuario:contraseña@nexus.liderman.net.pe:27017/central_db"

# Renombrar colección
db.incidencias.renameCollection("atenciones")

# Actualizar campos
db.reporte_dashboards.updateMany(
  {},
  [
    {
      "$set": {
        "atencion_id": "$incidencia_id",
        "titulo_atencion": "$titulo_incidencia",
        "descripcion_atencion": "$descripcion_incidencia",
        "estado_atencion": "$estado_incidencia",
        "fecha_creacion_atencion": "$fecha_creacion_incidencia",
        "fecha_cierre_atencion": "$fecha_cierre_incidencia"
      }
    },
    {
      "$unset": [
        "incidencia_id",
        "titulo_incidencia",
        "descripcion_incidencia",
        "estado_incidencia",
        "fecha_creacion_incidencia",
        "fecha_cierre_incidencia"
      ]
    }
  ]
)

# Ver resultado
db.atenciones.countDocuments()
db.reporte_dashboards.countDocuments()
```

---

## ✅ Verificación

Después de migrar, verifica que:

1. ✅ Colección `atenciones` existe y tiene documentos
2. ✅ Colección `incidencias` ya no existe (o está vacía)
3. ✅ Campo `atencion_id` existe en `reporte_dashboards`
4. ✅ Campos antiguos `incidencia_*` fueron removidos

---

## ❓ ¿Necesitas ayuda?

- Contacta al administrador de MongoDB para obtener las credenciales
- O usa MongoDB Compass (Opción 1) que es la más fácil

El código del backend y frontend **ya está completamente actualizado** y listo para usar con la nueva nomenclatura.
