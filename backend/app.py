from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.openapi.docs import get_swagger_ui_html
from starlette.middleware.base import BaseHTTPMiddleware
from pathlib import Path
import os
import sys
from datetime import datetime, timedelta
from collections import defaultdict

# Agregar backend al path para importes correctos
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.database import conectar_db
from backend.routes import usuarios, incidencias, auth, trabajadores, asignados, reporte_dashboards, documentos, cultura, visitas_dashboard
from backend.models.usuario import Usuario
from backend.models.incidencia import Incidencia
from backend.models.trabajador import Trabajador
from backend.models.asignado import Asignado
from backend.models.reporte_dashboard import ReporteDashboard
from backend.models.documento import Documento
from backend.models.cliente import Cliente
from backend.models.unidad import Unidad
from backend.models.lider import Lider
from backend.models.visita import Visita
from backend.models.atencion_cultura import AtencionCultura
from backend.minio_config import inicializar_bucket

# Conectar a MongoDB (se hace automáticamente en database.py)
# ya no necesitamos create_all para MongoDB

# Inicializar bucket de MinIO
inicializar_bucket()

# Crear app sin Swagger público
ENV = os.getenv("ENV", "development")
app = FastAPI(
    title="Central de Atención",
    docs_url=None,  # Deshabilitar /docs público
    redoc_url=None  # Deshabilitar /redoc público
)

# Rate Limiter simple personalizado
class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_requests: int = 5, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = defaultdict(list)
    
    async def dispatch(self, request: Request, call_next):
        # Solo aplicar rate limit a /auth/login y solo POST
        if request.url.path == "/auth/login" and request.method == "POST":
            client_ip = request.client.host
            now = datetime.now()
            
            # Limpiar requests antiguos
            self.requests[client_ip] = [
                req_time for req_time in self.requests[client_ip]
                if now - req_time < timedelta(seconds=self.window_seconds)
            ]
            
            # Verificar límite
            if len(self.requests[client_ip]) >= self.max_requests:
                raise HTTPException(
                    status_code=429,
                    detail="Demasiados intentos de login. Intenta nuevamente en un minuto."
                )
            
            # Registrar request
            self.requests[client_ip].append(now)
        
        response = await call_next(request)
        return response

# Configurar CORS (específicos por seguridad) - PRIMERO
if ENV == "production":
    origins = [
        "https://atencion.liderman.net.pe",
        "https://attention.liderman.net.pe",
    ]
else:
    # Desarrollo: especificar orígenes explícitos (NO usar "*")
    origins = [
        "http://localhost:3000",
        "http://localhost:5500",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5500",
        "http://127.0.0.1:8000"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Agregar rate limiting - DESPUÉS de CORS
app.add_middleware(RateLimitMiddleware, max_requests=5, window_seconds=60)

# Middleware de headers de seguridad
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        if ENV == "production":
            response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        return response

app.add_middleware(SecurityHeadersMiddleware)

# Trusted Host Middleware en producción
if ENV == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["atencion.liderman.net.pe", "attention.liderman.net.pe"]
    )

# Incluir rutas de API
app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(trabajadores.router)
app.include_router(incidencias.router)
app.include_router(asignados.router)
app.include_router(reporte_dashboards.router)
app.include_router(documentos.router)
app.include_router(cultura.router)
app.include_router(visitas_dashboard.router)

# Swagger protegido - solo accesible con token válido
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html(request: Request):
    # Verificar token en header o cookie
    token = request.headers.get("Authorization") or request.cookies.get("token")
    
    if not token:
        raise HTTPException(status_code=401, detail="No autorizado. Inicia sesión primero.")
    
    # Verificar que el token sea válido
    try:
        from backend.auth import verificar_token
        token_limpio = token.replace("Bearer ", "") if token.startswith("Bearer ") else token
        usuario = verificar_token(token_limpio)
        
        # Solo administradores pueden ver Swagger
        if usuario.get("rol") != "administrador":
            raise HTTPException(status_code=403, detail="Solo administradores pueden acceder a la documentación")
            
    except Exception as e:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    
    return get_swagger_ui_html(
        openapi_url="/openapi.json",
        title=app.title + " - Documentación",
    )

@app.get("/openapi.json", include_in_schema=False)
async def get_open_api_endpoint(request: Request):
    # Proteger también el endpoint de OpenAPI
    token = request.headers.get("Authorization") or request.cookies.get("token")
    
    if not token:
        raise HTTPException(status_code=401, detail="No autorizado")
    
    try:
        from backend.auth import verificar_token
        token_limpio = token.replace("Bearer ", "") if token.startswith("Bearer ") else token
        usuario = verificar_token(token_limpio)
        
        if usuario.get("rol") != "administrador":
            raise HTTPException(status_code=403, detail="Acceso denegado")
            
    except Exception as e:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    return app.openapi()

# Servir archivos estáticos del frontend (solo en desarrollo)
# En producción, Nginx u otro servidor web debe servir el frontend
if ENV == "development":
    # Esto debe ir DESPUÉS de incluir los routers de API
    frontend_path = Path(__file__).parent.parent / "frontend"

    # Ruta para archivos estáticos (js, css, etc)
    app.mount("/js", StaticFiles(directory=str(frontend_path / "js"), html=False), name="js")

    # Servir archivos CSS y otros estáticos desde raíz del frontend
    @app.get("/style.css")
    async def style_css():
        return FileResponse(str(frontend_path / "style.css"))

    @app.get("/script.js")
    async def script_js():
        return FileResponse(str(frontend_path / "script.js"))
    
    @app.get("/favicon.svg")
    async def favicon():
        return FileResponse(str(frontend_path / "favicon.svg"), media_type="image/svg+xml")

    # Rutas para archivos HTML
    @app.get("/")
    async def root():
        return FileResponse(str(frontend_path / "login.html"))

    @app.get("/login.html")
    async def login():
        return FileResponse(str(frontend_path / "login.html"))

    @app.get("/index.html")
    async def index():
        return FileResponse(str(frontend_path / "index.html"))

    @app.get("/dashboard.html")
    async def dashboard():
        return FileResponse(str(frontend_path / "dashboard.html"))

    @app.get("/dashboard-slides.html")
    async def dashboard_slides():
        return FileResponse(str(frontend_path / "dashboard-slides.html"))

    @app.get("/dashboard-visitas.html")
    async def dashboard_visitas():
        return FileResponse(str(frontend_path / "dashboard-visitas.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

