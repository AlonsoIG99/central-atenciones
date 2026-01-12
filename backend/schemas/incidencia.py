from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class IncidenciaBase(BaseModel):
    dni: str  # DNI del trabajador
    nombre_trabajador: Optional[str] = None  # Nombre del trabajador
    titulo: str
    descripcion: str
    comentario: Optional[str] = None
    canal: str = "llamada_telefonica"
    estado: str = "abierta"
    usuario_id: Optional[str] = None
    consultas: Optional[List[str]] = []  # Lista de consultas específicas (hojas finales)

class IncidenciaCreate(IncidenciaBase):
    pass

class IncidenciaUpdate(BaseModel):
    dni: Optional[str] = None
    nombre_trabajador: Optional[str] = None
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    comentario: Optional[str] = None
    canal: Optional[str] = None
    estado: Optional[str] = None

class IncidenciaResponse(IncidenciaBase):
    id: str  # MongoDB ObjectId como string
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    fecha_cierre: Optional[datetime] = None
    dias_abierta: Optional[str] = None
    usuario_nombre: Optional[str] = "Desconocido"
    canal: Optional[str] = "llamada_telefonica"
    
    class Config:
        from_attributes = True

