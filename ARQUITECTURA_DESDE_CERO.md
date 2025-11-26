# 🏗️ ARQUITECTURA DESDE CERO: Central de Atención

## 📊 ESTADO ACTUAL DEL PROYECTO

Tu proyecto está en **fase 4 de 5** (completamente funcional):

```
Fase 1: Setup inicial           ✅ (Completado)
Fase 2: Backend API             ✅ (Completado)
Fase 3: Frontend básico         ✅ (Completado)
Fase 4: Features avanzadas      ✅ (En progreso - Préstamo exclusivo)
Fase 5: Dashboards/Analytics    📍 (Pendiente)
Fase 6: Despliegue producción   📋 (Documentado, no iniciado)
```

---

## 🎯 CÓMO LO HARÍA DESDE 0

Si empezara de cero, seguiría esta estrategia:

### **FASE 1: DEFINICIÓN Y PLANIFICACIÓN (Antes de escribir código)**

#### 1.1 Entender Requerimientos

```
Pregunta clave:
¿Cuál es el PROBLEMA que resuelve este sistema?

Respuesta (Central de Atención):
- Registrar incidencias de trabajadores
- Clasificarlas jerárquicamente (Pago incorrecto → Planillas → Retención, etc.)
- Gestionar usuarios con roles (admin, gestor)
- Generar reportes
- Autorizar préstamos (aprobado/no aprobado)

Alcance:
- ✅ HACER: Incidencias, usuarios, reportes, autocomplete DNI
- ❌ NO HACER: Email automáticos, notificaciones, pagos reales
```

#### 1.2 Definir Arquitectura de Datos

```
ENTIDADES PRINCIPALES:

┌─────────────┐
│  Usuarios   │  (admin, gestor)
├─────────────┤
│ - id        │
│ - email     │
│ - nombre    │
│ - rol       │
│ - contraseña│
└─────────────┘
       │
       │ crea
       ↓
┌──────────────────┐
│  Incidencias     │  (problema reportado)
├──────────────────┤
│ - id             │
│ - dni (string)   │
│ - titulo         │
│ - descripción    │
│ - estado         │
│ - usuario_id (FK)│
│ - fechas         │
└──────────────────┘

┌──────────────┐
│ Trabajadores │  (para autocomplete DNI)
├──────────────┤
│ - id         │
│ - dni        │
│ - nombre     │
│ - apellido   │
│ - zona       │
└──────────────┘
    ↑
    │ consulta
    │
Usuario busca DNI
```

**Decisión arquitectónica clave:**

- ❌ NO hacer FK entre Incidencia y Trabajador (más flexible)
- ✅ Dejar "dni" como String en Incidencia
- ✅ Trabajador solo para búsqueda/autocomplete

#### 1.3 Definir Flujos de Datos

```
FLUJO 1: CREAR INCIDENCIA
1. Usuario selecciona DNI (autocomplete consulta /trabajadores/buscar/{dni})
2. Usuario rellena formulario jerárquico (checkboxes dinámicos)
3. Usuario envía formulario
4. Backend valida y guarda en BD
5. Frontend recarga lista

FLUJO 2: REPORTES
1. Usuario filtra por DNI y fecha
2. Backend hace query con WHERE dni LIKE "12" AND fecha BETWEEN X Y Z
3. Frontend muestra resultados

FLUJO 3: GESTIÓN USUARIOS
1. Admin crea usuario (POST /usuarios)
2. Usuario recibe credenciales
3. Usuario hace login (JWT)
4. Token válido 30 minutos
```

#### 1.4 Definir Tecnología Stack

```
BACKEND:
- FastAPI (más moderno que Django)
- SQLAlchemy ORM (flexible, SQL nativo si necesario)
- SQLite (simple, sin infra externa)
- JWT + bcrypt (autenticación)
- Pydantic (validación)

FRONTEND:
- Vanilla JS (sin dependencias = más control)
- Tailwind CSS (styling rápido)
- Fetch API (HTTP requests)
- localStorage (persistencia sesión)

DEPLOYMENT:
- VPS Linux
- Python 3.9+
- Nginx (proxy inverso)
- PM2 o systemd (manage proceso)
```

---

### **FASE 2: ESTRUCTURA BASE (Primeras 2 horas)**

#### 2.1 Crear Estructura de Carpetas

```
proyecto-central-atencion/
├── backend/
│   ├── models/           # SQLAlchemy ORM
│   │   ├── __init__.py
│   │   ├── usuario.py
│   │   ├── incidencia.py
│   │   └── trabajador.py
│   ├── routes/          # Endpoints (routers FastAPI)
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── usuarios.py
│   │   ├── incidencias.py
│   │   └── trabajadores.py
│   ├── schemas/         # Pydantic (validación)
│   │   ├── __init__.py
│   │   ├── usuario.py
│   │   └── incidencia.py
│   ├── app.py           # FastAPI main
│   ├── database.py      # SQLAlchemy setup
│   ├── auth.py          # JWT logic
│   ├── config.py        # Settings
│   ├── init_db.py       # Script inicialización
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── index.html       # Main UI
│   ├── js/
│   │   ├── api.js       # Llamadas HTTP
│   │   ├── auth.js      # Login logic
│   │   ├── script.js    # Main app
│   │   ├── usuarios.js
│   │   ├── incidencias.js
│   │   └── reportes.js
│   ├── style.css
│   └── assets/
├── docs/               # Documentación
│   ├── README.md
│   ├── ARQUITECTURA.md
│   └── SETUP.md
├── .git
├── .gitignore
└── requirements.txt
```

#### 2.2 Crear Archivos Base Mínimos

**backend/requirements.txt**

```
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
python-jose==3.3.0
passlib==1.7.4
bcrypt==4.1.1
python-dotenv==1.0.0
pydantic==2.4.2
```

**backend/config.py**

```python
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./central_atencion.db")
SECRET_KEY = os.getenv("SECRET_KEY", "tu-clave-secreta-cambiar-en-produccion")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
```

**backend/database.py**

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import DATABASE_URL

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

### **FASE 3: MODELOS DE DATOS (1 hora)**

#### 3.1 Definir Modelos SQLAlchemy

**backend/models/usuario.py**

```python
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True)
    nombre = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    contraseña_hash = Column(String)
    rol = Column(String, default="gestor")  # "administrador" o "gestor"
    area = Column(String)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
```

**backend/models/incidencia.py**

```python
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from datetime import datetime
from database import Base

class Incidencia(Base):
    __tablename__ = "incidencias"

    id = Column(Integer, primary_key=True)
    dni = Column(String, index=True)
    titulo = Column(String)
    descripcion = Column(String)  # JSON como string
    estado = Column(String, default="abierta")
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_actualizacion = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

**backend/models/trabajador.py**

```python
from sqlalchemy import Column, Integer, String
from database import Base

class Trabajador(Base):
    __tablename__ = "trabajadores"

    id = Column(Integer, primary_key=True)
    dni = Column(String, unique=True, index=True)
    nombre = Column(String, index=True)
    apellido = Column(String)
    zona = Column(String)
```

---

### **FASE 4: SCHEMAS PYDANTIC (30 minutos)**

**backend/schemas/usuario.py**

```python
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UsuarioCreate(BaseModel):
    nombre: str
    email: EmailStr
    contraseña: str
    rol: str
    area: str

class UsuarioResponse(BaseModel):
    id: int
    nombre: str
    email: str
    rol: str
    area: str
    fecha_creacion: datetime

    class Config:
        from_attributes = True
```

---

### **FASE 5: AUTENTICACIÓN (1.5 horas)**

**backend/auth.py**

```python
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
```

**backend/routes/auth.py**

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.usuario import UsuarioCreate
from models.usuario import Usuario
from database import get_db
from auth import hash_password, create_access_token, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login")
async def login(email: str, contraseña: str, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if not usuario or not verify_password(contraseña, usuario.contraseña_hash):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    token = create_access_token({"email": usuario.email, "user_id": usuario.id, "rol": usuario.rol})
    return {"access_token": token, "user_id": usuario.id, "rol": usuario.rol}
```

---

### **FASE 6: ENDPOINTS PRINCIPALES (2 horas)**

**Endpoints necesarios:**

```python
# AUTH
POST   /auth/login

# USUARIOS (admin only)
GET    /usuarios
POST   /usuarios
PUT    /usuarios/{id}
DELETE /usuarios/{id}

# INCIDENCIAS
GET    /incidencias
POST   /incidencias
PUT    /incidencias/{id}
DELETE /incidencias/{id}

# TRABAJADORES
GET    /trabajadores
POST   /trabajadores
GET    /trabajadores/buscar/{dni}  # Para autocomplete

# REPORTES
GET    /reportes/filtrar?dni=12&fecha_desde=2024-01-01&fecha_hasta=2024-12-31
```

---

### **FASE 7: FRONTEND HTML BÁSICO (1 hora)**

**frontend/index.html** (estructura mínima)

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Central de Atención</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="app">
      <nav>
        <button id="btn-usuarios">Usuarios</button>
        <button id="btn-incidencias">Incidencias</button>
        <button id="btn-reportes">Reportes</button>
      </nav>

      <main>
        <!-- USUARIOS -->
        <section id="usuarios-section">
          <form id="usuario-form"></form>
          <div id="usuarios-list"></div>
        </section>

        <!-- INCIDENCIAS -->
        <section id="incidencias-section">
          <form id="incidencia-form"></form>
          <div id="incidencias-list"></div>
        </section>

        <!-- REPORTES -->
        <section id="reportes-section">
          <div id="filtros"></div>
          <div id="reportes-list"></div>
        </section>
      </main>
    </div>

    <script src="js/api.js"></script>
    <script src="js/auth.js"></script>
    <script src="js/usuarios.js"></script>
    <script src="js/incidencias.js"></script>
    <script src="js/reportes.js"></script>
    <script src="js/script.js"></script>
  </body>
</html>
```

---

### **FASE 8: API CALLS EN FRONTEND (1 hora)**

**frontend/js/api.js** (funciones HTTP reutilizables)

```javascript
const API_URL = "http://localhost:8000";

async function apiFetch(
  endpoint,
  method = "GET",
  body = null,
  requireAuth = true
) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (requireAuth) {
    const token = localStorage.getItem("token");
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${API_URL}${endpoint}`, options);
  return response.json();
}

// USUARIOS
async function obtenerUsuarios() {
  return apiFetch("/usuarios");
}

async function crearUsuario(data) {
  return apiFetch("/usuarios", "POST", data);
}

// INCIDENCIAS
async function obtenerIncidencias() {
  return apiFetch("/incidencias");
}

async function crearIncidencia(data) {
  return apiFetch("/incidencias", "POST", data);
}

// TRABAJADORES
async function buscarTrabajadorPorDni(dni) {
  return apiFetch(`/trabajadores/buscar/${dni}`);
}
```

---

### **FASE 9: INICIALIZACIÓN DE BD (30 minutos)**

**backend/init_db.py** (Script crítico)

```python
from database import engine, Base, SessionLocal
from models.usuario import Usuario
from models.incidencia import Incidencia
from models.trabajador import Trabajador
from auth import hash_password
import json

# 1. Crear todas las tablas
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# 2. Crear usuario admin
admin = Usuario(
    nombre="Admin",
    email="admin@central.com",
    contraseña_hash=hash_password("admin123"),
    rol="administrador",
    area="Administración"
)
db.add(admin)

# 3. Insertar trabajadores de prueba
trabajadores_data = [
    {"dni": "12345678", "nombre": "Juan", "apellido": "Pérez", "zona": "Centro"},
    {"dni": "87654321", "nombre": "María", "apellido": "López", "zona": "Norte"},
    # ... más trabajadores
]

for t in trabajadores_data:
    db.add(Trabajador(**t))

db.commit()
print("✅ BD inicializada correctamente")
```

---

### **FASE 10: APP PRINCIPAL (1 hora)**

**backend/app.py**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, usuarios, incidencias, trabajadores

app = FastAPI(title="Central de Atención")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(incidencias.router)
app.include_router(trabajadores.router)

@app.get("/")
async def root():
    return {"message": "API funcionando"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## 📅 TIMELINE IDEAL: Desde 0 a Producción

```
Día 1 (8 horas):
├─ Mañana (4h):
│  ├─ Fase 1: Definición (1h)
│  ├─ Fase 2: Estructura (1h)
│  └─ Fase 3: Modelos (2h)
└─ Tarde (4h):
   ├─ Fase 4: Schemas (1h)
   ├─ Fase 5: Auth (2h)
   └─ Fase 6: Endpoints básicos (1h)

Día 2 (8 horas):
├─ Mañana (4h):
│  ├─ Fase 7: Frontend HTML (1h)
│  ├─ Fase 8: API calls (1.5h)
│  └─ Testing básico (1.5h)
└─ Tarde (4h):
   ├─ Fase 9: Init DB (1h)
   ├─ Fase 10: App main (1h)
   └─ Testing end-to-end (2h)

Día 3 (8 horas):
├─ Features avanzadas:
│  ├─ Formulario jerárquico (3h)
│  ├─ Autocomplete (2h)
│  ├─ Reportes/Filtrado (2h)
│  └─ Validación exclusiva préstamo (1h)
```

**TOTAL: 3 días de desarrollo**

---

## 🎯 DECISIONES ARQUITECTÓNICAS CLAVE

### ¿Por qué Vanilla JS y no Framework?

```
✅ VENTAJAS:
- Control total del código
- Sin dependencias externas
- Bundle pequeño (0kb overhead)
- Fácil de entender para maintener
- Perfecto para equipos pequeños

❌ DESVENTAJAS:
- Más código boilerplate
- Hay que hacer cosas que React hace automático
- Para proyectos grandes, React es mejor

RECOMENDACIÓN:
Para tu proyecto (Central de Atención) → Vanilla JS es perfecto
Para proyectos >500 líneas JS o múltiples vistas → React/Vue
```

### ¿Por qué SQLite y no PostgreSQL?

```
SQLite:
✅ Cero configuración
✅ Un archivo = fácil backup
✅ Suficiente para <100k registros
✅ Ideal para desarrollo
❌ Una conexión a la vez (no ideal para muchos usuarios)

PostgreSQL:
✅ Múltiples conexiones
✅ Escalable
✅ Para producción grande
❌ Requiere servidor externo
❌ Más complejo de setup

RECOMENDACIÓN:
Desarrollo: SQLite ✅ (tu caso actual)
Producción >1M registros: Migrar a PostgreSQL
Actual: Mantén SQLite, es suficiente
```

### ¿Por qué no FK entre Incidencia y Trabajador?

```
OPCIÓN A: Con FK (lo que NO hiciste):
Incidencia.trabajador_id → Trabajador.id
PROBLEMA: Si borras un trabajador, ¿qué pasa con sus incidencias?

OPCIÓN B: Sin FK, dni como String (lo que SÍ hiciste):
Incidencia.dni = "12345678"
Trabajador.dni = "12345678"
VENTAJA: Máxima flexibilidad
- Incidencias existen aunque se borre trabajador
- Puedes cambiar datos del trabajador sin afectar histórico
- Más realista para datos históricos

RECOMENDACIÓN:
Tu enfoque (sin FK) es correcto ✅
Trabajador es solo para búsqueda/autocomplete
Incidencias son históricas (nunca cambian)
```

---

## 📊 COMPARACIÓN: TU PROYECTO vs DESDE 0

### Cosas que ya tienes ✅

```
✅ Autenticación JWT completa
✅ Roles (admin/gestor)
✅ CRUD usuarios, incidencias, trabajadores
✅ Formulario jerárquico dinámico
✅ Autocomplete con debounce
✅ Reportes con filtrado
✅ Validación exclusiva (préstamo)
✅ Script inicialización BD
✅ Documentación
✅ Listo para producción
```

### Cosas pendientes 📋

```
📋 Dashboards/Analytics
📋 Tests unitarios (backend)
📋 Tests end-to-end (frontend)
📋 CI/CD (GitHub Actions)
📋 Logs y monitoreo
📋 Validación backend (que préstamo sea exclusivo)
```

---

## 🚀 SI EMPEZARAS AHORA (Cambios que haría)

```
1. Agregar Tests desde el inicio
   - Backend: pytest
   - Frontend: Jest

2. Validaciones más estrictas
   - Backend valida "préstamo exclusivo"
   - Frontend solo complementa

3. Logging profesional
   - Logger en cada endpoint
   - Error tracking (Sentry)

4. API documentation
   - Swagger/OpenAPI (FastAPI tiene incluido)
   - Ejemplos en cada endpoint

5. Database migrations (Alembic)
   - Para cambios de schema en el futuro

6. Separar concerns mejor
   - business_logic.py para lógica principal
   - utils.py para funciones auxiliares

7. Environment variables desde el inicio
   - .env nunca en git
   - Diferentes configs por ambiente
```

---

## 🎓 ORDEN RECOMENDADO PARA APRENDER ESTO

Si quieres dominar esta arquitectura:

```
1. SQL básico + SQLAlchemy ORM (1 semana)
2. FastAPI + Routers (1 semana)
3. Autenticación JWT (3 días)
4. Frontend Vanilla JS (1 semana)
5. Testing (pytest + jest) (1 semana)
6. Deployment (VPS + Docker) (1 semana)
7. Escalabilidad (caching, indices, etc) (2 semanas)

TOTAL: ~2 meses para dominar completamente
```

---

## ✅ CHECKLIST: Proyecto Listo para Producción

```
BACKEND:
✅ Autenticación
✅ Autorización (roles)
✅ Validación Pydantic
✅ Error handling
✅ CORS configurado
✅ Base de datos inicializada
⚠️  Tests unitarios (0%)
⚠️  Logging profesional
⚠️  Validación "préstamo exclusivo" en backend

FRONTEND:
✅ Login funcional
✅ Forms dinámicos
✅ Autocomplete
✅ Reportes
✅ Token refresh
⚠️  Tests end-to-end (0%)
⚠️  Manejo errores robusto

INFRAESTRUCTURA:
✅ Documentación
✅ Script start
⚠️  Nginx configurado
⚠️  SSL/HTTPS
⚠️  Backups automáticos
⚠️  Monitoreo

DEPLOYMENT:
✅ Estructura lista
📋 VPS con instrucciones
⚠️  CI/CD
⚠️  Docker
```

---

## 🎯 TU SIGUIENTE PASO

**Opciones:**

1. **Agregar Dashboards** (3-4 horas)

   - Endpoints de estadísticas
   - Frontend con Chart.js
   - Filtros por fecha, estado, usuario

2. **Agregar Tests** (8-10 horas)

   - Backend: pytest + fixtures
   - Frontend: Jest + testing-library
   - Coverage > 80%

3. **Optimizar para Producción** (4 horas)

   - Validación backend (préstamo exclusivo)
   - Rate limiting
   - Indices en BD
   - Compresión assets frontend

4. **Ir directo a Despliegue** (2 horas)
   - VPS + Ubuntu
   - PM2 o systemd
   - Nginx proxy
   - SSL certificado

**Mi recomendación:** Dashboards → Tests → Despliegue

¿Cuál quieres que exploremos primero? 🚀
