from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class IncidenciaBase(BaseModel):
    dni: str  # DNI del trabajador
    titulo: str
    descripcion: str
    estado: str = "abierta"
    usuario_id: Optional[str] = None

class IncidenciaCreate(IncidenciaBase):
    pass

class IncidenciaUpdate(BaseModel):
    dni: Optional[str] = None
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    estado: Optional[str] = None

class IncidenciaResponse(IncidenciaBase):
    id: str  # MongoDB ObjectId como string
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    usuario_nombre: Optional[str] = "Desconocido"
    
    class Config:
        from_attributes = True

