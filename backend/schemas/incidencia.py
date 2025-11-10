from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class IncidenciaBase(BaseModel):
    titulo: str
    descripcion: str
    estado: str = "abierta"
    usuario_id: int

class IncidenciaCreate(IncidenciaBase):
    pass

class IncidenciaUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    estado: Optional[str] = None

class IncidenciaResponse(IncidenciaBase):
    id: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    
    class Config:
        from_attributes = True
