from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from pydantic import BaseModel
import bcrypt
import os
import secrets
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

# Configuración desde variables de entorno
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("❌ JWT_SECRET_KEY no configurada en variables de entorno. Genera una con: python -c 'import secrets; print(secrets.token_urlsafe(32))'")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Para desarrollo, usamos SHA256 con salt
class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[str] = None
    rol: Optional[str] = None

class Token(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str
    user_id: str
    rol: str
    area: str

def verificar_contraseña(contraseña_plana: str, contraseña_almacenada: str) -> bool:
    """Verifica que la contraseña coincida usando bcrypt (seguro contra fuerza bruta)"""
    try:
        return bcrypt.checkpw(
            contraseña_plana.encode('utf-8'),
            contraseña_almacenada.encode('utf-8')
        )
    except Exception:
        return False

def obtener_hash_contraseña(contraseña: str) -> str:
    """Genera un hash bcrypt seguro para una contraseña (factor de trabajo 12)"""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(contraseña.encode('utf-8'), salt).decode('utf-8')

def crear_token_acceso(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Crea un JWT token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verificar_token(token: str) -> Optional[TokenData]:
    """Verifica y decodifica un JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user_id: int = payload.get("user_id")
        rol: str = payload.get("rol")
        if email is None or user_id is None:
            return None
        token_data = TokenData(email=email, user_id=user_id, rol=rol)
        return token_data
    except JWTError:
        return None

def crear_refresh_token() -> str:
    """Genera un refresh token aleatorio seguro"""
    return secrets.token_urlsafe(32)

def guardar_refresh_token(user_id: str, refresh_token: str) -> None:
    """Guarda un refresh token en la base de datos"""
    from backend.models.refresh_token import RefreshToken
    
    # Calcular expiración en hora de Perú (UTC-5)
    expires_at = (datetime.utcnow() - timedelta(hours=5)) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    # Crear nuevo refresh token
    token_doc = RefreshToken(
        token=refresh_token,
        user_id=user_id,
        expires_at=expires_at
    )
    token_doc.save()

def verificar_refresh_token(refresh_token: str) -> Optional[str]:
    """Verifica un refresh token y retorna el user_id si es válido"""
    from backend.models.refresh_token import RefreshToken
    
    try:
        token_doc = RefreshToken.objects(token=refresh_token).first()
        
        if not token_doc:
            return None
        
        # Verificar si está revocado
        if token_doc.is_revoked:
            return None
        
        # Verificar si ha expirado (comparar en hora de Perú)
        hora_actual_peru = datetime.utcnow() - timedelta(hours=5)
        if token_doc.expires_at < hora_actual_peru:
            return None
        
        return token_doc.user_id
    except Exception:
        return None

def revocar_refresh_token(refresh_token: str) -> bool:
    """Revoca un refresh token"""
    from backend.models.refresh_token import RefreshToken
    
    try:
        token_doc = RefreshToken.objects(token=refresh_token).first()
        if token_doc:
            token_doc.is_revoked = True
            token_doc.save()
            return True
        return False
    except Exception:
        return False

def revocar_todos_refresh_tokens_usuario(user_id: str) -> bool:
    """Revoca todos los refresh tokens de un usuario"""
    from backend.models.refresh_token import RefreshToken
    
    try:
        RefreshToken.objects(user_id=user_id).update(is_revoked=True)
        return True
    except Exception:
        return False

def limpiar_tokens_expirados() -> int:
    """Limpia tokens expirados y revocados de la base de datos"""
    from backend.models.refresh_token import RefreshToken
    
    try:
        # Hora actual de Perú (UTC-5)
        hora_actual_peru = datetime.utcnow() - timedelta(hours=5)
        
        # Borrar tokens expirados (más de 7 días)
        tokens_expirados = RefreshToken.objects(expires_at__lt=hora_actual_peru).delete()
        
        # Borrar tokens revocados con más de 30 días
        fecha_limite = hora_actual_peru - timedelta(days=30)
        tokens_revocados = RefreshToken.objects(is_revoked=True, created_at__lt=fecha_limite).delete()
        
        total_eliminados = tokens_expirados + tokens_revocados
        print(f"[LIMPIEZA] Tokens eliminados: {total_eliminados} (expirados: {tokens_expirados}, revocados antiguos: {tokens_revocados})")
        return total_eliminados
    except Exception as e:
        print(f"[ERROR] Error en limpieza de tokens: {e}")
        return 0
