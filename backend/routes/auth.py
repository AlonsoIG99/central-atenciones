from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.usuario import Usuario
from auth import (
    verificar_contraseña,
    obtener_hash_contraseña,
    crear_token_acceso,
    Token
)
from datetime import timedelta
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    email: str
    contraseña: str

@router.post("/login", response_model=Token)
def login(credenciales: LoginRequest, db: Session = Depends(get_db)):
    """
    Login de usuario - retorna JWT token
    """
    # Buscar usuario por email
    usuario = db.query(Usuario).filter(Usuario.email == credenciales.email).first()
    
    if not usuario or not verificar_contraseña(credenciales.contraseña, usuario.contraseña):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos"
        )
    
    # Crear token
    access_token_expires = timedelta(minutes=30)
    access_token = crear_token_acceso(
        data={"sub": usuario.email, "user_id": usuario.id, "rol": usuario.rol},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": usuario.id,
        "rol": usuario.rol,
        "area": usuario.area
    }

@router.post("/registro")
def registro(credenciales: LoginRequest, db: Session = Depends(get_db)):
    """
    Registro de nuevo usuario (solo para demostración)
    """
    # Verificar si el usuario ya existe
    usuario_existente = db.query(Usuario).filter(Usuario.email == credenciales.email).first()
    if usuario_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario ya existe"
        )
    
    # Crear nuevo usuario
    nuevo_usuario = Usuario(
        nombre=credenciales.email.split('@')[0],
        email=credenciales.email,
        contraseña=obtener_hash_contraseña(credenciales.contraseña),
        rol="gestor",
        area="General"
    )
    
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    
    return {"mensaje": "Usuario creado exitosamente", "usuario_id": nuevo_usuario.id}
