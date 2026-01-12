from minio import Minio
from minio.error import S3Error
import os
from datetime import timedelta
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

# Configuración de MinIO (sin defaults por seguridad)
MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT")
MINIO_PORT = os.getenv("MINIO_PORT", "443")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY")
MINIO_BUCKET = os.getenv("MINIO_BUCKET_NAME", "central-atenciones")
MINIO_USE_SSL = os.getenv("MINIO_USE_SSL", "true").lower() == "true"

# Validar credenciales requeridas
if not all([MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY]):
    raise ValueError("❌ Credenciales de MinIO no configuradas. Configura MINIO_ENDPOINT, MINIO_ACCESS_KEY y MINIO_SECRET_KEY en .env")

# Construir endpoint con puerto si es necesario
if MINIO_PORT and MINIO_PORT != "443" and MINIO_PORT != "80":
    MINIO_ENDPOINT_FULL = f"{MINIO_ENDPOINT}:{MINIO_PORT}"
else:
    MINIO_ENDPOINT_FULL = MINIO_ENDPOINT

# Cliente MinIO
minio_client = Minio(
    MINIO_ENDPOINT_FULL,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=MINIO_USE_SSL
)

def inicializar_bucket():
    """Crear bucket si no existe"""
    try:
        if not minio_client.bucket_exists(MINIO_BUCKET):
            minio_client.make_bucket(MINIO_BUCKET)
            print(f"[OK] Bucket '{MINIO_BUCKET}' creado en MinIO")
        else:
            print(f"[OK] Bucket '{MINIO_BUCKET}' ya existe en MinIO")
    except S3Error as e:
        print(f"[ERROR] No se pudo crear bucket en MinIO: {e}")

def subir_archivo(file_data, object_name: str, content_type: str, length: int):
    """Subir archivo a MinIO"""
    try:
        minio_client.put_object(
            MINIO_BUCKET,
            object_name,
            file_data,
            length,
            content_type=content_type
        )
        return True
    except S3Error as e:
        print(f"[ERROR] Error al subir archivo a MinIO: {e}")
        return False

def obtener_url_descarga(object_name: str, expiry: timedelta = timedelta(hours=1)):
    """Generar URL pre-firmada para descarga"""
    try:
        url = minio_client.presigned_get_object(
            MINIO_BUCKET,
            object_name,
            expires=expiry
        )
        return url
    except S3Error as e:
        print(f"[ERROR] Error al generar URL de descarga: {e}")
        return None

def eliminar_archivo(object_name: str):
    """Eliminar archivo de MinIO"""
    try:
        minio_client.remove_object(MINIO_BUCKET, object_name)
        return True
    except S3Error as e:
        print(f"[ERROR] Error al eliminar archivo: {e}")
        return False

def descargar_archivo(object_name: str):
    """Descargar archivo de MinIO"""
    try:
        response = minio_client.get_object(MINIO_BUCKET, object_name)
        return response
    except S3Error as e:
        print(f"[ERROR] Error al descargar archivo: {e}")
        return None
