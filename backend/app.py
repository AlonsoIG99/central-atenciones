from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import os
import sys

# Agregar backend al path para importes correctos
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.database import conectar_db
from backend.routes import usuarios, incidencias, auth, trabajadores, asignados
from backend.models.usuario import Usuario
from backend.models.incidencia import Incidencia
from backend.models.trabajador import Trabajador
from backend.models.asignado import Asignado

# Conectar a MongoDB (se hace automáticamente en database.py)
# ya no necesitamos create_all para MongoDB

app = FastAPI(title="Central de Atención")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rutas
app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(trabajadores.router)
app.include_router(incidencias.router)
app.include_router(asignados.router)

@app.get("/")
def root():
    return {"mensaje": "Bienvenido a la API de Central de Atención"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

