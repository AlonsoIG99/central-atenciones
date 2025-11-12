from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.incidencia import Incidencia
from models.usuario import Usuario
from schemas.incidencia import IncidenciaCreate, IncidenciaUpdate, IncidenciaResponse

router = APIRouter(prefix="/incidencias", tags=["incidencias"])

@router.get("/", response_model=list[IncidenciaResponse])
def obtener_incidencias(db: Session = Depends(get_db)):
    incidencias = db.query(Incidencia).all()
    
    # Crear lista de respuestas con el nombre del usuario
    resultado = []
    for incidencia in incidencias:
        # Buscar el usuario
        usuario = None
        usuario_nombre = "Desconocido"
        
        if incidencia.usuario_id:
            usuario = db.query(Usuario).filter(Usuario.id == incidencia.usuario_id).first()
            if usuario:
                usuario_nombre = usuario.nombre
        
        print(f"DEBUG - Inc ID: {incidencia.id}, Usuario ID: {incidencia.usuario_id}, Nombre: {usuario_nombre}")
        
        # Crear diccionario con los datos
        data = {
            "id": incidencia.id,
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
def obtener_incidencia(incidencia_id: int, db: Session = Depends(get_db)):
    incidencia = db.query(Incidencia).filter(Incidencia.id == incidencia_id).first()
    if not incidencia:
        raise HTTPException(status_code=404, detail="Incidencia no encontrada")
    
    # Buscar el usuario
    usuario = None
    usuario_nombre = "Desconocido"
    
    if incidencia.usuario_id:
        usuario = db.query(Usuario).filter(Usuario.id == incidencia.usuario_id).first()
        if usuario:
            usuario_nombre = usuario.nombre
    
    # Crear diccionario con los datos
    data = {
        "id": incidencia.id,
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

@router.post("/", response_model=IncidenciaResponse)
def crear_incidencia(incidencia: IncidenciaCreate, db: Session = Depends(get_db)):
    db_incidencia = Incidencia(**incidencia.dict())
    db.add(db_incidencia)
    db.commit()
    db.refresh(db_incidencia)
    return db_incidencia

@router.put("/{incidencia_id}", response_model=IncidenciaResponse)
def actualizar_incidencia(incidencia_id: int, incidencia: IncidenciaUpdate, db: Session = Depends(get_db)):
    db_incidencia = db.query(Incidencia).filter(Incidencia.id == incidencia_id).first()
    if not db_incidencia:
        raise HTTPException(status_code=404, detail="Incidencia no encontrada")
    
    for key, value in incidencia.dict(exclude_unset=True).items():
        setattr(db_incidencia, key, value)
    
    db.commit()
    db.refresh(db_incidencia)
    return db_incidencia

@router.delete("/{incidencia_id}")
def eliminar_incidencia(incidencia_id: int, db: Session = Depends(get_db)):
    db_incidencia = db.query(Incidencia).filter(Incidencia.id == incidencia_id).first()
    if not db_incidencia:
        raise HTTPException(status_code=404, detail="Incidencia no encontrada")
    
    db.delete(db_incidencia)
    db.commit()
    return {"mensaje": "Incidencia eliminada"}
