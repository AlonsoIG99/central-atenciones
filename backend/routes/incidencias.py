from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.incidencia import Incidencia
from schemas.incidencia import IncidenciaCreate, IncidenciaUpdate, IncidenciaResponse

router = APIRouter(prefix="/incidencias", tags=["incidencias"])

@router.get("/", response_model=list[IncidenciaResponse])
def obtener_incidencias(db: Session = Depends(get_db)):
    incidencias = db.query(Incidencia).all()
    return incidencias

@router.get("/{incidencia_id}", response_model=IncidenciaResponse)
def obtener_incidencia(incidencia_id: int, db: Session = Depends(get_db)):
    incidencia = db.query(Incidencia).filter(Incidencia.id == incidencia_id).first()
    if not incidencia:
        raise HTTPException(status_code=404, detail="Incidencia no encontrada")
    return incidencia

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
