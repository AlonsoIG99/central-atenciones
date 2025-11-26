from fastapi import APIRouter, HTTPException
from backend.models.reporte_dashboard import ReporteDashboard
from backend.models.incidencia import Incidencia
from backend.models.trabajador import Trabajador
from backend.models.asignado import Asignado
from backend.models.usuario import Usuario
from backend.schemas.reporte_dashboard import ReporteDashboardResponse
from datetime import datetime

router = APIRouter(prefix="/reporte-dashboards", tags=["reporte-dashboards"])

@router.post("/generar", response_model=dict)
def generar_reporte_dashboard():
    """Genera el reporte dashboard uniendo datos de incidencias, trabajadores y asignados"""
    try:
        # Obtener todas las incidencias
        incidencias = Incidencia.objects.all()
        
        registros_generados = 0
        
        for incidencia in incidencias:
            try:
                # Obtener datos del usuario que registró
                usuario_nombre = "Desconocido"
                usuario_area = "No disponible"
                
                if incidencia.usuario_id:
                    usuario = Usuario.objects(id=incidencia.usuario_id).first()
                    if usuario:
                        usuario_nombre = usuario.nombre
                        usuario_area = usuario.area or "No disponible"
                
                # Obtener datos del trabajador por DNI
                trabajador = Trabajador.objects(dni=incidencia.dni).first()
                nombre_completo_trabajador = trabajador.nombre_completo if trabajador else None
                fecha_ingreso_trabajador = trabajador.fecha_ingreso if trabajador else None
                fecha_cese_trabajador = trabajador.fecha_cese if trabajador else None
                
                # Obtener datos del asignado por DNI
                asignado = Asignado.objects(dni=incidencia.dni).first()
                tipo_compania = asignado.tipo_compania if asignado else None
                cliente = asignado.cliente if asignado else None
                zona = asignado.zona if asignado else None
                lider_zonal = asignado.lider_zonal if asignado else None
                jefe_operaciones = asignado.jefe_operaciones if asignado else None
                macrozona = asignado.macrozona if asignado else None
                jurisdiccion = asignado.jurisdiccion if asignado else None
                sector = asignado.sector if asignado else None
                
                # Crear o actualizar registro en reporte_dashboards
                reporte = ReporteDashboard.objects(incidencia_id=str(incidencia.id)).first()
                
                if reporte:
                    # Actualizar registro existente
                    reporte.dni = incidencia.dni
                    reporte.titulo_incidencia = incidencia.titulo
                    reporte.descripcion_incidencia = incidencia.descripcion
                    reporte.estado_incidencia = incidencia.estado
                    reporte.fecha_creacion_incidencia = incidencia.fecha_creacion
                    reporte.fecha_cierre_incidencia = incidencia.fecha_cierre
                    reporte.dias_abierta = incidencia.dias_abierta
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
                        incidencia_id=str(incidencia.id),
                        dni=incidencia.dni,
                        titulo_incidencia=incidencia.titulo,
                        descripcion_incidencia=incidencia.descripcion,
                        estado_incidencia=incidencia.estado,
                        fecha_creacion_incidencia=incidencia.fecha_creacion,
                        fecha_cierre_incidencia=incidencia.fecha_cierre,
                        dias_abierta=incidencia.dias_abierta,
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
                print(f"Error procesando incidencia {incidencia.id}: {str(e)}")
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
                "incidencia_id": reporte.incidencia_id,
                "dni": reporte.dni,
                "titulo_incidencia": reporte.titulo_incidencia,
                "descripcion_incidencia": reporte.descripcion_incidencia,
                "estado_incidencia": reporte.estado_incidencia,
                "fecha_creacion_incidencia": reporte.fecha_creacion_incidencia,
                "fecha_cierre_incidencia": reporte.fecha_cierre_incidencia,
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
                "incidencia_id": reporte.incidencia_id,
                "dni": reporte.dni,
                "titulo_incidencia": reporte.titulo_incidencia,
                "descripcion_incidencia": reporte.descripcion_incidencia,
                "estado_incidencia": reporte.estado_incidencia,
                "fecha_creacion_incidencia": reporte.fecha_creacion_incidencia,
                "fecha_cierre_incidencia": reporte.fecha_cierre_incidencia,
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
