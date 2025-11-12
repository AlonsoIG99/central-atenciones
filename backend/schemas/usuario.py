from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UsuarioBase(BaseModel):
    nombre: str
    email: str
    contraseña: str
    rol: str = "gestor"  # "administrador" o "gestor"
    area: str

class UsuarioCreate(UsuarioBase):
    pass

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[str] = None
    contraseña: Optional[str] = None
    rol: Optional[str] = None
    area: Optional[str] = None

class UsuarioResponse(UsuarioBase):
    id: int
    fecha_creacion: datetime
    
    class Config:
        from_attributes = True
