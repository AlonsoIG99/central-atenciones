from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.usuario import Usuario
from schemas.usuario import UsuarioCreate, UsuarioUpdate, UsuarioResponse
from auth import obtener_hash_contraseña, verificar_token

router = APIRouter(prefix="/usuarios", tags=["usuarios"])

# Función para obtener el usuario actual desde el token
def obtener_usuario_actual(authorization: str = None) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token no proporcionado")
    
    token = authorization.replace("Bearer ", "")
    token_data = verificar_token(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    return {"user_id": token_data.user_id, "email": token_data.email, "rol": token_data.rol}

@router.get("/", response_model=list[UsuarioResponse])
def obtener_usuarios(db: Session = Depends(get_db)):
    usuarios = db.query(Usuario).all()
    return usuarios

@router.get("/{usuario_id}", response_model=UsuarioResponse)
def obtener_usuario(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario

@router.post("/", response_model=UsuarioResponse)
def crear_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db), authorization: str = None):
    # Verificar que el usuario actual sea administrador
    usuario_actual = obtener_usuario_actual(authorization)
    
    if usuario_actual["rol"] != "administrador":
        raise HTTPException(status_code=403, detail="Solo los administradores pueden crear usuarios")
    
    # Hashear contraseña
    usuario_dict = usuario.dict()
    usuario_dict['contraseña'] = obtener_hash_contraseña(usuario_dict['contraseña'])
    
    db_usuario = Usuario(**usuario_dict)
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

@router.put("/{usuario_id}", response_model=UsuarioResponse)
def actualizar_usuario(usuario_id: int, usuario: UsuarioUpdate, db: Session = Depends(get_db)):
    db_usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    for key, value in usuario.dict(exclude_unset=True).items():
        if key == 'contraseña' and value:
            value = obtener_hash_contraseña(value)
        setattr(db_usuario, key, value)
    
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

@router.delete("/{usuario_id}")
def eliminar_usuario(usuario_id: int, db: Session = Depends(get_db)):
    db_usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    db.delete(db_usuario)
    db.commit()
    return {"mensaje": "Usuario eliminado"}
