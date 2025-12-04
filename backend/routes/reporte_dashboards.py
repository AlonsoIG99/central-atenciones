from fastapi import APIRouter, HTTPException, Header
from backend.models.reporte_dashboard import ReporteDashboard
from backend.models.incidencia import Incidencia
from backend.models.trabajador import Trabajador
from backend.models.asignado import Asignado
from backend.models.usuario import Usuario
from backend.schemas.reporte_dashboard import ReporteDashboardResponse
from backend.auth import verificar_token
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/reporte-dashboards", tags=["reporte-dashboards"])

@router.post("/generar", response_model=dict)
def generar_reporte_dashboard(authorization: Optional[str] = Header(None)):
    """
    Genera el reporte dashboard uniendo datos de atenciones, trabajadores y asignados
    Solo acceso: Administrador
    """
    
    # Verificar que sea administrador
    if not authorization:
        raise HTTPException(status_code=401, detail="Token no proporcionado")
    
    # Extraer token del header (formato: Bearer <token>)
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Esquema de autenticación inválido")
    except ValueError:
        raise HTTPException(status_code=401, detail="Formato de token inválido")
    
    # Verificar token
    token_data = verificar_token(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    
    if token_data.rol != "administrador":
        raise HTTPException(status_code=403, detail="Solo administradores pueden generar reportes")
    
    try:
        # Obtener todas las atenciones
        atenciones = Incidencia.objects.all()
        
        registros_generados = 0
        
        for atencion in atenciones:
            try:
                # Obtener datos del usuario que registró
                usuario_nombre = "Desconocido"
                usuario_area = "No disponible"
                
                if atencion.usuario_id:
                    usuario = Usuario.objects(id=atencion.usuario_id).first()
                    if usuario:
                        usuario_nombre = usuario.nombre
                        usuario_area = usuario.area or "No disponible"
                
                # Obtener datos del trabajador por DNI
                trabajador = Trabajador.objects(dni=atencion.dni).first()
                nombre_completo_trabajador = trabajador.nombre_completo if trabajador else None
                fecha_ingreso_trabajador = trabajador.fecha_ingreso if trabajador else None
                fecha_cese_trabajador = trabajador.fecha_cese if trabajador else None
                
                # Obtener datos del asignado por DNI
                asignado = Asignado.objects(dni=atencion.dni).first()
                tipo_compania = asignado.tipo_compania if asignado else None
                cliente = asignado.cliente if asignado else None
                zona = asignado.zona if asignado else None
                lider_zonal = asignado.lider_zonal if asignado else None
                jefe_operaciones = asignado.jefe_operaciones if asignado else None
                macrozona = asignado.macrozona if asignado else None
                jurisdiccion = asignado.jurisdiccion if asignado else None
                sector = asignado.sector if asignado else None
                
                # Crear o actualizar registro en reporte_dashboards
                reporte = ReporteDashboard.objects(atencion_id=str(atencion.id)).first()
                
                if reporte:
                    # Actualizar registro existente
                    reporte.dni = atencion.dni
                    reporte.canal = atencion.canal if hasattr(atencion, 'canal') else None
                    reporte.titulo_atencion = atencion.titulo
                    reporte.descripcion_atencion = atencion.descripcion
                    reporte.estado_atencion = atencion.estado
                    reporte.fecha_creacion_atencion = atencion.fecha_creacion
                    reporte.fecha_cierre_atencion = atencion.fecha_cierre
                    reporte.dias_abierta = atencion.dias_abierta
                    reporte.usuario_nombre = usuario_nombre
                    reporte.usuario_area = usuario_area
                    reporte.nombre_completo_trabajador = nombre_completo_trabajador
                    reporte.fecha_ingreso_trabajador = fecha_ingreso_trabajador
                    reporte.fecha_cese_trabajador = fecha_cese_trabajador
                    reporte.tipo_compania = tipo_compania
                    reporte.cliente = cliente
                    reporte.zona = zona
                    reporte.lider_zonal = lider_zonal
                    reporte.jefe_operaciones = jefe_operaciones
                    reporte.macrozona = macrozona
                    reporte.jurisdiccion = jurisdiccion
                    reporte.sector = sector
                    reporte.save()
                else:
                    # Crear nuevo registro
                    reporte = ReporteDashboard(
                        atencion_id=str(atencion.id),
                        dni=atencion.dni,
                        canal=atencion.canal if hasattr(atencion, 'canal') else None,
                        titulo_atencion=atencion.titulo,
                        descripcion_atencion=atencion.descripcion,
                        estado_atencion=atencion.estado,
                        fecha_creacion_atencion=atencion.fecha_creacion,
                        fecha_cierre_atencion=atencion.fecha_cierre,
                        dias_abierta=atencion.dias_abierta,
                        usuario_nombre=usuario_nombre,
                        usuario_area=usuario_area,
                        nombre_completo_trabajador=nombre_completo_trabajador,
                        fecha_ingreso_trabajador=fecha_ingreso_trabajador,
                        fecha_cese_trabajador=fecha_cese_trabajador,
                        tipo_compania=tipo_compania,
                        cliente=cliente,
                        zona=zona,
                        lider_zonal=lider_zonal,
                        jefe_operaciones=jefe_operaciones,
                        macrozona=macrozona,
                        jurisdiccion=jurisdiccion,
                        sector=sector
                    )
                    reporte.save()
                
                registros_generados += 1
            except Exception as e:
                print(f"Error procesando atencion {atencion.id}: {str(e)}")
                continue
        
        return {
            "mensaje": f"Reporte generado exitosamente",
            "registros_generados": registros_generados
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al generar reporte: {str(e)}")

@router.get("/ultimos", response_model=list[ReporteDashboardResponse])
def obtener_ultimos_registros(cantidad: int = 5):
    """Obtiene los últimos N registros del reporte dashboard"""
    try:
        reportes = ReporteDashboard.objects.order_by('-fecha_generacion')[:cantidad]
        
        resultado = []
        for reporte in reportes:
            data = {
                "id": str(reporte.id),
                "atencion_id": reporte.atencion_id,
                "dni": reporte.dni,
                "canal": reporte.canal if hasattr(reporte, 'canal') else None,
                "titulo_atencion": reporte.titulo_atencion,
                "descripcion_atencion": reporte.descripcion_atencion,
                "estado_atencion": reporte.estado_atencion,
                "fecha_creacion_atencion": reporte.fecha_creacion_atencion,
                "fecha_cierre_atencion": reporte.fecha_cierre_atencion,
                "dias_abierta": reporte.dias_abierta,
                "usuario_nombre": reporte.usuario_nombre,
                "usuario_area": reporte.usuario_area,
                "nombre_completo_trabajador": reporte.nombre_completo_trabajador,
                "fecha_ingreso_trabajador": reporte.fecha_ingreso_trabajador,
                "fecha_cese_trabajador": reporte.fecha_cese_trabajador,
                "tipo_compania": reporte.tipo_compania,
                "cliente": reporte.cliente,
                "zona": reporte.zona,
                "lider_zonal": reporte.lider_zonal,
                "jefe_operaciones": reporte.jefe_operaciones,
                "macrozona": reporte.macrozona,
                "jurisdiccion": reporte.jurisdiccion,
                "sector": reporte.sector,
                "fecha_generacion": reporte.fecha_generacion
            }
            resultado.append(ReporteDashboardResponse(**data))
        
        return resultado
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@router.get("/", response_model=list[ReporteDashboardResponse])
def obtener_todos_reportes():
    """Obtiene todos los reportes dashboard"""
    try:
        reportes = ReporteDashboard.objects.order_by('-fecha_generacion')
        
        resultado = []
        for reporte in reportes:
            data = {
                "id": str(reporte.id),
                "atencion_id": reporte.atencion_id,
                "dni": reporte.dni,
                "canal": reporte.canal if hasattr(reporte, 'canal') else None,
                "titulo_atencion": reporte.titulo_atencion,
                "descripcion_atencion": reporte.descripcion_atencion,
                "estado_atencion": reporte.estado_atencion,
                "fecha_creacion_atencion": reporte.fecha_creacion_atencion,
                "fecha_cierre_atencion": reporte.fecha_cierre_atencion,
                "dias_abierta": reporte.dias_abierta,
                "usuario_nombre": reporte.usuario_nombre,
                "usuario_area": reporte.usuario_area,
                "nombre_completo_trabajador": reporte.nombre_completo_trabajador,
                "fecha_ingreso_trabajador": reporte.fecha_ingreso_trabajador,
                "fecha_cese_trabajador": reporte.fecha_cese_trabajador,
                "tipo_compania": reporte.tipo_compania,
                "cliente": reporte.cliente,
                "zona": reporte.zona,
                "lider_zonal": reporte.lider_zonal,
                "jefe_operaciones": reporte.jefe_operaciones,
                "macrozona": reporte.macrozona,
                "jurisdiccion": reporte.jurisdiccion,
                "sector": reporte.sector,
                "fecha_generacion": reporte.fecha_generacion
            }
            resultado.append(ReporteDashboardResponse(**data))
        
        return resultado
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")
