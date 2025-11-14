from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.trabajador import Trabajador
from schemas.trabajador import TrabajadorCreate, TrabajadorUpdate, TrabajadorResponse

router = APIRouter(prefix="/trabajadores", tags=["trabajadores"])

@router.get("/", response_model=list[TrabajadorResponse])
def obtener_trabajadores(db: Session = Depends(get_db)):
    trabajadores = db.query(Trabajador).all()
    return trabajadores

@router.get("/buscar/{dni}", response_model=list[TrabajadorResponse])
def buscar_trabajador_por_dni(dni: str, db: Session = Depends(get_db)):
    """Busca trabajadores cuyo DNI comience con el valor proporcionado"""
    trabajadores = db.query(Trabajador).filter(Trabajador.dni.ilike(f"{dni}%")).all()
    return trabajadores

@router.get("/{trabajador_id}", response_model=TrabajadorResponse)
def obtener_trabajador(trabajador_id: int, db: Session = Depends(get_db)):
    trabajador = db.query(Trabajador).filter(Trabajador.id == trabajador_id).first()
    if not trabajador:
        raise HTTPException(status_code=404, detail="Trabajador no encontrado")
    return trabajador

@router.post("/", response_model=TrabajadorResponse)
def crear_trabajador(trabajador: TrabajadorCreate, db: Session = Depends(get_db)):
    # Verificar si el DNI ya existe
    trabajador_existente = db.query(Trabajador).filter(Trabajador.dni == trabajador.dni).first()
    if trabajador_existente:
        raise HTTPException(status_code=400, detail="El DNI ya existe")
    
    db_trabajador = Trabajador(**trabajador.dict())
    db.add(db_trabajador)
    db.commit()
    db.refresh(db_trabajador)
    return db_trabajador

@router.put("/{trabajador_id}", response_model=TrabajadorResponse)
def actualizar_trabajador(trabajador_id: int, trabajador: TrabajadorUpdate, db: Session = Depends(get_db)):
    db_trabajador = db.query(Trabajador).filter(Trabajador.id == trabajador_id).first()
    if not db_trabajador:
        raise HTTPException(status_code=404, detail="Trabajador no encontrado")
    
    for key, value in trabajador.dict(exclude_unset=True).items():
        setattr(db_trabajador, key, value)
    
    db.commit()
    db.refresh(db_trabajador)
    return db_trabajador

@router.delete("/{trabajador_id}")
def eliminar_trabajador(trabajador_id: int, db: Session = Depends(get_db)):
    db_trabajador = db.query(Trabajador).filter(Trabajador.id == trabajador_id).first()
    if not db_trabajador:
        raise HTTPException(status_code=404, detail="Trabajador no encontrado")
    
    db.delete(db_trabajador)
    db.commit()
    return {"mensaje": "Trabajador eliminado"}
