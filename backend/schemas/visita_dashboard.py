from pydantic import BaseModel
from typing import List

class VisitaPorZona(BaseModel):
    zona: str
    macrozona: str
    cliente: str
    total_visitas: int
    total_atenciones: int

class DashboardVisitasResponse(BaseModel):
    total_visitas: int
    atenciones_con_visita: int
    atenciones_directas: int
    visitas_por_zona: List[VisitaPorZona]
