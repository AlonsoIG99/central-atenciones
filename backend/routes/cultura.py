from fastapi import APIRouter, HTTPException
from models.cliente import Cliente
from models.unidad import Unidad
from models.lider import Lider
from models.visita import Visita
from models.atencion_cultura import AtencionCultura
from models.trabajador import Trabajador
from schemas.cultura import (
    ClienteCreate, ClienteResponse,
    UnidadCreate, UnidadResponse,
    LiderCreate, LiderResponse,
    VisitaCreate, VisitaUpdate, VisitaResponse,
    AtencionCulturaCreate, AtencionCulturaUpdate, AtencionCulturaResponse
)
from datetime import datetime, timedelta

router = APIRouter(prefix="/cultura", tags=["cultura"])

# ========== CLIENTES ==========
@router.get("/clientes", response_model=list[ClienteResponse])
def obtener_clientes():
    """Obtener todos los clientes"""
    clientes = Cliente.objects.all()
    return [ClienteResponse(id=str(c.id), nombre=c.nombre) for c in clientes]

@router.post("/clientes", response_model=ClienteResponse)
def crear_cliente(cliente: ClienteCreate):
    """Crear nuevo cliente"""
    try:
        db_cliente = Cliente(**cliente.dict())
        db_cliente.save()
        return ClienteResponse(id=str(db_cliente.id), nombre=db_cliente.nombre)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@router.delete("/clientes/{cliente_id}")
def eliminar_cliente(cliente_id: str):
    """Eliminar cliente"""
    try:
        cliente = Cliente.objects(id=cliente_id).first()
        if not cliente:
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
        cliente.delete()
        return {"message": "Cliente eliminado"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

# ========== UNIDADES ==========
@router.get("/unidades", response_model=list[UnidadResponse])
def obtener_unidades():
    """Obtener todas las unidades"""
    unidades = Unidad.objects.all()
    return [UnidadResponse(id=str(u.id), nombre=u.nombre) for u in unidades]

@router.post("/unidades", response_model=UnidadResponse)
def crear_unidad(unidad: UnidadCreate):
    """Crear nueva unidad"""
    try:
        db_unidad = Unidad(**unidad.dict())
        db_unidad.save()
        return UnidadResponse(id=str(db_unidad.id), nombre=db_unidad.nombre)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@router.delete("/unidades/{unidad_id}")
def eliminar_unidad(unidad_id: str):
    """Eliminar unidad"""
    try:
        unidad = Unidad.objects(id=unidad_id).first()
        if not unidad:
            raise HTTPException(status_code=404, detail="Unidad no encontrada")
        unidad.delete()
        return {"message": "Unidad eliminada"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

# ========== LIDERES ==========
@router.get("/lideres", response_model=list[LiderResponse])
def obtener_lideres():
    """Obtener todos los líderes zonales"""
    lideres = Lider.objects.all()
    return [LiderResponse(id=str(l.id), nombre=l.nombre) for l in lideres]

@router.post("/lideres", response_model=LiderResponse)
def crear_lider(lider: LiderCreate):
    """Crear nuevo líder zonal"""
    try:
        db_lider = Lider(**lider.dict())
        db_lider.save()
        return LiderResponse(id=str(db_lider.id), nombre=db_lider.nombre)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@router.delete("/lideres/{lider_id}")
def eliminar_lider(lider_id: str):
    """Eliminar líder zonal"""
    try:
        lider = Lider.objects(id=lider_id).first()
        if not lider:
            raise HTTPException(status_code=404, detail="Líder no encontrado")
        lider.delete()
        return {"message": "Líder eliminado"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

# ========== VISITAS ==========
@router.get("/visitas", response_model=list[VisitaResponse])
def obtener_visitas():
    """Obtener todas las visitas"""
    visitas = Visita.objects.all().order_by('-fecha_visita')
    resultado = []
    for visita in visitas:
        data = {
            "id": str(visita.id),
            "cliente": visita.cliente,
            "fecha_visita": visita.fecha_visita,
            "unidad": visita.unidad,
            "lider_zonal": visita.lider_zonal,
            "comentario": visita.comentario,
            "usuario_id": visita.usuario_id,
            "fecha_creacion": visita.fecha_creacion
        }
        resultado.append(VisitaResponse(**data))
    return resultado

@router.get("/visitas/{visita_id}", response_model=VisitaResponse)
def obtener_visita(visita_id: str):
    """Obtener visita por ID"""
    try:
        visita = Visita.objects(id=visita_id).first()
        if not visita:
            raise HTTPException(status_code=404, detail="Visita no encontrada")
        
        data = {
            "id": str(visita.id),
            "cliente": visita.cliente,
            "fecha_visita": visita.fecha_visita,
            "unidad": visita.unidad,
            "lider_zonal": visita.lider_zonal,
            "comentario": visita.comentario,
            "usuario_id": visita.usuario_id,
            "fecha_creacion": visita.fecha_creacion
        }
        return VisitaResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@router.post("/visitas", response_model=VisitaResponse)
def crear_visita(visita: VisitaCreate):
    """Crear nueva visita"""
    try:
        db_visita = Visita(**visita.dict())
        db_visita.save()
        
        data = {
            "id": str(db_visita.id),
            "cliente": db_visita.cliente,
            "fecha_visita": db_visita.fecha_visita,
            "unidad": db_visita.unidad,
            "lider_zonal": db_visita.lider_zonal,
            "comentario": db_visita.comentario,
            "usuario_id": db_visita.usuario_id,
            "fecha_creacion": db_visita.fecha_creacion
        }
        return VisitaResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@router.put("/visitas/{visita_id}", response_model=VisitaResponse)
def actualizar_visita(visita_id: str, visita: VisitaUpdate):
    """Actualizar visita"""
    try:
        db_visita = Visita.objects(id=visita_id).first()
        if not db_visita:
            raise HTTPException(status_code=404, detail="Visita no encontrada")
        
        for key, value in visita.dict(exclude_unset=True).items():
            if value is not None:
                setattr(db_visita, key, value)
        
        db_visita.save()
        
        data = {
            "id": str(db_visita.id),
            "cliente": db_visita.cliente,
            "fecha_visita": db_visita.fecha_visita,
            "unidad": db_visita.unidad,
            "lider_zonal": db_visita.lider_zonal,
            "comentario": db_visita.comentario,
            "usuario_id": db_visita.usuario_id,
            "fecha_creacion": db_visita.fecha_creacion
        }
        return VisitaResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@router.delete("/visitas/{visita_id}")
def eliminar_visita(visita_id: str):
    """Eliminar visita"""
    try:
        visita = Visita.objects(id=visita_id).first()
        if not visita:
            raise HTTPException(status_code=404, detail="Visita no encontrada")
        visita.delete()
        return {"message": "Visita eliminada"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

# ========== ATENCIONES CULTURA ==========
@router.get("/atenciones", response_model=list[AtencionCulturaResponse])
def obtener_atenciones_cultura():
    """Obtener todas las atenciones de cultura"""
    atenciones = AtencionCultura.objects.all().order_by('-fecha_creacion')
    resultado = []
    for atencion in atenciones:
        data = {
            "id": str(atencion.id),
            "visita_id": atencion.visita_id,
            "dni": atencion.dni,
            "nombre_trabajador": atencion.nombre_trabajador if hasattr(atencion, 'nombre_trabajador') else None,
            "derivacion": atencion.derivacion,
            "comentario": atencion.comentario,
            "estado": atencion.estado,
            "usuario_id": atencion.usuario_id,
            "fecha_creacion": atencion.fecha_creacion,
            "fecha_cierre": atencion.fecha_cierre,
            "dias_abierta": atencion.dias_abierta
        }
        resultado.append(AtencionCulturaResponse(**data))
    return resultado

@router.post("/atenciones", response_model=AtencionCulturaResponse)
def crear_atencion_cultura(atencion: AtencionCulturaCreate):
    """Crear nueva atención de cultura"""
    try:
        # Buscar el nombre del trabajador por DNI
        trabajador = Trabajador.objects(dni=atencion.dni).first()
        if trabajador:
            atencion.nombre_trabajador = trabajador.nombre_completo
        
        db_atencion = AtencionCultura(**atencion.dict())
        db_atencion.save()
        
        data = {
            "id": str(db_atencion.id),
            "visita_id": db_atencion.visita_id,
            "dni": db_atencion.dni,
            "nombre_trabajador": db_atencion.nombre_trabajador,
            "derivacion": db_atencion.derivacion,
            "comentario": db_atencion.comentario,
            "estado": db_atencion.estado,
            "usuario_id": db_atencion.usuario_id,
            "fecha_creacion": db_atencion.fecha_creacion,
            "fecha_cierre": db_atencion.fecha_cierre,
            "dias_abierta": db_atencion.dias_abierta
        }
        return AtencionCulturaResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@router.put("/atenciones/{atencion_id}", response_model=AtencionCulturaResponse)
def actualizar_atencion_cultura(atencion_id: str, atencion: AtencionCulturaUpdate):
    """Actualizar atención de cultura"""
    try:
        db_atencion = AtencionCultura.objects(id=atencion_id).first()
        if not db_atencion:
            raise HTTPException(status_code=404, detail="Atención no encontrada")
        
        # Si se cambia a cerrada, calcular dias_abierta
        if atencion.estado == "cerrada" and db_atencion.estado != "cerrada":
            hora_actual_peru = datetime.utcnow() - timedelta(hours=5)
            db_atencion.fecha_cierre = hora_actual_peru
            dias = (db_atencion.fecha_cierre - db_atencion.fecha_creacion).days
            db_atencion.dias_abierta = str(dias)
        
        for key, value in atencion.dict(exclude_unset=True).items():
            if value is not None:
                setattr(db_atencion, key, value)
        
        db_atencion.save()
        
        data = {
            "id": str(db_atencion.id),
            "visita_id": db_atencion.visita_id,
            "dni": db_atencion.dni,
            "nombre_trabajador": db_atencion.nombre_trabajador if hasattr(db_atencion, 'nombre_trabajador') else None,
            "derivacion": db_atencion.derivacion,
            "comentario": db_atencion.comentario,
            "estado": db_atencion.estado,
            "usuario_id": db_atencion.usuario_id,
            "fecha_creacion": db_atencion.fecha_creacion,
            "fecha_cierre": db_atencion.fecha_cierre,
            "dias_abierta": db_atencion.dias_abierta
        }
        return AtencionCulturaResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@router.delete("/atenciones/{atencion_id}")
def eliminar_atencion_cultura(atencion_id: str):
    """Eliminar atención de cultura"""
    try:
        atencion = AtencionCultura.objects(id=atencion_id).first()
        if not atencion:
            raise HTTPException(status_code=404, detail="Atención no encontrada")
        atencion.delete()
        return {"message": "Atención eliminada"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")
