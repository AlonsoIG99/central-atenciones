"""
Script de prueba de conexión a MongoDB
Ejecutar: python test_mongodb_connection.py
"""

from mongoengine import connect, disconnect
import os

# Datos de conexión
MONGODB_HOST = "nexus.liderman.net.pe"
MONGODB_PORT = 27017
MONGODB_USER = "root"
MONGODB_PASSWORD = "Jdg27aCQqOzR"
MONGODB_DB = "central_db"

print("=" * 60)
print("PRUEBA DE CONEXIÓN A MONGODB")
print("=" * 60)

try:
    print(f"\n📍 Host: {MONGODB_HOST}:{MONGODB_PORT}")
    print(f"📍 Database: {MONGODB_DB}")
    print(f"📍 User: {MONGODB_USER}")
    print("\n🔄 Conectando a MongoDB...")
    
    # Intentar conectar
    connect(
        db=MONGODB_DB,
        host=MONGODB_HOST,
        port=MONGODB_PORT,
        username=MONGODB_USER,
        password=MONGODB_PASSWORD,
        authSource="admin",
        uuidRepresentation="standard"
    )
    
    print("✅ ¡CONEXIÓN EXITOSA!")
    print("\n📊 Información de la conexión:")
    print(f"   - Base de datos: {MONGODB_DB}")
    print(f"   - Host: {MONGODB_HOST}:{MONGODB_PORT}")
    
    # Desconectar
    disconnect()
    print("\n✅ Desconexión exitosa")
    
except Exception as e:
    print(f"\n❌ ERROR DE CONEXIÓN:")
    print(f"   {type(e).__name__}: {str(e)}")
    print("\n💡 Verifica:")
    print("   1. Host y puerto correctos")
    print("   2. Usuario y contraseña correctos")
    print("   3. Firewall/Red permita conexión")
    print("   4. MongoDB esté ejecutándose en el servidor")

print("\n" + "=" * 60)
