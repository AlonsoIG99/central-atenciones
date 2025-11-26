# ✅ Central de Atención - Sistema de Gestión de Incidencias

Proyecto de gestión de incidencias con **FastAPI**, **SQLite** y **Vanilla JavaScript**.

**Estado:** ✨ Completamente funcional y listo para usar

---

## 🚀 INICIO RÁPIDO

### 1. Haz doble click en `start.bat` (Windows)

O ejecuta en terminal:

```bash
python init_db.py
python -m uvicorn app:app --reload
```

### 2. Abre en navegador: `frontend/index.html`

### 3. Login con:

```
Email: admin@central.com
Contraseña: admin123
```

**¡Listo! ✅**

---

## 📖 DOCUMENTACIÓN

- **INICIO_RAPIDO.md** ← Cómo empezar
- **COMO_HACER_FUNCIONAR.md** ← Guía detallada si algo falla

---

## 📋 CARACTERÍSTICAS

### 1. Inicializar Base de Datos (Primera vez)

```bash
cd backend
source venv/Scripts/activate
python init_db.py
```

**Resultado:**

- ✅ BD con nuevas tablas creadas
- ✅ Usuario admin: `admin@central.com` / `admin123`
- ✅ 8 trabajadores de prueba

### 2. Iniciar Backend

```bash
python -m uvicorn app:app --reload
```

Backend en: http://localhost:8000

### 3. Abrir Frontend

Abre en navegador: `frontend/index.html`

### 4. Acceder

- Email: `admin@central.com`
- Contraseña: `admin123`

---

## ��� Características

### ��� Autenticación

- Login con Email/Contraseña
- JWT con expiración (30 minutos)
- Roles: Administrador, Gestor
- Solo admins crean usuarios

### ��� Gestión de Usuarios

- CRUD de usuarios (admin only)
- Roles con permisos diferentes
- Área/Departamento asignado

### ��� Gestión de Incidencias

- Formulario jerárquico dinámico
- **Autocompletado DNI** en tiempo real
- Estados: Abierta, En Progreso, Cerrada
- Búsqueda y filtrado

### ��� Base de Trabajadores

- 8 trabajadores de prueba preinstalados
- Búsqueda por DNI para autocompletado
- Independiente de incidencias

### ��� Reportes

- Filtro por DNI
- Filtro por rango de fechas
- Vista detallada de incidencias

---

## ��� Estructura del Proyecto

```
proyecto-central-atencion/
├── backend/
│   ├── app.py                 # FastAPI main
│   ├── database.py            # SQLite config
│   ├── auth.py                # JWT auth
│   ├── config.py              # Environment
│   ├── init_db.py             # ⭐ Init script
│   ├── models/                # ORM models
│   ├── schemas/               # Pydantic schemas
│   ├── routes/                # API endpoints
│   ├── central_atencion.db    # SQLite database
│   └── venv/                  # Python venv
│
└── frontend/
    ├── index.html             # Main UI
    ├── style.css              # Tailwind CSS
    └── js/
        ├── api.js             # API calls
        ├── usuarios.js        # Users logic
        ├── incidencias.js     # Incidents + autocomplete
        ├── reportes.js        # Reports logic
        └── script.js          # Main logic
```

---

## ��� API Endpoints

### Autenticación

- `POST /login` - Login usuario
- `POST /refresh` - Refrescar token

### Usuarios (Admin Only)

- `GET /usuarios/` - Listar usuarios
- `POST /usuarios/` - Crear usuario
- `PUT /usuarios/{id}` - Actualizar usuario
- `DELETE /usuarios/{id}` - Eliminar usuario

### Incidencias

- `GET /incidencias/` - Listar incidencias
- `GET /incidencias/{id}` - Obtener incidencia
- `POST /incidencias/` - Crear incidencia
- `PUT /incidencias/{id}` - Actualizar incidencia
- `DELETE /incidencias/{id}` - Eliminar incidencia

### Trabajadores (Para Autocompletado)

- `GET /trabajadores/` - Listar trabajadores
- `GET /trabajadores/buscar/{dni}` - Buscar por DNI (autocomplete)
- `GET /trabajadores/{id}` - Obtener trabajador
- `POST /trabajadores/` - Crear trabajador (admin)
- `PUT /trabajadores/{id}` - Actualizar trabajador (admin)
- `DELETE /trabajadores/{id}` - Eliminar trabajador (admin)

---

## ��� Datos de Prueba

**Usuario Admin:**

- Email: `admin@central.com`
- Contraseña: `admin123`

**Trabajadores Incluidos:**

1. Juan Pérez - 12345678 (Centro)
2. María García - 23456789 (Sur)
3. Carlos López - 34567890 (Norte)
4. Ana Rodríguez - 45678901 (Este)
5. Pedro Martínez - 56789012 (Oeste)
6. Laura Fernández - 67890123 (Centro)
7. Diego Sánchez - 78901234 (Sur)
8. Sofía González - 89012345 (Norte)

---

## ��� Roles y Permisos

### Administrador

- ✅ Crear usuarios
- ✅ Ver todos los usuarios
- ✅ Crear incidencias
- ✅ Ver todas las incidencias
- ✅ Gestionar trabajadores

### Gestor

- ❌ Crear usuarios
- ✅ Crear incidencias
- ✅ Ver sus incidencias
- ✅ Ver reportes

---

## ��� Documentación

Para documentación interactiva de la API (Swagger):

1. Inicia el backend
2. Visita: http://localhost:8000/docs

---

## ��� Flujo de Uso

### Primer Login

```
1. Email: admin@central.com
2. Contraseña: admin123
3. Click: "Iniciar Sesión"
```

### Crear Gestores

```
1. Pestaña: Usuarios
2. Llenar formulario
3. Rol: Gestor
4. Click: "Crear Usuario"
```

### Crear Incidencia

```
1. Pestaña: Incidencias
2. DNI: 12345678 (con autocompletado)
3. Rellenar campos jerárquicos
4. Estado: Abierta
5. Click: "Enviar Incidencia"
```

### Ver Reportes

```
1. Pestaña: Reportes
2. Buscar por DNI (opcional)
3. Filtrar por fechas (opcional)
4. Ver detalles de incidencias
```

---

## ���️ Tecnologías

**Backend:**

- FastAPI 0.104.1
- SQLAlchemy 2.0.23
- SQLite
- JWT (python-jose)
- bcrypt/passlib

**Frontend:**

- Vanilla JavaScript (ES6+)
- Tailwind CSS
- Fetch API
- localStorage

---

## ✨ Implementado

✅ Arquitectura BD sin FK entre incidencias y trabajadores  
✅ Tabla trabajadores solo para autocompletado  
✅ Frontend con autocomplete DNI en tiempo real  
✅ Script de inicialización automática (init_db.py)  
✅ Usuario admin creado automáticamente  
✅ 8 trabajadores de prueba preincluidos  
✅ Control de acceso basado en roles (RBAC)  
✅ Formulario jerárquico dinámico  
✅ Búsqueda y filtrado de reportes  
✅ Documentación Swagger completa

**¡El sistema está 100% funcional! ��**
