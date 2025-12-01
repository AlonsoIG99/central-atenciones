from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReporteDashboardBase(BaseModel):
    dni: str
    titulo_atencion: Optional[str] = None
    descripcion_atencion: Optional[str] = None
    estado_atencion: Optional[str] = None
    usuario_nombre: Optional[str] = None
    usuario_area: Optional[str] = None
    nombre_completo_trabajador: Optional[str] = None
    fecha_ingreso_trabajador: Optional[str] = None
    fecha_cese_trabajador: Optional[str] = None
    tipo_compania: Optional[str] = None
    cliente: Optional[str] = None
    zona: Optional[str] = None
    lider_zonal: Optional[str] = None
    jefe_operaciones: Optional[str] = None
    macrozona: Optional[str] = None
    jurisdiccion: Optional[str] = None
    sector: Optional[str] = None

class ReporteDashboardResponse(ReporteDashboardBase):
    id: str
    atencion_id: str
    fecha_creacion_atencion: Optional[datetime] = None
    fecha_cierre_atencion: Optional[datetime] = None
    dias_abierta: Optional[str] = None
    fecha_generacion: datetime
    
    class Config:
        from_attributes = True
