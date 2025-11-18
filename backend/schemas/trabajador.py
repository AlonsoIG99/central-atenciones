from pydantic import BaseModel
from typing import Optional

class TrabajadorBase(BaseModel):
    dni: str
    nombre_completo: str
    fecha_ingreso: Optional[str] = None
    fecha_cese: Optional[str] = None

class TrabajadorCreate(TrabajadorBase):
    pass

class TrabajadorUpdate(BaseModel):
    nombre_completo: Optional[str] = None
    fecha_ingreso: Optional[str] = None
    fecha_cese: Optional[str] = None

class TrabajadorResponse(TrabajadorBase):
    id: int
    
    class Config:
        from_attributes = True
