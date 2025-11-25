from fastapi import APIRouter, HTTPException, UploadFile, File, Header
from backend.models.trabajador import Trabajador
from backend.schemas.trabajador import TrabajadorCreate, TrabajadorUpdate, TrabajadorResponse
from backend.auth import verificar_token
import csv
from io import StringIO
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/trabajadores", tags=["trabajadores"])

@router.get("/", response_model=list[TrabajadorResponse])
def obtener_trabajadores():
    """Obtener todos los trabajadores"""
    trabajadores = Trabajador.objects.all()
    return [
        {
            "id": str(t.id),
            "dni": t.dni,
            "nombre_completo": t.nombre_completo,
            "fecha_ingreso": t.fecha_ingreso,
            "fecha_cese": t.fecha_cese
        }
        for t in trabajadores
    ]

@router.get("/buscar/{dni}", response_model=list[TrabajadorResponse])
def buscar_trabajador_por_dni(dni: str):
    """Busca trabajadores cuyo DNI comience con el valor proporcionado"""
    trabajadores = Trabajador.objects(dni__istartswith=dni).all()
    return [
        {
            "id": str(t.id),
            "dni": t.dni,
            "nombre_completo": t.nombre_completo,
            "fecha_ingreso": t.fecha_ingreso,
            "fecha_cese": t.fecha_cese
        }
        for t in trabajadores
    ]

@router.get("/{trabajador_id}", response_model=TrabajadorResponse)
def obtener_trabajador(trabajador_id: str):
    """Obtener trabajador por ID"""
    try:
        trabajador = Trabajador.objects(id=trabajador_id).first()
        if not trabajador:
            raise HTTPException(status_code=404, detail="Trabajador no encontrado")
        return {
            "id": str(trabajador.id),
            "dni": trabajador.dni,
            "nombre_completo": trabajador.nombre_completo,
            "fecha_ingreso": trabajador.fecha_ingreso,
            "fecha_cese": trabajador.fecha_cese
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@router.post("/", response_model=TrabajadorResponse)
def crear_trabajador(trabajador: TrabajadorCreate):
    """Crear nuevo trabajador"""
    try:
        # Verificar si el DNI ya existe
        trabajador_existente = Trabajador.objects(dni=trabajador.dni).first()
        if trabajador_existente:
            raise HTTPException(status_code=400, detail="El DNI ya existe")
        
        db_trabajador = Trabajador(**trabajador.dict())
        db_trabajador.save()
        
        return {
            "id": str(db_trabajador.id),
            "dni": db_trabajador.dni,
            "nombre_completo": db_trabajador.nombre_completo,
            "fecha_ingreso": db_trabajador.fecha_ingreso,
            "fecha_cese": db_trabajador.fecha_cese
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@router.put("/{trabajador_id}", response_model=TrabajadorResponse)
def actualizar_trabajador(trabajador_id: str, trabajador: TrabajadorUpdate):
    """Actualizar trabajador"""
    try:
        db_trabajador = Trabajador.objects(id=trabajador_id).first()
        if not db_trabajador:
            raise HTTPException(status_code=404, detail="Trabajador no encontrado")
        
        for key, value in trabajador.dict(exclude_unset=True).items():
            if value is not None:
                setattr(db_trabajador, key, value)
        
        db_trabajador.save()
        
        return {
            "id": str(db_trabajador.id),
            "dni": db_trabajador.dni,
            "nombre_completo": db_trabajador.nombre_completo,
            "fecha_ingreso": db_trabajador.fecha_ingreso,
            "fecha_cese": db_trabajador.fecha_cese
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@router.delete("/{trabajador_id}")
def eliminar_trabajador(trabajador_id: str):
    """Eliminar trabajador"""
    try:
        db_trabajador = Trabajador.objects(id=trabajador_id).first()
        if not db_trabajador:
            raise HTTPException(status_code=404, detail="Trabajador no encontrado")
        
        db_trabajador.delete()
        return {"mensaje": "Trabajador eliminado"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")


@router.post("/cargar-csv")
async def cargar_csv_trabajadores(
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(None)
):
    """
    Carga trabajadores desde CSV
    Solo acceso: Administrador
    
    Formato CSV esperado:
    dni,nombre_completo,fecha_ingreso,fecha_cese
    12345678,Juan Pérez,2022-01-15,
    87654321,María López,2021-03-20,2024-08-30
    
    Límite máximo: 10,000 filas
    """
    
    # Verificar que sea administrador
    if not authorization:
        raise HTTPException(status_code=401, detail="Token no proporcionado")
    
    # Extraer token del header (formato: Bearer <token>)
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Esquema de autenticación inválido")
    except ValueError:
        raise HTTPException(status_code=401, detail="Formato de token inválido")
    
    # Verificar token
    token_data = verificar_token(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    
    if token_data.rol != "administrador":
        raise HTTPException(status_code=403, detail="Solo administradores pueden cargar CSV")
    
    # Validar que sea archivo CSV
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Archivo debe ser CSV")
    
    # Validar tamaño del archivo (máximo 10MB)
    if file.size and file.size > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Archivo no debe superar 10MB")
    
    try:
        # Leer contenido del archivo
        contenido = await file.read()
        contenido_str = contenido.decode('utf-8')
        
        # Limpiar BOM (Byte Order Mark) si existe
        if contenido_str.startswith('\ufeff'):
            contenido_str = contenido_str[1:]
        
        # Procesar CSV con timeout implícito
        resumen = procesar_csv_trabajadores(contenido_str)
        
        return {
            "status": "success",
            "insertados": resumen["insertados"],
            "actualizados": resumen["actualizados"],
            "errores": resumen["errores"],
            "detalles": resumen["detalles"],
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="Archivo debe estar en UTF-8")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error procesando archivo: {str(e)}")


def procesar_csv_trabajadores(contenido_csv: str) -> dict:
    """
    Procesa contenido CSV y retorna resumen de cambios
    Detecta automáticamente el delimitador (coma o punto y coma)
    """
    import logging
    logger = logging.getLogger(__name__)
    
    # Detectar delimitador contando ocurrencias en la primera línea (header)
    primera_linea = contenido_csv.split('\n')[0] if contenido_csv else ""
    
    # Contar delimitadores potenciales en la línea de header
    cuenta_comas = primera_linea.count(',')
    cuenta_punto_coma = primera_linea.count(';')
    
    # Usar el que tenga más ocurrencias (más confiable)
    if cuenta_punto_coma > cuenta_comas:
        delimitador = ';'
    else:
        delimitador = ','
    
    # Crear reader con delimitador detectado
    csv_reader = csv.DictReader(StringIO(contenido_csv), delimiter=delimitador)
    
    resumen = {
        "insertados": 0,
        "actualizados": 0,
        "errores": 0,
        "detalles": []
    }
    
    # Agrupar por DNI (última fila prevalece si hay duplicados)
    filas_por_dni = {}
    errores = []
    max_filas = 10000  # Límite máximo de filas a procesar
    
    try:
        for numero_fila, fila in enumerate(csv_reader, start=2):
            # Límite máximo de filas
            if numero_fila > max_filas:
                errores.append(f"Límite máximo de {max_filas} filas excedido")
                resumen["errores"] += 1
                break
            
            if fila is None or all(v is None or str(v).strip() == '' for v in fila.values()):
                continue
                
            # Validar fila
            es_valida, error = validar_fila_csv(fila, numero_fila)
            if not es_valida:
                errores.append(error)
                resumen["errores"] += 1
                continue
            
            dni = fila['dni'].strip()
            filas_por_dni[dni] = fila  # Sobrescribe si existe (última gana)
    except Exception as e:
        logger.error(f"Error leyendo CSV: {str(e)}")
        errores.append(f"Error al leer CSV: {str(e)}")
        resumen["errores"] += 1
    
    # Procesar cambios en BD con manejo de errores
    for dni, fila in filas_por_dni.items():
        try:
            trabajador_existente = Trabajador.objects(dni=dni).first()
            
            # Limpiar valores vacíos
            nombre_completo = fila.get('nombre_completo', '').strip()
            fecha_ingreso = fila.get('fecha_ingreso', '').strip() or None
            fecha_cese = fila.get('fecha_cese', '').strip() or None
            
            if trabajador_existente:
                # UPDATE
                trabajador_existente.nombre_completo = nombre_completo
                trabajador_existente.fecha_ingreso = fecha_ingreso
                trabajador_existente.fecha_cese = fecha_cese
                trabajador_existente.save()
                resumen["actualizados"] += 1
                logger.info(f"Actualizado trabajador DNI: {dni}")
            else:
                # INSERT
                nuevo = Trabajador(
                    dni=dni,
                    nombre_completo=nombre_completo,
                    fecha_ingreso=fecha_ingreso,
                    fecha_cese=fecha_cese
                )
                nuevo.save()
                resumen["insertados"] += 1
                logger.info(f"Insertado nuevo trabajador DNI: {dni}")
        except Exception as e:
            error_msg = f"Error procesando DNI {dni}: {str(e)}"
            logger.error(error_msg)
            errores.append(error_msg)
            resumen["errores"] += 1
    
    resumen["detalles"] = errores
    return resumen


def validar_fila_csv(fila: dict, numero_fila: int) -> tuple[bool, str]:
    """
    Valida una fila del CSV
    Retorna: (es_valida, mensaje_error)
    """
    if not fila.get('dni') or not fila.get('dni').strip():
        return False, f"Fila {numero_fila}: DNI vacío"
    if not fila.get('nombre_completo') or not fila.get('nombre_completo').strip():
        return False, f"Fila {numero_fila}: Nombre completo vacío"
    
    # Las fechas se guardan como texto sin validación de formato
    return True, ""
