from fastapi import APIRouter, HTTPException
from backend.models.incidencia import Incidencia
from backend.models.usuario import Usuario
from backend.schemas.incidencia import IncidenciaCreate, IncidenciaUpdate, IncidenciaResponse

router = APIRouter(prefix="/incidencias", tags=["incidencias"])

@router.get("/", response_model=list[IncidenciaResponse])
def obtener_incidencias():
    """Obtener todas las incidencias"""
    incidencias = Incidencia.objects.all()
    
    resultado = []
    for incidencia in incidencias:
        # Buscar el usuario
        usuario_nombre = "Desconocido"
        
        if incidencia.usuario_id:
            try:
                usuario = Usuario.objects(id=incidencia.usuario_id).first()
                if usuario:
                    usuario_nombre = usuario.nombre
            except:
                pass
        
        data = {
            "id": str(incidencia.id),
            "dni": incidencia.dni,
            "titulo": incidencia.titulo,
            "descripcion": incidencia.descripcion,
            "estado": incidencia.estado,
            "usuario_id": incidencia.usuario_id,
            "fecha_creacion": incidencia.fecha_creacion,
            "fecha_actualizacion": incidencia.fecha_actualizacion,
            "usuario_nombre": usuario_nombre
        }
        resultado.append(IncidenciaResponse(**data))
    
    return resultado

@router.get("/{incidencia_id}", response_model=IncidenciaResponse)
def obtener_incidencia(incidencia_id: str):
    """Obtener incidencia por ID"""
    try:
        incidencia = Incidencia.objects(id=incidencia_id).first()
        if not incidencia:
            raise HTTPException(status_code=404, detail="Incidencia no encontrada")
        
        usuario_nombre = "Desconocido"
        
        if incidencia.usuario_id:
            try:
                usuario = Usuario.objects(id=incidencia.usuario_id).first()
                if usuario:
                    usuario_nombre = usuario.nombre
            except:
                pass
        
        data = {
            "id": str(incidencia.id),
            "dni": incidencia.dni,
            "titulo": incidencia.titulo,
            "descripcion": incidencia.descripcion,
            "estado": incidencia.estado,
            "usuario_id": incidencia.usuario_id,
            "fecha_creacion": incidencia.fecha_creacion,
            "fecha_actualizacion": incidencia.fecha_actualizacion,
            "usuario_nombre": usuario_nombre
        }
        return IncidenciaResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@router.post("/", response_model=IncidenciaResponse)
def crear_incidencia(incidencia: IncidenciaCreate):
    """Crear nueva incidencia"""
    try:
        db_incidencia = Incidencia(**incidencia.dict())
        db_incidencia.save()
        
        usuario_nombre = "Desconocido"
        if db_incidencia.usuario_id:
            try:
                usuario = Usuario.objects(id=db_incidencia.usuario_id).first()
                if usuario:
                    usuario_nombre = usuario.nombre
            except:
                pass
        
        data = {
            "id": str(db_incidencia.id),
            "dni": db_incidencia.dni,
            "titulo": db_incidencia.titulo,
            "descripcion": db_incidencia.descripcion,
            "estado": db_incidencia.estado,
            "usuario_id": db_incidencia.usuario_id,
            "fecha_creacion": db_incidencia.fecha_creacion,
            "fecha_actualizacion": db_incidencia.fecha_actualizacion,
            "usuario_nombre": usuario_nombre
        }
        return IncidenciaResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@router.put("/{incidencia_id}", response_model=IncidenciaResponse)
def actualizar_incidencia(incidencia_id: str, incidencia: IncidenciaUpdate):
    """Actualizar incidencia"""
    try:
        db_incidencia = Incidencia.objects(id=incidencia_id).first()
        if not db_incidencia:
            raise HTTPException(status_code=404, detail="Incidencia no encontrada")
        
        for key, value in incidencia.dict(exclude_unset=True).items():
            if value is not None:
                setattr(db_incidencia, key, value)
        
        db_incidencia.fecha_actualizacion = Incidencia.fecha_actualizacion.default()
        db_incidencia.save()
        
        usuario_nombre = "Desconocido"
        if db_incidencia.usuario_id:
            try:
                usuario = Usuario.objects(id=db_incidencia.usuario_id).first()
                if usuario:
                    usuario_nombre = usuario.nombre
            except:
                pass
        
        data = {
            "id": str(db_incidencia.id),
            "dni": db_incidencia.dni,
            "titulo": db_incidencia.titulo,
            "descripcion": db_incidencia.descripcion,
            "estado": db_incidencia.estado,
            "usuario_id": db_incidencia.usuario_id,
            "fecha_creacion": db_incidencia.fecha_creacion,
            "fecha_actualizacion": db_incidencia.fecha_actualizacion,
            "usuario_nombre": usuario_nombre
        }
        return IncidenciaResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@router.delete("/{incidencia_id}")
def eliminar_incidencia(incidencia_id: str):
    """Eliminar incidencia"""
    try:
        db_incidencia = Incidencia.objects(id=incidencia_id).first()
        if not db_incidencia:
            raise HTTPException(status_code=404, detail="Incidencia no encontrada")
        
        db_incidencia.delete()
        return {"mensaje": "Incidencia eliminada"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")
