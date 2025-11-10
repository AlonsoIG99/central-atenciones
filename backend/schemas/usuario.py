from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UsuarioBase(BaseModel):
    nombre: str
    email: str
    contraseña: str

class UsuarioCreate(UsuarioBase):
    pass

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[str] = None
    contraseña: Optional[str] = None

class UsuarioResponse(UsuarioBase):
    id: int
    fecha_creacion: datetime
    
    class Config:
        from_attributes = True
