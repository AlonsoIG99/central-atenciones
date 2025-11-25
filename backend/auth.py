from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from pydantic import BaseModel

# Configuración
SECRET_KEY = "tu-clave-secreta-muy-segura-cambiar-en-produccion"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Para desarrollo, usamos plaintext. En producción, usar bcrypt con hash SHA256
class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[str] = None
    rol: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    rol: str
    area: str

def verificar_contraseña(contraseña_plana: str, contraseña_almacenada: str) -> bool:
    """Verifica que la contraseña coincida"""
    # Para desarrollo, comparación directa
    # En producción, usar hash seguro
    return contraseña_plana == contraseña_almacenada

def obtener_hash_contraseña(contraseña: str) -> str:
    """Genera el hash de una contraseña (en desarrollo es plaintext)"""
    # Para desarrollo, almacenar en plaintext
    # En producción, implementar hash seguro con SHA256 + salt
    return contraseña

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
