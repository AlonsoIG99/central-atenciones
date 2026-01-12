from fastapi import APIRouter, HTTPException, status, Request
import sys
from pathlib import Path

# Agregar backend al path
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.models.usuario import Usuario
from backend.auth import (
    verificar_contraseña,
    obtener_hash_contraseña,
    crear_token_acceso,
    crear_refresh_token,
    guardar_refresh_token,
    verificar_refresh_token,
    revocar_refresh_token,
    revocar_todos_refresh_tokens_usuario,
    limpiar_tokens_expirados,
    Token
)
from datetime import timedelta
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
async def login(request: Request, credenciales: LoginRequest):
    """
    Login de usuario - retorna JWT token
    Rate limited: Máximo 5 intentos por minuto por IP (implementado en middleware)
    """
    try:
        # Buscar usuario por email en MongoDB
        usuario = Usuario.objects(email=credenciales.email).first()
        
        if not usuario or not verificar_contraseña(credenciales.password, usuario.contraseña):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email o contraseña incorrectos"
            )
        
        # Crear access token
        access_token_expires = timedelta(minutes=30)
        access_token = crear_token_acceso(
            data={"sub": usuario.email, "user_id": str(usuario.id), "rol": usuario.rol},
            expires_delta=access_token_expires
        )
        
        # Crear y guardar refresh token
        refresh_token = crear_refresh_token()
        guardar_refresh_token(str(usuario.id), refresh_token)
        
        # Limpiar tokens expirados (ejecución ligera)
        limpiar_tokens_expirados()
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user_id": str(usuario.id),
            "email": usuario.email,
            "nombre": usuario.nombre,
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

class RefreshRequest(BaseModel):
    refresh_token: str

@router.post("/refresh")
def refresh_token(request: RefreshRequest):
    """
    Refrescar access token usando refresh token
    """
    try:
        # Verificar refresh token
        user_id = verificar_refresh_token(request.refresh_token)
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token inválido o expirado"
            )
        
        # Buscar usuario
        usuario = Usuario.objects(id=user_id).first()
        
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        
        # Crear nuevo access token
        access_token_expires = timedelta(minutes=30)
        access_token = crear_token_acceso(
            data={"sub": usuario.email, "user_id": str(usuario.id), "rol": usuario.rol},
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR en refresh: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno: {str(e)}"
        )

class LogoutRequest(BaseModel):
    refresh_token: str

@router.post("/logout")
def logout(request: LogoutRequest):
    """
    Cerrar sesión - revoca el refresh token
    """
    try:
        # Revocar refresh token
        revocar_refresh_token(request.refresh_token)
        
        return {"message": "Sesión cerrada exitosamente"}
    except Exception as e:
        print(f"ERROR en logout: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno: {str(e)}"
        )

