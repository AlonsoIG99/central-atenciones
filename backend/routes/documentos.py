from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form, Depends
from fastapi.responses import StreamingResponse
import sys
from pathlib import Path
import uuid
from datetime import datetime

# Agregar backend al path
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.models.documento import Documento
from backend.minio_config import subir_archivo, obtener_url_descarga, descargar_archivo, eliminar_archivo
from backend.auth import verificar_token

router = APIRouter(prefix="/documentos", tags=["documentos"])

TIPOS_PERMITIDOS = ["application/pdf"]
TAMANO_MAXIMO = 10 * 1024 * 1024  # 10 MB

@router.post("/{atencion_id}")
async def subir_documento_atencion(
    atencion_id: str,
    file: UploadFile = File(None)
):
    """
    Subir documento PDF para una atención (endpoint para formulario) - SIN AUTENTICACIÓN TEMPORAL
    """
    print(f"[DEBUG] ===== INICIANDO SUBIDA DE DOCUMENTO =====")
    print(f"[DEBUG] Atención ID: {atencion_id}")
    print(f"[DEBUG] File object: {file}")
    
    try:
        if not file:
            print("[DEBUG] No se recibió archivo")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se recibió ningún archivo"
            )
        
        print(f"[DEBUG] Archivo recibido: {file.filename}")
        print(f"[DEBUG] Content-Type: {file.content_type}")
        
        # Validar tipo de archivo
        if file.content_type not in TIPOS_PERMITIDOS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tipo de archivo no permitido. Solo se aceptan PDF. Recibido: {file.content_type}"
            )
        
        # Leer archivo
        contenido = await file.read()
        tamano = len(contenido)
        
        # Validar tamaño
        if tamano > TAMANO_MAXIMO:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Archivo muy grande. Máximo 10 MB"
            )
        
        # Generar nombre único
        extension = file.filename.split('.')[-1]
        nombre_unico = f"{atencion_id}_{uuid.uuid4().hex}.{extension}"
        ruta_minio = f"prestamos/{nombre_unico}"
        
        # Subir a MinIO
        from io import BytesIO
        file_data = BytesIO(contenido)
        
        exito = subir_archivo(
            file_data=file_data,
            object_name=ruta_minio,
            content_type=file.content_type,
            length=tamano
        )
        
        if not exito:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al subir archivo a MinIO"
            )
        
        # Usuario temporal (sin autenticación por ahora)
        usuario_id = "sistema"
        
        # Guardar registro en MongoDB
        documento = Documento(
            atencion_id=atencion_id,
            nombre_archivo=nombre_unico,
            nombre_original=file.filename,
            ruta_minio=ruta_minio,
            tipo_archivo=file.content_type,
            tamaño=tamano,
            usuario_subio=usuario_id
        )
        documento.save()
        
        return {
            "message": "Documento subido exitosamente",
            "documento_id": str(documento.id),
            "nombre_archivo": nombre_unico
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR al subir documento: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno: {str(e)}"
        )

@router.post("/subir")
async def subir_documento(
    atencion_id: str = Form(...),
    usuario_id: str = Form(...),
    archivo: UploadFile = File(...),
    token_data: dict = Depends(verificar_token)
):
    """
    Subir documento PDF para una atención (endpoint legacy)
    """
    try:
        # Validar tipo de archivo
        if archivo.content_type not in TIPOS_PERMITIDOS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tipo de archivo no permitido. Solo se aceptan PDF"
            )
        
        # Leer archivo
        contenido = await archivo.read()
        tamano = len(contenido)
        
        # Validar tamaño
        if tamano > TAMANO_MAXIMO:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Archivo muy grande. Máximo 10 MB"
            )
        
        # Generar nombre único
        extension = archivo.filename.split('.')[-1]
        nombre_unico = f"{atencion_id}_{uuid.uuid4().hex}.{extension}"
        ruta_minio = f"prestamos/{nombre_unico}"
        
        # Subir a MinIO
        from io import BytesIO
        file_data = BytesIO(contenido)
        
        exito = subir_archivo(
            file_data=file_data,
            object_name=ruta_minio,
            content_type=archivo.content_type,
            length=tamano
        )
        
        if not exito:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al subir archivo a MinIO"
            )
        
        # Guardar registro en MongoDB
        documento = Documento(
            atencion_id=atencion_id,
            nombre_archivo=nombre_unico,
            nombre_original=archivo.filename,
            ruta_minio=ruta_minio,
            tipo_archivo=archivo.content_type,
            tamaño=tamano,
            usuario_subio=usuario_id
        )
        documento.save()
        
        return {
            "message": "Documento subido exitosamente",
            "documento_id": str(documento.id),
            "nombre_archivo": nombre_unico
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR al subir documento: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno: {str(e)}"
        )

@router.get("/atencion/{atencion_id}")
def obtener_documentos_atencion(
    atencion_id: str
):
    """
    Obtener documentos de una atención - SIN AUTENTICACIÓN TEMPORAL
    """
    try:
        documentos = Documento.objects(atencion_id=atencion_id)
        
        # Generar URLs de descarga
        resultado = []
        for doc in documentos:
            url_descarga = obtener_url_descarga(doc.ruta_minio)
            doc_dict = doc.to_dict()
            doc_dict['url_descarga'] = url_descarga
            resultado.append(doc_dict)
        
        return resultado
        
    except Exception as e:
        print(f"ERROR al obtener documentos: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno: {str(e)}"
        )

@router.get("/descargar/{documento_id}")
def descargar_documento(
    documento_id: str,
    token_data: dict = Depends(verificar_token)
):
    """
    Descargar documento
    """
    try:
        documento = Documento.objects(id=documento_id).first()
        
        if not documento:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Documento no encontrado"
            )
        
        # Descargar de MinIO
        file_data = descargar_archivo(documento.ruta_minio)
        
        if not file_data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al descargar archivo de MinIO"
            )
        
        return StreamingResponse(
            file_data,
            media_type=documento.tipo_archivo,
            headers={
                "Content-Disposition": f'attachment; filename="{documento.nombre_original}"'
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR al descargar documento: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno: {str(e)}"
        )

@router.delete("/{documento_id}")
def eliminar_documento(
    documento_id: str,
    token_data: dict = Depends(verificar_token)
):
    """
    Eliminar documento (solo administradores)
    """
    try:
        if token_data.get("rol") != "administrador":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo administradores pueden eliminar documentos"
            )
        
        documento = Documento.objects(id=documento_id).first()
        
        if not documento:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Documento no encontrado"
            )
        
        # Eliminar de MinIO
        eliminar_archivo(documento.ruta_minio)
        
        # Eliminar registro de MongoDB
        documento.delete()
        
        return {"message": "Documento eliminado exitosamente"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR al eliminar documento: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno: {str(e)}"
        )
