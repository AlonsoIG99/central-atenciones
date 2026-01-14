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
        
        # 2. Atenciones con visita (tienen visita_id) vs directas (sin visita_id)
        atenciones_con_visita = AtencionCultura.objects().filter(
            __raw__={'visita_id': {'$exists': True, '$ne': None, '$ne': ''}}
        ).count()
        atenciones_directas = AtencionCultura.objects().filter(
            __raw__={'$or': [{'visita_id': None}, {'visita_id': ''}]}
        ).count()
        
        # 3. Visitas por zona y macrozona
        # Obtener solo los clientes únicos de las visitas
        visitas = list(Visita.objects.only('id', 'cliente'))
        clientes_unicos = set(v.cliente for v in visitas if v.cliente)
        
        # Crear un mapa de cliente -> datos de zona/macrozona (solo para clientes que tienen visitas)
        clientes_info = {}
        if clientes_unicos:
            for asignado in Asignado.objects(cliente__in=list(clientes_unicos)).only('cliente', 'zona', 'macrozona'):
                if asignado.cliente and asignado.cliente not in clientes_info:
                    clientes_info[asignado.cliente] = {
                        'zona': asignado.zona,
                        'macrozona': asignado.macrozona
                    }
        
        # Agrupar visitas por cliente y contar atenciones
        visitas_por_cliente = {}
        for visita in visitas:
            cliente = visita.cliente
            if cliente not in visitas_por_cliente:
                visitas_por_cliente[cliente] = {
                    'zona': clientes_info.get(cliente, {}).get('zona'),
                    'macrozona': clientes_info.get(cliente, {}).get('macrozona'),
                    'total_visitas': 0,
                    'total_atenciones': 0
                }
            
            visitas_por_cliente[cliente]['total_visitas'] += 1
            
            # Contar atenciones de esta visita
            atenciones_count = AtencionCultura.objects(visita_id=str(visita.id)).count()
            visitas_por_cliente[cliente]['total_atenciones'] += atenciones_count
        
        # Convertir a lista de VisitaPorZona
        visitas_por_zona = [
            VisitaPorZona(
                cliente=cliente,
                zona=datos['zona'],
                macrozona=datos['macrozona'],
                total_visitas=datos['total_visitas'],
                total_atenciones=datos['total_atenciones']
            )
            for cliente, datos in visitas_por_cliente.items()
        ]
        
        # Ordenar por total de visitas (descendente)
        visitas_por_zona.sort(key=lambda x: x.total_visitas, reverse=True)
        
        return DashboardVisitasResponse(
            total_visitas=total_visitas,
            atenciones_con_visita=atenciones_con_visita,
            atenciones_directas=atenciones_directas,
            visitas_por_zona=visitas_por_zona
        )
    
    except Exception as e:
        print(f"❌ Error en dashboard visitas: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error al obtener datos: {str(e)}")
