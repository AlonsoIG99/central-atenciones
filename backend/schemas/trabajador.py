from pydantic import BaseModel
from typing import Optional

class TrabajadorBase(BaseModel):
    dni: str
    nombre: str
    apellido: str
    zona: str

class TrabajadorCreate(TrabajadorBase):
    pass

class TrabajadorUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    zona: Optional[str] = None

class TrabajadorResponse(TrabajadorBase):
    id: int
    
    class Config:
        from_attributes = True
