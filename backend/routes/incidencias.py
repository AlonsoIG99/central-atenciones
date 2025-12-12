from fastapi import APIRouter, HTTPException
from backend.models.incidencia import Incidencia
from backend.models.usuario import Usuario
from backend.schemas.incidencia import IncidenciaCreate, IncidenciaUpdate, IncidenciaResponse

router = APIRouter(prefix="/atenciones", tags=["atenciones"])

@router.get("/", response_model=list[IncidenciaResponse])
def obtener_atenciones():
    """Obtener todas las atenciones"""
    atenciones = Incidencia.objects.all()
    
    resultado = []
    for atencion in atenciones:
        # Buscar el usuario
        usuario_nombre = "Desconocido"
        
        if atencion.usuario_id:
            try:
                usuario = Usuario.objects(id=atencion.usuario_id).first()
                if usuario:
                    usuario_nombre = usuario.nombre
            except:
                pass
        
        data = {
            "id": str(atencion.id),
            "dni": atencion.dni,
            "titulo": atencion.titulo,
            "descripcion": atencion.descripcion,
            "canal": atencion.canal if hasattr(atencion, 'canal') else "llamada_telefonica",
            "estado": atencion.estado,
            "usuario_id": atencion.usuario_id,
            "fecha_creacion": atencion.fecha_creacion,
            "fecha_actualizacion": atencion.fecha_actualizacion,
            "fecha_cierre": atencion.fecha_cierre,
            "dias_abierta": atencion.dias_abierta,
            "usuario_nombre": usuario_nombre
        }
        resultado.append(IncidenciaResponse(**data))
    
    return resultado

@router.get("/{atencion_id}", response_model=IncidenciaResponse)
def obtener_atencion(atencion_id: str):
    """Obtener atención por ID"""
    try:
        atencion = Incidencia.objects(id=atencion_id).first()
        if not atencion:
            raise HTTPException(status_code=404, detail="Atención no encontrada")
        
        usuario_nombre = "Desconocido"
        
        if atencion.usuario_id:
            try:
                usuario = Usuario.objects(id=atencion.usuario_id).first()
                if usuario:
                    usuario_nombre = usuario.nombre
            except:
                pass
        
        data = {
            "id": str(atencion.id),
            "dni": atencion.dni,
            "titulo": atencion.titulo,
            "descripcion": atencion.descripcion,
            "canal": atencion.canal if hasattr(atencion, 'canal') else "llamada_telefonica",
            "estado": atencion.estado,
            "usuario_id": atencion.usuario_id,
            "fecha_creacion": atencion.fecha_creacion,
            "fecha_actualizacion": atencion.fecha_actualizacion,
            "fecha_cierre": atencion.fecha_cierre,
            "dias_abierta": atencion.dias_abierta,
            "usuario_nombre": usuario_nombre
        }
        return IncidenciaResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@router.post("/", response_model=IncidenciaResponse)
def crear_atencion(atencion: IncidenciaCreate):
    """Crear nueva atención"""
    try:
        # Validar permisos por área
        if atencion.usuario_id:
            try:
                usuario = Usuario.objects(id=atencion.usuario_id).first()
                if usuario and usuario.area == 'Bienestar Social':
                    # Verificar que el título de la atención sea préstamo
                    if not atencion.titulo or "Apoyo económico/Préstamo" not in atencion.titulo:
                        raise HTTPException(
                            status_code=403,
                            detail="Los usuarios del área Bienestar Social solo pueden registrar préstamos"
                        )
            except HTTPException:
                raise
            except Exception as e:
                print(f"Error al validar permisos: {str(e)}")
                pass
        
        db_atencion = Incidencia(**atencion.dict())
        db_atencion.save()
        
        usuario_nombre = "Desconocido"
        if db_atencion.usuario_id:
            try:
                usuario = Usuario.objects(id=db_atencion.usuario_id).first()
                if usuario:
                    usuario_nombre = usuario.nombre
            except:
                pass
        
        data = {
            "id": str(db_atencion.id),
            "dni": db_atencion.dni,
            "titulo": db_atencion.titulo,
            "descripcion": db_atencion.descripcion,
            "estado": db_atencion.estado,
            "usuario_id": db_atencion.usuario_id,
            "fecha_creacion": db_atencion.fecha_creacion,
            "fecha_actualizacion": db_atencion.fecha_actualizacion,
            "fecha_cierre": db_atencion.fecha_cierre,
            "dias_abierta": db_atencion.dias_abierta,
            "usuario_nombre": usuario_nombre
        }
        return IncidenciaResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@router.put("/{atencion_id}", response_model=IncidenciaResponse)
def actualizar_atencion(atencion_id: str, atencion: IncidenciaUpdate):
    """Actualizar atención"""
    try:
        from datetime import datetime
        
        db_atencion = Incidencia.objects(id=atencion_id).first()
        if not db_atencion:
            raise HTTPException(status_code=404, detail="Atención no encontrada")
        
        # Si se cambia a cerrada, calcular dias_abierta
        if atencion.estado == "cerrada" and db_atencion.estado != "cerrada":
            db_atencion.fecha_cierre = datetime.utcnow()
            dias = (db_atencion.fecha_cierre - db_atencion.fecha_creacion).days
            db_atencion.dias_abierta = str(dias)
        
        for key, value in atencion.dict(exclude_unset=True).items():
            if value is not None:
                setattr(db_atencion, key, value)
        
        db_atencion.fecha_actualizacion = datetime.utcnow()
        db_atencion.save()
        
        usuario_nombre = "Desconocido"
        if db_atencion.usuario_id:
            try:
                usuario = Usuario.objects(id=db_atencion.usuario_id).first()
                if usuario:
                    usuario_nombre = usuario.nombre
            except:
                pass
        
        data = {
            "id": str(db_atencion.id),
            "dni": db_atencion.dni,
            "titulo": db_atencion.titulo,
            "descripcion": db_atencion.descripcion,
            "estado": db_atencion.estado,
            "usuario_id": db_atencion.usuario_id,
            "fecha_creacion": db_atencion.fecha_creacion,
            "fecha_actualizacion": db_atencion.fecha_actualizacion,
            "fecha_cierre": db_atencion.fecha_cierre,
            "dias_abierta": db_atencion.dias_abierta,
            "usuario_nombre": usuario_nombre
        }
        return IncidenciaResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@router.delete("/{atencion_id}")
def eliminar_atencion(atencion_id: str):
    """Eliminar atención"""
    try:
        db_atencion = Incidencia.objects(id=atencion_id).first()
        if not db_atencion:
            raise HTTPException(status_code=404, detail="Atención no encontrada")
        
        db_atencion.delete()
        return {"mensaje": "Atención eliminada"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")