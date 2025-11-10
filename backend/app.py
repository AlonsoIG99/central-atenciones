from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import usuarios, incidencias
from models.usuario import Usuario
from models.incidencia import Incidencia

# Crear las tablas
Base.metadata.create_all(bind=engine)

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
app.include_router(usuarios.router)
app.include_router(incidencias.router)

@app.get("/")
def root():
    return {"mensaje": "Bienvenido a la API de Central de Atención"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
