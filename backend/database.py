from mongoengine import connect
import os
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

# Configuración de conexión a MongoDB (sin defaults por seguridad)
MONGODB_HOST = os.getenv("MONGODB_HOST")
MONGODB_PORT = int(os.getenv("MONGODB_PORT", "27017"))
MONGODB_USER = os.getenv("MONGODB_USER")
MONGODB_PASSWORD = os.getenv("MONGODB_PASSWORD")
MONGODB_DB = os.getenv("MONGODB_DB", "central_db")

# Validar credenciales requeridas
if not all([MONGODB_HOST, MONGODB_USER, MONGODB_PASSWORD]):
    raise ValueError("❌ Credenciales de MongoDB no configuradas. Configura MONGODB_HOST, MONGODB_USER y MONGODB_PASSWORD en .env")

# Conectar a MongoDB
def conectar_db():
    """Conecta a la base de datos MongoDB con timeouts de seguridad"""
    try:
        connect(
            db=MONGODB_DB,
            host=MONGODB_HOST,
            port=MONGODB_PORT,
            username=MONGODB_USER,
            password=MONGODB_PASSWORD,
            authSource="admin",
            uuidRepresentation="standard",
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=10000,
            socketTimeoutMS=30000,
            maxPoolSize=50,
            minPoolSize=10
        )
        print(f"[OK] Conectado a MongoDB: {MONGODB_HOST}:{MONGODB_PORT}/{MONGODB_DB}")
    except Exception as e:
        print(f"[ERROR] Error conectando a MongoDB: {e}")
        raise

# Llamar al conectar en el inicio de la app
conectar_db()
    