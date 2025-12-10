from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
import os
import sys

# Agregar backend al path para importes correctos
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.database import conectar_db
from backend.routes import usuarios, incidencias, auth, trabajadores, asignados, reporte_dashboards, documentos
from backend.models.usuario import Usuario
from backend.models.incidencia import Incidencia
from backend.models.trabajador import Trabajador
from backend.models.asignado import Asignado
from backend.models.reporte_dashboard import ReporteDashboard
from backend.models.documento import Documento
from backend.minio_config import inicializar_bucket

# Conectar a MongoDB (se hace automáticamente en database.py)
# ya no necesitamos create_all para MongoDB

# Inicializar bucket de MinIO
inicializar_bucket()

app = FastAPI(title="Central de Atención")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rutas de API
app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(trabajadores.router)
app.include_router(incidencias.router)
app.include_router(asignados.router)
app.include_router(reporte_dashboards.router)
app.include_router(documentos.router)

# Servir archivos estáticos del frontend
# Esto debe ir DESPUÉS de incluir los routers de API
frontend_path = Path(__file__).parent.parent / "frontend"

# Ruta para archivos estáticos (js, css, etc)
app.mount("/js", StaticFiles(directory=str(frontend_path / "js"), html=False), name="js")

# Servir archivos CSS y otros estáticos desde raíz del frontend
@app.get("/style.css")
async def style_css():
    return FileResponse(str(frontend_path / "style.css"))

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

