# Central de Atención - MongoDB Edition

Sistema de Atención al Cliente migrado de SQLite a **MongoDB**.

## 🚀 Inicio Rápido

### Requisitos Previos
- Python 3.11+
- MongoDB 8.2.1 (en VPS: nexus.liderman.net.pe:27017)
- pip

### Instalación

1. **Clonar el repositorio** (ya está clonado):
```bash
cd proyecto-central-atencion
```

2. **Instalar dependencias**:
```bash
pip install -r requirements.txt
```

3. **Inicializar base de datos** (opcional - para agregar datos de prueba):
```bash
cd backend
python init_db.py
```

4. **Iniciar servidor FastAPI**:

**Opción A: Desde el directorio backend**:
```bash
cd backend
python -m uvicorn app:app --port 8000 --reload
```

**Opción B: Desde el directorio raíz**:
```bash
python -m uvicorn backend.app:app --port 8000 --reload
```

El servidor estará disponible en: **http://127.0.0.1:8000**

## 📊 Base de Datos

- **Host**: nexus.liderman.net.pe
- **Puerto**: 27017
- **Base de datos**: central_db
- **Usuario**: root
- **Contraseña**: Jdg27aCQqOzR (desde variables de entorno)

### Colecciones

- `usuarios` - Usuarios del sistema
- `trabajadores` - Historial completo de trabajadores
- `asignados` - Trabajadores activos asignados
- `incidencias` - Tickets/incidentes

## 🔐 Autenticación

**Usuario por defecto**:
- Email: `admin@central.com`
- Contraseña: `admin123`

### Obtener JWT Token
```bash
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@central.com","password":"admin123"}'
```

Respuesta:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user_id": 12345,
  "rol": "administrador",
  "area": "Administración"
}
```

## 📡 Endpoints Principales

### Usuarios
- `GET /usuarios/` - Listar todos los usuarios
- `GET /usuarios/{id}` - Obtener usuario específico
- `POST /usuarios/` - Crear nuevo usuario
- `PUT /usuarios/{id}` - Actualizar usuario
- `DELETE /usuarios/{id}` - Eliminar usuario

### Trabajadores
- `GET /trabajadores/` - Listar trabajadores
- `GET /trabajadores/{id}` - Obtener trabajador
- `POST /trabajadores/` - Crear trabajador
- `PUT /trabajadores/{id}` - Actualizar trabajador
- `DELETE /trabajadores/{id}` - Eliminar trabajador
- `POST /trabajadores/cargar-csv` - Upload CSV (admin)
- `GET /trabajadores/buscar/{dni}` - Buscar por DNI

### Asignados
- `GET /asignados/` - Listar asignados
- `GET /asignados/activos` - Solo activos
- `POST /asignados/cargar-csv` - Upload CSV (admin)
- (CRUD similar a trabajadores)

### Incidencias
- `GET /incidencias/` - Listar incidencias
- `POST /incidencias/` - Crear incidencia
- `PUT /incidencias/{id}` - Actualizar incidencia
- `DELETE /incidencias/{id}` - Eliminar incidencia

## 📄 Carga de CSV

### Formato Aceptado
- Delimitador: Coma (`,`) o Punto y Coma (`;`) - detección automática
- Codificación: UTF-8
- Limpieza de BOM automática

### Ejemplo de CSV de Trabajadores
```
tipo_compania,nombre_completo,dni,fecha_ingreso,cliente,zona,lider_zonal,jefe_operaciones,macrozona,jurisdiccion,sector
Privada,Juan Pérez,12345678,2022-01-15,Cliente A,Norte,Carlos Manager,Operador 1,Lima,Lima Centro,Sector 1
```

### Subir CSV
```bash
curl -X POST http://127.0.0.1:8000/trabajadores/cargar-csv \
  -H "Authorization: Bearer {TOKEN}" \
  -F "file=@trabajadores.csv"
```

## 🔄 Migración SQLite → MongoDB

### Cambios Principales
- **ORM**: SQLAlchemy → MongoEngine
- **IDs**: Integer → String (MongoDB ObjectId)
- **Consultas**: `.query().filter()` → `.objects().filter()`
- **Persistencia**: `db.add()` + `db.commit()` → `.save()`

### Compatibilidad
- ✅ Todos los endpoints funcionan igual
- ✅ Estructura de respuestas idéntica (excepto IDs que son strings)
- ✅ Validaciones preservadas
- ✅ CORS habilitado para frontend

## 📁 Estructura del Proyecto

```
proyecto-central-atencion/
├── backend/
│   ├── app.py                 # Aplicación FastAPI
│   ├── database.py            # Conexión MongoDB
│   ├── auth.py                # Autenticación JWT
│   ├── init_db.py             # Inicialización de datos
│   ├── models/                # Modelos MongoEngine
│   ├── routes/                # Rutas de API
│   └── schemas/               # Esquemas Pydantic
├── frontend/                  # Frontend (sin cambios)
├── requirements.txt           # Dependencias Python
└── README.md                  # Este archivo
```

## 🛠️ Desarrollo

### Ejecutar con reload automático
```bash
python -m uvicorn backend.app:app --reload
```

### Ver documentación interactiva (Swagger UI)
Ir a: http://127.0.0.1:8000/docs

### Ver documentación ReDoc
Ir a: http://127.0.0.1:8000/redoc

## 🐛 Solución de Problemas

### Puerto 8000 en uso
```bash
python -m uvicorn backend.app:app --port 8001
```

### Conexión a MongoDB falla
- Verificar credenciales en `.env`
- Verificar conectividad a nexus.liderman.net.pe:27017
- Verificar firewall

### Error de encoding Unicode en Windows
- El servidor limpia automáticamente emojis en logs
- CSV debe estar en UTF-8

## 📋 Variables de Entorno

Crear `.env` en backend/ si es necesario:
```
MONGODB_HOST=nexus.liderman.net.pe
MONGODB_PORT=27017
MONGODB_USER=root
MONGODB_PASSWORD=Jdg27aCQqOzR
MONGODB_DB=central_db
SECRET_KEY=tu-clave-secreta-muy-segura-cambiar-en-produccion
```

## ✅ Checklist Final

- [x] Migración SQLite → MongoDB completada
- [x] Todos los modelos convertidos a MongoEngine
- [x] Rutas funcionando con MongoDB
- [x] Autenticación JWT operacional
- [x] CSV upload funcional (coma y semicolon)
- [x] Datos de prueba seeded
- [x] requirements.txt actualizado
- [x] Frontend compatible (cambios transparentes)

## 📞 Soporte

Para problemas o preguntas, revisar logs del servidor o contactar al equipo de DevOps.

---

**Última actualización**: 25 de noviembre de 2025  
**Versión**: MongoDB Edition v1.0
