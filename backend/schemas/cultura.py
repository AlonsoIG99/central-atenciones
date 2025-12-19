from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# ========== CLIENTE ==========
class ClienteBase(BaseModel):
    nombre: str

class ClienteCreate(ClienteBase):
    pass

class ClienteResponse(ClienteBase):
    id: str

    class Config:
        from_attributes = True

# ========== UNIDAD ==========
class UnidadBase(BaseModel):
    nombre: str

class UnidadCreate(UnidadBase):
    pass

class UnidadResponse(UnidadBase):
    id: str

    class Config:
        from_attributes = True

# ========== LIDER ==========
class LiderBase(BaseModel):
    nombre: str

class LiderCreate(LiderBase):
    pass

class LiderResponse(LiderBase):
    id: str

    class Config:
        from_attributes = True

# ========== VISITA ==========
class VisitaBase(BaseModel):
    cliente: str
    fecha_visita: datetime
    unidad: str
    lider_zonal: str
    comentario: Optional[str] = None
    usuario_id: str

class VisitaCreate(VisitaBase):
    pass

class VisitaUpdate(BaseModel):
    cliente: Optional[str] = None
    fecha_visita: Optional[datetime] = None
    unidad: Optional[str] = None
    lider_zonal: Optional[str] = None
    comentario: Optional[str] = None

class VisitaResponse(VisitaBase):
    id: str
    fecha_creacion: datetime

    class Config:
        from_attributes = True

# ========== ATENCION CULTURA ==========
class AtencionCulturaBase(BaseModel):
    visita_id: Optional[str] = None
    dni: str
    nombre_trabajador: Optional[str] = None
    derivacion: str
    comentario: Optional[str] = None
    estado: str = "abierta"
    usuario_id: str

class AtencionCulturaCreate(AtencionCulturaBase):
    pass

class AtencionCulturaUpdate(BaseModel):
    derivacion: Optional[str] = None
    comentario: Optional[str] = None
    estado: Optional[str] = None

class AtencionCulturaResponse(AtencionCulturaBase):
    id: str
    fecha_creacion: datetime
    fecha_cierre: Optional[datetime] = None
    dias_abierta: Optional[str] = None

    class Config:
        from_attributes = True
