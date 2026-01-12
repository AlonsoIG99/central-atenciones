# 🔐 AUDITORÍA DE CIBERSEGURIDAD - PROYECTO CENTRAL DE ATENCIÓN

**Fecha:** 9 de Enero de 2026  
**Plataforma:** Sistema Central de Atención (FastAPI + MongoDB + JavaScript)  
**Alcance:** Backend, Frontend, Infraestructura y Configuración

---

## 📊 RESUMEN EJECUTIVO

| Categoría        | Críticas | Altas | Medias | Bajas | Total |
| ---------------- | -------- | ----- | ------ | ----- | ----- |
| Vulnerabilidades | 5        | 4     | 6      | 3     | 18    |

**Estado General:** ⚠️ **REQUIERE ATENCIÓN INMEDIATA**

---

## 🔴 VULNERABILIDADES CRÍTICAS (Prioridad P0)

### 1. CREDENCIALES HARDCODEADAS EN CÓDIGO FUENTE

**Archivo:** `backend/auth.py` (Línea 11)  
**Severidad:** 🔴 CRÍTICA  
**CWE:** CWE-798 (Use of Hard-coded Credentials)

```python
SECRET_KEY = "tu-clave-secreta-muy-segura-cambiar-en-produccion"
```

**Riesgo:**

- La clave secreta para firmar JWT está hardcodeada en el código
- Si el código es comprometido, todos los tokens pueden ser falsificados
- Permite suplantación de identidad total del sistema

**Impacto:** CRÍTICO - Compromiso total del sistema de autenticación

**Remediación:**

```python
# backend/auth.py
import os
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("JWT_SECRET_KEY no configurada en variables de entorno")

# backend/.env
JWT_SECRET_KEY=<generar con: python -c "import secrets; print(secrets.token_urlsafe(32))">
```

---

### 2. CREDENCIALES DE BASE DE DATOS EXPUESTAS EN CÓDIGO

**Archivo:** `backend/database.py` (Líneas 6-9)  
**Severidad:** 🔴 CRÍTICA  
**CWE:** CWE-798

```python
MONGODB_USER = os.getenv("MONGODB_USER", "root")
MONGODB_PASSWORD = os.getenv("MONGODB_PASSWORD", "Jdg27aCQqOzR")
```

**Riesgo:**

- Contraseña de MongoDB hardcodeada como valor por defecto
- Acceso root a toda la base de datos si .env no está presente
- Credenciales visibles en repositorio Git

**Impacto:** CRÍTICO - Acceso completo a base de datos

**Remediación:**

```python
# Eliminar valores por defecto y hacer obligatorios
MONGODB_USER = os.getenv("MONGODB_USER")
MONGODB_PASSWORD = os.getenv("MONGODB_PASSWORD")

if not MONGODB_USER or not MONGODB_PASSWORD:
    raise ValueError("Credenciales de MongoDB no configuradas")
```

---

### 3. CREDENCIALES DE MINIO EXPUESTAS

**Archivo:** `backend/.env` (Líneas 6-7) y `backend/minio_config.py` (Líneas 8-9)  
**Severidad:** 🔴 CRÍTICA  
**CWE:** CWE-798

```dotenv
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=wZ8pDqV2sX9m
```

**Riesgo:**

- Archivo .env con credenciales reales en repositorio
- Credenciales hardcodeadas como defaults en código
- Acceso completo al almacenamiento de objetos (documentos sensibles)

**Impacto:** CRÍTICO - Acceso a documentos confidenciales de trabajadores

**Remediación:**

1. Rotar credenciales inmediatamente
2. Eliminar .env del repositorio: `git rm --cached backend/.env`
3. Verificar que .env esté en .gitignore (✅ ya está)
4. Eliminar defaults de código:

```python
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY")
if not MINIO_ACCESS_KEY or not MINIO_SECRET_KEY:
    raise ValueError("Credenciales MinIO no configuradas")
```

---

### 4. ALGORITMO DE HASH DÉBIL PARA CONTRASEÑAS

**Archivo:** `backend/auth.py` (Líneas 30-57)  
**Severidad:** 🔴 CRÍTICA  
**CWE:** CWE-327 (Use of Broken or Risky Cryptographic Algorithm)

```python
def obtener_hash_contraseña(contraseña: str) -> str:
    salt = os.urandom(32)
    hash_obj = hashlib.sha256(salt + contraseña.encode('utf-8'))
    return f"{salt.hex()}${hash_obj.hexdigest()}"
```

**Riesgo:**

- SHA256 NO es seguro para contraseñas (es demasiado rápido)
- Vulnerable a ataques de fuerza bruta con GPUs/ASICs
- No cumple con estándares OWASP para almacenamiento de contraseñas

**Impacto:** CRÍTICO - Contraseñas pueden ser crackeadas

**Remediación:**

```python
# Usar bcrypt (industria estándar)
import bcrypt

def obtener_hash_contraseña(contraseña: str) -> str:
    salt = bcrypt.gensalt(rounds=12)  # Factor de trabajo 12
    return bcrypt.hashpw(contraseña.encode('utf-8'), salt).decode('utf-8')

def verificar_contraseña(contraseña_plana: str, hash_almacenado: str) -> bool:
    try:
        return bcrypt.checkpw(
            contraseña_plana.encode('utf-8'),
            hash_almacenado.encode('utf-8')
        )
    except Exception:
        return False

# requirements.txt
# Agregar: bcrypt==4.1.2
```

---

### 5. CONTRASEÑAS HASHEADAS EXPUESTAS EN API

**Archivo:** `backend/routes/usuarios.py` (Líneas 9-22)  
**Severidad:** 🔴 CRÍTICA  
**CWE:** CWE-200 (Exposure of Sensitive Information)

```python
@router.get("/", response_model=list[UsuarioResponse])
def obtener_usuarios():
    return [
        {
            "contraseña": u.contraseña,  # ⚠️ EXPONE HASH
            ...
        }
        for u in usuarios
    ]
```

**Riesgo:**

- Hashes de contraseñas accesibles vía API
- Facilita ataques offline de fuerza bruta
- Violación de privacidad y buenas prácticas

**Impacto:** CRÍTICO - Exposición de credenciales

**Remediación:**

```python
# backend/schemas/usuario.py
class UsuarioResponse(BaseModel):
    id: str
    dni: str
    nombre: str
    email: str
    # ELIMINAR: contraseña
    rol: str
    area: str
    fecha_creacion: datetime

# Actualizar TODAS las funciones en routes/usuarios.py
# para NO incluir el campo contraseña en las respuestas
```

---

## 🟠 VULNERABILIDADES ALTAS (Prioridad P1)

### 6. FALTA DE RATE LIMITING EN LOGIN

**Archivo:** `backend/routes/auth.py` (Línea 26)  
**Severidad:** 🟠 ALTA  
**CWE:** CWE-307 (Improper Restriction of Excessive Authentication Attempts)

**Riesgo:**

- No hay límite de intentos de login
- Vulnerable a ataques de fuerza bruta
- Permite credential stuffing

**Impacto:** ALTO - Compromiso de cuentas

**Remediación:**

```python
# Instalar: pip install slowapi
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@router.post("/login")
@limiter.limit("5/minute")  # Máximo 5 intentos por minuto
def login(request: Request, credenciales: LoginRequest):
    ...
```

---

### 7. CORS DEMASIADO PERMISIVO EN DESARROLLO

**Archivo:** `backend/app.py` (Líneas 51-53)  
**Severidad:** 🟠 ALTA  
**CWE:** CWE-942 (Overly Permissive Cross-domain Whitelist)

```python
else:
    origins = ["*"]  # ⚠️ Permite CUALQUIER origen
```

**Riesgo:**

- En desarrollo permite peticiones desde cualquier origen
- Riesgo de CSRF y robo de datos en ambiente compartido
- Mala práctica que puede llegar a producción

**Impacto:** ALTO - Cross-Site Request Forgery (CSRF)

**Remediación:**

```python
if ENV == "production":
    origins = [
        "https://atencion.liderman.net.pe",
        "https://attention.liderman.net.pe",
    ]
else:
    # Desarrollo: especificar orígenes explícitos
    origins = [
        "http://localhost:3000",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://127.0.0.1:8000"
    ]
```

---

### 8. NO HAY VALIDACIÓN DE ENTRADA EN ENDPOINTS

**Archivos:** Múltiples rutas  
**Severidad:** 🟠 ALTA  
**CWE:** CWE-20 (Improper Input Validation)

**Riesgo:**

- No hay sanitización de inputs del usuario
- Vulnerable a NoSQL Injection
- Sin validación de tamaños de archivo

**Ejemplos:**

```python
# backend/routes/incidencias.py - Sin validación de longitud
def crear_atencion(atencion: IncidenciaCreate):
    # ¿Qué pasa si descripcion tiene 10MB de texto?
    # ¿Validamos caracteres especiales?
```

**Impacto:** ALTO - Inyección NoSQL, DoS

**Remediación:**

```python
# backend/schemas/incidencia.py
from pydantic import BaseModel, Field, validator
import re

class IncidenciaCreate(BaseModel):
    dni: str = Field(..., min_length=8, max_length=8, regex=r'^\d{8}$')
    titulo: str = Field(..., max_length=200)
    descripcion: str = Field(..., max_length=5000)

    @validator('titulo', 'descripcion')
    def sanitize_text(cls, v):
        # Remover caracteres peligrosos
        return re.sub(r'[<>]', '', v)
```

---

### 9. TOKENS JWT NO TIENEN BLACKLIST

**Archivo:** `backend/auth.py`  
**Severidad:** 🟠 ALTA  
**CWE:** CWE-613 (Insufficient Session Expiration)

**Riesgo:**

- Tokens JWT siguen siendo válidos después del logout
- No se pueden revocar tokens comprometidos
- Usuario eliminado puede seguir accediendo

**Impacto:** ALTO - Sesiones no revocables

**Remediación:**

```python
# Crear modelo de Token Blacklist
from mongoengine import Document, StringField, DateTimeField

class TokenBlacklist(Document):
    jti = StringField(required=True, unique=True)  # JWT ID
    expires_at = DateTimeField(required=True)

    meta = {'collection': 'token_blacklist'}

# Modificar crear_token_acceso para incluir JTI
import uuid

def crear_token_acceso(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    jti = str(uuid.uuid4())
    to_encode.update({
        "exp": expire,
        "jti": jti  # Agregar identificador único
    })
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Verificar contra blacklist
def verificar_token(token: str) -> Optional[TokenData]:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    jti = payload.get("jti")

    # Verificar si está en blacklist
    if TokenBlacklist.objects(jti=jti).first():
        return None

    # ... resto de validación
```

---

## 🟡 VULNERABILIDADES MEDIAS (Prioridad P2)

### 10. FALTA DE HTTPS ENFORCEMENT

**Archivo:** `backend/app.py`  
**Severidad:** 🟡 MEDIA  
**CWE:** CWE-319 (Cleartext Transmission of Sensitive Information)

**Remediación:**

```python
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

if ENV == "production":
    app.add_middleware(HTTPSRedirectMiddleware)
```

---

### 11. NO HAY LOGGING DE EVENTOS DE SEGURIDAD

**Severidad:** 🟡 MEDIA  
**CWE:** CWE-778 (Insufficient Logging)

**Riesgo:**

- No se registran intentos de login fallidos
- No hay auditoría de acceso a datos sensibles
- Dificulta detección de intrusos

**Remediación:**

```python
import logging

# Configurar logging
logging.basicConfig(
    filename='security.log',
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

security_logger = logging.getLogger('security')

# En login
security_logger.warning(
    f"Login fallido para {credenciales.email} desde {request.client.host}"
)

# En acceso a datos sensibles
security_logger.info(
    f"Usuario {usuario.email} accedió a documento {documento_id}"
)
```

---

### 12. FALTA DE HEADERS DE SEGURIDAD

**Archivo:** `backend/app.py`  
**Severidad:** 🟡 MEDIA  
**CWE:** CWE-1021 (Improper Restriction of Rendered UI Layers)

**Remediación:**

```python
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response.headers['Content-Security-Policy'] = "default-src 'self'"
        return response

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["atencion.liderman.net.pe", "attention.liderman.net.pe"]
)
```

---

### 13. TOKENS EN LOCALSTORAGE (XSS Risk)

**Archivo:** `frontend/js/auth.js` (Líneas 37-43)  
**Severidad:** 🟡 MEDIA  
**CWE:** CWE-79 (Cross-site Scripting)

**Riesgo:**

- Tokens accesibles desde JavaScript
- Vulnerable a robo por XSS
- Mejor usar cookies HttpOnly

**Remediación:**

```python
# Backend: Enviar tokens en cookies HttpOnly
from fastapi.responses import JSONResponse

@router.post("/login")
def login(credenciales: LoginRequest):
    # ... generar tokens ...

    response = JSONResponse(content={
        "user_id": str(usuario.id),
        "nombre": usuario.nombre,
        "rol": usuario.rol
    })

    # Establecer cookies seguras
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,  # No accesible desde JS
        secure=True,    # Solo HTTPS
        samesite="strict",
        max_age=1800    # 30 minutos
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=604800  # 7 días
    )

    return response

# Frontend: Eliminar localStorage, cookies manejadas automáticamente
```

---

### 14. FALTA DE SANITIZACIÓN EN INNERHTML

**Archivo:** `frontend/js/cultura.js` (Múltiples líneas)  
**Severidad:** 🟡 MEDIA  
**CWE:** CWE-79 (XSS)

```javascript
modal.innerHTML = `...${data}...`; // ⚠️ Vulnerable a XSS
```

**Remediación:**

```javascript
// Función de sanitización
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Uso
modal.innerHTML = `<p>${escapeHtml(userData.nombre)}</p>`;

// O mejor: usar textContent cuando sea posible
elemento.textContent = userData.nombre;
```

---

### 15. INFORMACIÓN SENSIBLE EN LOGS

**Archivos:** Varios  
**Severidad:** 🟡 MEDIA  
**CWE:** CWE-532 (Information Exposure Through Log Files)

```python
print(f"ERROR en login: {e}")  # Puede exponer info sensible
```

**Remediación:**

```python
# No loguear contraseñas, tokens, o datos sensibles
import logging
logger = logging.getLogger(__name__)

try:
    # código
except Exception as e:
    logger.error(f"Error en login para usuario {usuario.id}", exc_info=False)
    # exc_info=True solo en desarrollo
```

---

## ⚪ VULNERABILIDADES BAJAS (Prioridad P3)

### 16. FALTA DE VALIDACIÓN DE TIPOS DE ARCHIVO

**Archivo:** `backend/routes/documentos.py`  
**Severidad:** ⚪ BAJA  
**CWE:** CWE-434 (Unrestricted Upload of File with Dangerous Type)

**Remediación:**

```python
ALLOWED_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png', '.docx'}
ALLOWED_MIME_TYPES = {
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
}

import magic

def validar_archivo(file):
    # Validar extensión
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, "Tipo de archivo no permitido")

    # Validar MIME type real (no confiar en extensión)
    mime = magic.from_buffer(file.file.read(1024), mime=True)
    file.file.seek(0)

    if mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(400, "Contenido de archivo no válido")

    # Validar tamaño (10MB max)
    if file.size > 10 * 1024 * 1024:
        raise HTTPException(400, "Archivo demasiado grande")
```

---

### 17. NO HAY TIMEOUT EN CONEXIONES A BD

**Archivo:** `backend/database.py`  
**Severidad:** ⚪ BAJA  
**CWE:** CWE-400 (Uncontrolled Resource Consumption)

**Remediación:**

```python
connect(
    db=MONGODB_DB,
    host=MONGODB_HOST,
    port=MONGODB_PORT,
    username=MONGODB_USER,
    password=MONGODB_PASSWORD,
    authSource="admin",
    serverSelectionTimeoutMS=5000,  # 5 segundos
    connectTimeoutMS=10000,         # 10 segundos
    socketTimeoutMS=30000,          # 30 segundos
    maxPoolSize=50,
    minPoolSize=10
)
```

---

### 18. FALTA DE VERSIONADO DE API

**Archivo:** `backend/app.py`  
**Severidad:** ⚪ BAJA

**Remediación:**

```python
# Versionar rutas
app.include_router(auth.router, prefix="/api/v1")
app.include_router(usuarios.router, prefix="/api/v1")
# ...
```

---

## 📋 PLAN DE ACCIÓN RECOMENDADO

### Fase 1 - INMEDIATO (Esta semana)

1. ✅ Rotar TODAS las credenciales expuestas (MongoDB, MinIO, JWT Secret)
2. ✅ Eliminar credenciales hardcodeadas del código
3. ✅ Implementar bcrypt para contraseñas
4. ✅ Eliminar exposición de hashes en API
5. ✅ Agregar .env a .gitignore (verificar)
6. ✅ Limpiar historial de Git de credenciales expuestas

### Fase 2 - ESTA SEMANA (Próximos 7 días)

1. ⏳ Implementar rate limiting en login
2. ⏳ Agregar headers de seguridad
3. ⏳ Implementar token blacklist
4. ⏳ Configurar CORS específicos en desarrollo
5. ⏳ Agregar logging de seguridad

### Fase 3 - PRÓXIMAS 2 SEMANAS

1. ⏳ Migrar tokens a cookies HttpOnly
2. ⏳ Implementar validación robusta de inputs
3. ⏳ Sanitizar uso de innerHTML
4. ⏳ Agregar validación de archivos subidos
5. ⏳ Implementar HTTPS enforcement

### Fase 4 - MEJORAS CONTINUAS

1. ⏳ Implementar 2FA (autenticación de dos factores)
2. ⏳ Auditorías de seguridad periódicas
3. ⏳ Penetration testing
4. ⏳ Formación de equipo en OWASP Top 10

---

## 🛠️ COMANDOS ÚTILES PARA REMEDIACIÓN

### Rotar credenciales

```bash
# Generar nueva JWT secret
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Generar nueva contraseña MongoDB
python -c "import secrets, string; chars=string.ascii_letters+string.digits; print(''.join(secrets.choice(chars) for i in range(24)))"
```

### Limpiar historial Git de credenciales

```bash
# Instalar BFG Repo Cleaner
git clone --mirror https://...
java -jar bfg.jar --replace-text passwords.txt repo.git
cd repo.git
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push
```

### Instalar dependencias de seguridad

```bash
pip install bcrypt==4.1.2
pip install slowapi==0.1.9
pip install python-multipart==0.0.6
pip install python-magic==0.4.27
```

---

## 📚 REFERENCIAS Y RECURSOS

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [FastAPI Security Best Practices](https://fastapi.tiangolo.com/tutorial/security/)
- [MongoDB Security Checklist](https://www.mongodb.com/docs/manual/administration/security-checklist/)
- [CWE Top 25](https://cwe.mitre.org/top25/archive/2023/2023_top25_list.html)

---

## ✅ CHECKLIST DE SEGURIDAD GENERAL

- [ ] Todas las credenciales en variables de entorno
- [ ] Contraseñas hasheadas con bcrypt (factor ≥12)
- [ ] Rate limiting en endpoints críticos
- [ ] HTTPS enforcement en producción
- [ ] CORS configurado restrictivamente
- [ ] Headers de seguridad implementados
- [ ] Tokens en cookies HttpOnly
- [ ] JWT con blacklist
- [ ] Validación de inputs robusta
- [ ] Sanitización de outputs (XSS)
- [ ] Logging de eventos de seguridad
- [ ] Validación de tipos de archivo
- [ ] Timeouts en conexiones
- [ ] API versionada
- [ ] Dependencias actualizadas
- [ ] .env en .gitignore
- [ ] Documentación de seguridad

---

**Auditor:** GitHub Copilot  
**Metodología:** Análisis estático de código + OWASP Top 10 + CWE Top 25  
**Próxima revisión:** Después de implementar Fase 1 y 2
