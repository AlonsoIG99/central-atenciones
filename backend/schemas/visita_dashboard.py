from pydantic import BaseModel
from typing import List, Optional

class VisitaPorZona(BaseModel):
    """Schema para visitas agrupadas por zona y macrozona"""
    zona: Optional[str]
    macrozona: Optional[str]
    cliente: str
    total_visitas: int
    total_atenciones: int

class DashboardVisitasResponse(BaseModel):
    """Schema para la respuesta del dashboard de visitas"""
    total_visitas: int
    atenciones_con_visita: int
    atenciones_directas: int
    visitas_por_zona: List[VisitaPorZona]
