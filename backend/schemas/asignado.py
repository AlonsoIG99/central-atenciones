from pydantic import BaseModel
from typing import Optional

class AsignadoBase(BaseModel):
    dni: str
    tipo_compania: Optional[str] = None
    nombre_completo: str
    fecha_ingreso: Optional[str] = None
    cliente: Optional[str] = None
    zona: Optional[str] = None
    lider_zonal: Optional[str] = None
    jefe_operaciones: Optional[str] = None
    macrozona: Optional[str] = None
    jurisdiccion: Optional[str] = None
    sector: Optional[str] = None
    estado: str = "activo"

class AsignadoCreate(AsignadoBase):
    pass

class AsignadoUpdate(BaseModel):
    tipo_compania: Optional[str] = None
    nombre_completo: Optional[str] = None
    fecha_ingreso: Optional[str] = None
    cliente: Optional[str] = None
    zona: Optional[str] = None
    lider_zonal: Optional[str] = None
    jefe_operaciones: Optional[str] = None
    macrozona: Optional[str] = None
    jurisdiccion: Optional[str] = None
    sector: Optional[str] = None
    estado: Optional[str] = None

class AsignadoResponse(AsignadoBase):
    id: str  # MongoDB ObjectId como string
    
    class Config:
        from_attributes = True
