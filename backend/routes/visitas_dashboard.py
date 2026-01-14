from fastapi import APIRouter, HTTPException, Request
from backend.auth import verificar_token
from backend.models.visita import Visita
from backend.models.atencion_cultura import AtencionCultura
from backend.models.asignado import Asignado
from backend.schemas.visita_dashboard import DashboardVisitasResponse, VisitaPorZona

router = APIRouter(prefix="/api/dashboard-visitas", tags=["dashboard-visitas"])

@router.get("", response_model=DashboardVisitasResponse)
async def obtener_dashboard_visitas(request: Request):
    """
    Obtiene estadísticas del dashboard de visitas:
    - Total de visitas registradas
    - Atenciones con visita vs directas
    - Visitas por zona/macrozona con total de atenciones
    """
    
    # Verificar autenticación
    auth_header = request.headers.get("authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="No autorizado")
    
    token = auth_header.replace("Bearer ", "")
    usuario = verificar_token(token)
    
    if not usuario:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    # Verificar permisos: solo administrador o frivas@liderman.com.pe
    if usuario.rol != "administrador" and usuario.email != "frivas@liderman.com.pe":
        raise HTTPException(status_code=403, detail="No tienes permisos para acceder a este módulo")
    
    try:
        # 1. Total de visitas
        total_visitas = Visita.objects.count()
        
        # 2. Atenciones con visita vs directas
        atenciones_con_visita = AtencionCultura.objects(visita_id__ne=None).count()
        atenciones_directas = AtencionCultura.objects(visita_id=None).count()
        
        # 3. Visitas por zona/macrozona
        # Obtener todos los clientes únicos de las visitas
        visitas = Visita.objects.all()
        clientes_en_visitas = set(v.cliente for v in visitas)
        
        # Filtrar asignados solo por esos clientes
        asignados = Asignado.objects(cliente__in=list(clientes_en_visitas))
        
        # Crear un mapa de cliente -> (zona, macrozona)
        cliente_a_zona = {}
        for asignado in asignados:
            if asignado.cliente not in cliente_a_zona:
                cliente_a_zona[asignado.cliente] = {
                    'zona': asignado.zona or 'Sin zona',
                    'macrozona': asignado.macrozona or 'Sin macrozona'
                }
        
        # Agrupar por cliente
        stats_por_cliente = {}
        for visita in visitas:
            cliente = visita.cliente
            if cliente not in stats_por_cliente:
                zona_info = cliente_a_zona.get(cliente, {'zona': 'Sin zona', 'macrozona': 'Sin macrozona'})
                stats_por_cliente[cliente] = {
                    'cliente': cliente,
                    'zona': zona_info['zona'],
                    'macrozona': zona_info['macrozona'],
                    'total_visitas': 0,
                    'total_atenciones': 0
                }
            
            stats_por_cliente[cliente]['total_visitas'] += 1
            
            # Contar atenciones de esta visita
            atenciones = AtencionCultura.objects(visita_id=str(visita.id)).count()
            stats_por_cliente[cliente]['total_atenciones'] += atenciones
        
        # Convertir a lista
        visitas_por_zona = [
            VisitaPorZona(
                zona=v['zona'],
                macrozona=v['macrozona'],
                cliente=v['cliente'],
                total_visitas=v['total_visitas'],
                total_atenciones=v['total_atenciones']
            )
            for v in stats_por_cliente.values()
        ]
        
        # Ordenar por total de visitas descendente
        visitas_por_zona.sort(key=lambda x: x.total_visitas, reverse=True)
        
        return DashboardVisitasResponse(
            total_visitas=total_visitas,
            atenciones_con_visita=atenciones_con_visita,
            atenciones_directas=atenciones_directas,
            visitas_por_zona=visitas_por_zona
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener datos: {str(e)}")
