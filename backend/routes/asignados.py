from fastapi import APIRouter, HTTPException, UploadFile, File, Header
from backend.models.asignado import Asignado
from backend.schemas.asignado import AsignadoCreate, AsignadoUpdate, AsignadoResponse
from backend.auth import verificar_token
import csv
from io import StringIO
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/asignados", tags=["asignados"])

@router.get("/", response_model=list[AsignadoResponse])
def obtener_asignados():
    """Obtener todos los asignados"""
    asignados = Asignado.objects.all()
    return [
        {
            "id": str(a.id),
            "dni": a.dni,
            "tipo_compania": a.tipo_compania,
            "nombre_completo": a.nombre_completo,
            "fecha_ingreso": a.fecha_ingreso,
            "cliente": a.cliente,
            "zona": a.zona,
            "lider_zonal": a.lider_zonal,
            "jefe_operaciones": a.jefe_operaciones,
            "macrozona": a.macrozona,
            "jurisdiccion": a.jurisdiccion,
            "sector": a.sector,
            "unidad": a.unidad,
            "estado": a.estado
        }
        for a in asignados
    ]

@router.get("/activos", response_model=list[AsignadoResponse])
def obtener_asignados_activos():
    """Obtener solo asignados activos"""
    asignados = Asignado.objects(estado="activo").all()
    return [
        {
            "id": str(a.id),
            "dni": a.dni,
            "tipo_compania": a.tipo_compania,
            "nombre_completo": a.nombre_completo,
            "fecha_ingreso": a.fecha_ingreso,
            "cliente": a.cliente,
            "zona": a.zona,
            "lider_zonal": a.lider_zonal,
            "jefe_operaciones": a.jefe_operaciones,
            "macrozona": a.macrozona,
            "jurisdiccion": a.jurisdiccion,
            "sector": a.sector,
            "unidad": a.unidad,
            "estado": a.estado
        }
        for a in asignados
    ]

@router.get("/buscar/{dni}", response_model=list[AsignadoResponse])
def buscar_asignado_por_dni(dni: str):
    """Busca asignados cuyo DNI comience con el valor proporcionado"""
    asignados = Asignado.objects(dni__istartswith=dni).all()
    return [
        {
            "id": str(a.id),
            "dni": a.dni,
            "tipo_compania": a.tipo_compania,
            "nombre_completo": a.nombre_completo,
            "fecha_ingreso": a.fecha_ingreso,
            "cliente": a.cliente,
            "zona": a.zona,
            "lider_zonal": a.lider_zonal,
            "jefe_operaciones": a.jefe_operaciones,
            "macrozona": a.macrozona,
            "jurisdiccion": a.jurisdiccion,
            "sector": a.sector,
            "unidad": a.unidad,
            "estado": a.estado
        }
        for a in asignados
    ]

@router.get("/buscar/clientes/{texto}")
def buscar_clientes(texto: str):
    """Busca clientes únicos en la tabla asignados que contengan el texto proporcionado"""
    # Buscar asignados activos que tengan cliente y que contenga el texto
    asignados = Asignado.objects(
        cliente__icontains=texto,
        estado="activo",
        cliente__ne=None
    ).only('cliente').all()
    
    # Obtener lista única de clientes
    clientes_unicos = list(set([a.cliente for a in asignados if a.cliente and a.cliente.strip()]))
    clientes_unicos.sort()
    
    return {"clientes": clientes_unicos}

@router.get("/buscar/lideres/{texto}")
def buscar_lideres_zonales(texto: str):
    """Busca líderes zonales únicos en la tabla asignados que contengan el texto proporcionado"""
    # Buscar asignados activos que tengan lider_zonal y que contenga el texto
    asignados = Asignado.objects(
        lider_zonal__icontains=texto,
        estado="activo",
        lider_zonal__ne=None
    ).only('lider_zonal').all()
    
    # Obtener lista única de líderes zonales
    lideres_unicos = list(set([a.lider_zonal for a in asignados if a.lider_zonal and a.lider_zonal.strip()]))
    lideres_unicos.sort()
    
    return {"lideres": lideres_unicos}

@router.get("/buscar/unidades/{texto}")
def buscar_unidades(texto: str):
    """Busca unidades únicas en la tabla asignados que contengan el texto proporcionado"""
    # Buscar asignados activos que tengan unidad y que contenga el texto
    asignados = Asignado.objects(
        unidad__icontains=texto,
        estado="activo",
        unidad__ne=None
    ).only('unidad').all()
    
    # Obtener lista única de unidades
    unidades_unicas = list(set([a.unidad for a in asignados if a.unidad and a.unidad.strip()]))
    unidades_unicas.sort()
    
    return {"unidades": unidades_unicas}

@router.get("/{asignado_id}", response_model=AsignadoResponse)
def obtener_asignado(asignado_id: str):
    """Obtener asignado por ID"""
    try:
        asignado = Asignado.objects(id=asignado_id).first()
        if not asignado:
            raise HTTPException(status_code=404, detail="Asignado no encontrado")
        return {
            "id": str(asignado.id),
            "dni": asignado.dni,
            "tipo_compania": asignado.tipo_compania,
            "nombre_completo": asignado.nombre_completo,
            "fecha_ingreso": asignado.fecha_ingreso,
            "cliente": asignado.cliente,
            "zona": asignado.zona,
            "lider_zonal": asignado.lider_zonal,
            "jefe_operaciones": asignado.jefe_operaciones,
            "macrozona": asignado.macrozona,
            "jurisdiccion": asignado.jurisdiccion,
            "sector": asignado.sector,
            "unidad": asignado.unidad,
            "estado": asignado.estado
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@router.post("/", response_model=AsignadoResponse)
def crear_asignado(asignado: AsignadoCreate):
    """Crear nuevo asignado"""
    try:
        # Verificar si el DNI ya existe
        asignado_existente = Asignado.objects(dni=asignado.dni).first()
        if asignado_existente:
            raise HTTPException(status_code=400, detail="El DNI ya existe en asignados")
        
        db_asignado = Asignado(**asignado.dict())
        db_asignado.save()
        
        return {
            "id": str(db_asignado.id),
            "dni": db_asignado.dni,
            "tipo_compania": db_asignado.tipo_compania,
            "nombre_completo": db_asignado.nombre_completo,
            "fecha_ingreso": db_asignado.fecha_ingreso,
            "cliente": db_asignado.cliente,
            "zona": db_asignado.zona,
            "lider_zonal": db_asignado.lider_zonal,
            "jefe_operaciones": db_asignado.jefe_operaciones,
            "macrozona": db_asignado.macrozona,
            "jurisdiccion": db_asignado.jurisdiccion,
            "sector": db_asignado.sector,
            "estado": db_asignado.estado
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@router.put("/{asignado_id}", response_model=AsignadoResponse)
def actualizar_asignado(asignado_id: str, asignado: AsignadoUpdate):
    """Actualizar asignado"""
    try:
        db_asignado = Asignado.objects(id=asignado_id).first()
        if not db_asignado:
            raise HTTPException(status_code=404, detail="Asignado no encontrado")
        
        for key, value in asignado.dict(exclude_unset=True).items():
            if value is not None:
                setattr(db_asignado, key, value)
        
        db_asignado.save()
        
        return {
            "id": str(db_asignado.id),
            "dni": db_asignado.dni,
            "tipo_compania": db_asignado.tipo_compania,
            "nombre_completo": db_asignado.nombre_completo,
            "fecha_ingreso": db_asignado.fecha_ingreso,
            "cliente": db_asignado.cliente,
            "zona": db_asignado.zona,
            "lider_zonal": db_asignado.lider_zonal,
            "jefe_operaciones": db_asignado.jefe_operaciones,
            "macrozona": db_asignado.macrozona,
            "jurisdiccion": db_asignado.jurisdiccion,
            "sector": db_asignado.sector,
            "estado": db_asignado.estado
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@router.delete("/{asignado_id}")
def eliminar_asignado(asignado_id: str):
    """Eliminar asignado"""
    try:
        db_asignado = Asignado.objects(id=asignado_id).first()
        if not db_asignado:
            raise HTTPException(status_code=404, detail="Asignado no encontrado")
        
        db_asignado.delete()
        return {"mensaje": "Asignado eliminado"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")


@router.post("/cargar-csv")
async def cargar_csv_asignados(
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(None)
):
    """
    Carga asignados desde CSV
    Solo acceso: Administrador
    
    Formato CSV esperado:
    tipo_compania,nombre_completo,dni,fecha_ingreso,cliente,zona,lider_zonal,jefe_operaciones,macrozona,jurisdiccion,sector
    
    Límites:
    - Máximo: 100,000 filas por archivo
    - Máximo: 50MB por archivo
    - Delimitadores: Coma (,) o Punto y coma (;)
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
    
    # Validar tamaño del archivo (máximo 50MB)
    if file.size and file.size > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Archivo no debe superar 50MB")
    
    try:
        # Leer contenido del archivo
        contenido = await file.read()
        contenido_str = contenido.decode('utf-8')
        
        # Limpiar BOM (Byte Order Mark) si existe
        if contenido_str.startswith('\ufeff'):
            contenido_str = contenido_str[1:]
        
        # Procesar CSV
        resumen = procesar_csv_asignados(contenido_str)
        
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


def procesar_csv_asignados(contenido_csv: str) -> dict:
    """
    Procesa contenido CSV y retorna resumen de cambios
    Detecta automáticamente el delimitador (coma o punto y coma)
    OPTIMIZADO: Usa operaciones en lote para mejor rendimiento
    """
    from pymongo import MongoClient
    from pymongo.errors import BulkWriteError
    
    # Detectar delimitador contando ocurrencias en la primera línea (header)
    primera_linea = contenido_csv.split('\n')[0] if contenido_csv else ""
    
    # Contar delimitadores potenciales
    cuenta_comas = primera_linea.count(',')
    cuenta_punto_coma = primera_linea.count(';')
    
    # Usar el que tenga más ocurrencias
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
    max_filas = 100000  # Límite máximo de filas a procesar
    
    try:
        for numero_fila, fila in enumerate(csv_reader, start=2):
            # Límite máximo de filas
            if numero_fila > max_filas:
                errores.append(f"Límite máximo de {max_filas} filas excedido")
                resumen["errores"] += 1
                break
            
            # Validar fila
            es_valida, error = validar_fila_csv(fila, numero_fila)
            if not es_valida:
                errores.append(error)
                resumen["errores"] += 1
                continue
            
            dni = fila['dni'].strip()
            filas_por_dni[dni] = fila  # Sobrescribe si existe (última gana)
    except Exception as e:
        errores.append(f"Error al leer CSV: {str(e)}")
        resumen["errores"] += 1
    
    # OPTIMIZADO: Procesar en lotes usando MongoDB directly
    if filas_por_dni:
        try:
            client = MongoClient(
                f"mongodb://root:Jdg27aCQqOzR@nexus.liderman.net.pe:27017/central_db?authSource=admin"
            )
            db = client['central_db']
            collection = db['asignados']
            
            # Preparar operaciones para bulk write
            from pymongo import InsertOne, UpdateOne
            operaciones = []
            
            for dni, fila in filas_por_dni.items():
                nombre_completo = fila.get('nombre_completo', '').strip()
                tipo_compania = fila.get('tipo_compania', '').strip() or None
                fecha_ingreso = fila.get('fecha_ingreso', '').strip() or None
                cliente = fila.get('cliente', '').strip() or None
                zona = fila.get('zona', '').strip() or None
                lider_zonal = fila.get('lider_zonal', '').strip() or None
                jefe_operaciones = fila.get('jefe_operaciones', '').strip() or None
                macrozona = fila.get('macrozona', '').strip() or None
                jurisdiccion = fila.get('jurisdiccion', '').strip() or None
                sector = fila.get('sector', '').strip() or None
                unidad = fila.get('unidad', '').strip() or None
                
                # Usar upsert para combinar INSERT y UPDATE en una operación
                operaciones.append(
                    UpdateOne(
                        {'dni': dni},
                        {
                            '$set': {
                                'tipo_compania': tipo_compania,
                                'nombre_completo': nombre_completo,
                                'fecha_ingreso': fecha_ingreso,
                                'cliente': cliente,
                                'zona': zona,
                                'lider_zonal': lider_zonal,
                                'jefe_operaciones': jefe_operaciones,
                                'macrozona': macrozona,
                                'jurisdiccion': jurisdiccion,
                                'sector': sector,
                                'unidad': unidad,
                                'estado': 'activo'
                            }
                        },
                        upsert=True
                    )
                )
            
            # Ejecutar operaciones en lote
            if operaciones:
                resultado = collection.bulk_write(operaciones, ordered=False)
                resumen["insertados"] = resultado.upserted_count
                resumen["actualizados"] = resultado.modified_count
            
            client.close()
            
        except BulkWriteError as e:
            # Algunos documentos pudieron tener problemas
            errores.append(f"Algunos registros no pudieron procesarse")
            resumen["errores"] += 1
        except Exception as e:
            errores.append(f"Error en procesamiento de lote: {str(e)}")
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
    
    # Sin validaciones adicionales
    return True, ""
