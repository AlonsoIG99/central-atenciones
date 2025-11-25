from fastapi import APIRouter, HTTPException, status
import sys
from pathlib import Path

# Agregar backend al path
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.models.usuario import Usuario
from backend.auth import (
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
    password: str

@router.post("/login", response_model=Token)
def login(credenciales: LoginRequest):
    """
    Login de usuario - retorna JWT token
    """
    try:
        # Buscar usuario por email en MongoDB
        usuario = Usuario.objects(email=credenciales.email).first()
        
        if not usuario or not verificar_contraseña(credenciales.password, usuario.contraseña):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email o contraseña incorrectos"
            )
        
        # Crear token
        access_token_expires = timedelta(minutes=30)
        access_token = crear_token_acceso(
            data={"sub": usuario.email, "user_id": str(usuario.id), "rol": usuario.rol},
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": str(usuario.id),
            "rol": usuario.rol,
            "area": usuario.area
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR en login: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno: {str(e)}"
        )

