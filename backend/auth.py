from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

# Configuración
SECRET_KEY = "tu-clave-secreta-muy-segura-cambiar-en-produccion"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Contexto para hashear contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None
    rol: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    rol: str
    area: str

def verificar_contraseña(contraseña_plana: str, contraseña_hash: str) -> bool:
    """Verifica que la contraseña coincida con el hash"""
    try:
        # Intentar verificación con bcrypt
        return pwd_context.verify(contraseña_plana, contraseña_hash)
    except Exception:
        # Si falla (ej: password no hasheada), comparación directa para desarrollo
        return contraseña_plana == contraseña_hash

def obtener_hash_contraseña(contraseña: str) -> str:
    """Genera el hash de una contraseña"""
    return pwd_context.hash(contraseña)

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
