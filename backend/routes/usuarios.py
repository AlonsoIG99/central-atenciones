from fastapi import APIRouter, HTTPException, Request
from backend.models.usuario import Usuario
from backend.schemas.usuario import UsuarioCreate, UsuarioUpdate, UsuarioResponse
from backend.auth import obtener_hash_contraseña, verificar_token
from mongoengine import NotUniqueError

router = APIRouter(prefix="/usuarios", tags=["usuarios"])

@router.get("/", response_model=list[UsuarioResponse])
def obtener_usuarios():
    """Obtener todos los usuarios"""
    usuarios = Usuario.objects.all()
    return [
        {
            "id": str(u.id),
            "nombre": u.nombre,
            "email": u.email,
            "contraseña": u.contraseña,
            "rol": u.rol,
            "area": u.area,
            "fecha_creacion": u.fecha_creacion
        }
        for u in usuarios
    ]

@router.get("/{usuario_id}", response_model=UsuarioResponse)
def obtener_usuario(usuario_id: str):
    """Obtener usuario por ID"""
    try:
        usuario = Usuario.objects(id=usuario_id).first()
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return {
            "id": str(usuario.id),
            "nombre": usuario.nombre,
            "email": usuario.email,
            "contraseña": usuario.contraseña,
            "rol": usuario.rol,
            "area": usuario.area,
            "fecha_creacion": usuario.fecha_creacion
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@router.post("/", response_model=UsuarioResponse)
def crear_usuario(usuario: UsuarioCreate, request: Request = None):
    """Crear nuevo usuario (solo administrador)"""
    auth_header = request.headers.get("authorization") if request else None
    
    if not auth_header:
        raise HTTPException(status_code=401, detail="Token no proporcionado")
    
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Formato de token inválido")
    
    token = auth_header.replace("Bearer ", "").strip()
    token_data = verificar_token(token)
    
    if not token_data:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    
    if token_data.rol != "administrador":
        raise HTTPException(status_code=403, detail="Solo los administradores pueden crear usuarios")
    
    try:
        # Hashear contraseña
        usuario_dict = usuario.dict()
        usuario_dict['contraseña'] = obtener_hash_contraseña(usuario_dict['contraseña'])
        
        # Crear usuario en MongoDB
        db_usuario = Usuario(**usuario_dict)
        db_usuario.save()
        
        return {
            "id": str(db_usuario.id),
            "nombre": db_usuario.nombre,
            "email": db_usuario.email,
            "contraseña": db_usuario.contraseña,
            "rol": db_usuario.rol,
            "area": db_usuario.area,
            "fecha_creacion": db_usuario.fecha_creacion
        }
    except NotUniqueError:
        raise HTTPException(status_code=400, detail="El email ya existe")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@router.put("/{usuario_id}", response_model=UsuarioResponse)
def actualizar_usuario(usuario_id: str, usuario: UsuarioUpdate):
    """Actualizar usuario"""
    try:
        db_usuario = Usuario.objects(id=usuario_id).first()
        if not db_usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        for key, value in usuario.dict(exclude_unset=True).items():
            if key == 'contraseña' and value:
                value = obtener_hash_contraseña(value)
            if value is not None:
                setattr(db_usuario, key, value)
        
        db_usuario.save()
        
        return {
            "id": str(db_usuario.id),
            "nombre": db_usuario.nombre,
            "email": db_usuario.email,
            "contraseña": db_usuario.contraseña,
            "rol": db_usuario.rol,
            "area": db_usuario.area,
            "fecha_creacion": db_usuario.fecha_creacion
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@router.delete("/{usuario_id}")
def eliminar_usuario(usuario_id: str):
    """Eliminar usuario"""
    try:
        db_usuario = Usuario.objects(id=usuario_id).first()
        if not db_usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        db_usuario.delete()
        return {"mensaje": "Usuario eliminado"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

