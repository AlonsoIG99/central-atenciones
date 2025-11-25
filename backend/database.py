from mongoengine import connect
import os

# Configuración de conexión a MongoDB
MONGODB_HOST = os.getenv("MONGODB_HOST", "nexus.liderman.net.pe")
MONGODB_PORT = int(os.getenv("MONGODB_PORT", 27017))
MONGODB_USER = os.getenv("MONGODB_USER", "root")
MONGODB_PASSWORD = os.getenv("MONGODB_PASSWORD", "Jdg27aCQqOzR")
MONGODB_DB = os.getenv("MONGODB_DB", "central_db")

# Conectar a MongoDB
def conectar_db():
    """Conecta a la base de datos MongoDB"""
    try:
        connect(
            db=MONGODB_DB,
            host=MONGODB_HOST,
            port=MONGODB_PORT,
            username=MONGODB_USER,
            password=MONGODB_PASSWORD,
            authSource="admin",  # Base de datos para autenticación
            uuidRepresentation="standard"
        )
        print(f"[OK] Conectado a MongoDB: {MONGODB_HOST}:{MONGODB_PORT}/{MONGODB_DB}")
    except Exception as e:
        print(f"[ERROR] Error conectando a MongoDB: {e}")
        raise

# Llamar al conectar en el inicio de la app
conectar_db()
