"""
Script de migración simple usando PyMongo
Renombra colección 'incidencias' a 'atenciones' en MongoDB
"""

import sys
from pathlib import Path

# Instalar pymongo si no está disponible
try:
    from pymongo import MongoClient
except ImportError:
    print("Instalando pymongo...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pymongo", "-q"])
    from pymongo import MongoClient

def migrate():
    """Ejecuta la migración de MongoDB"""
    
    # Configuración de conexión
    MONGO_USER = "root"
    MONGO_PASSWORD = "Jdg27aCQqOzR"
    MONGO_HOST = "nexus.liderman.net.pe"
    MONGO_PORT = 27017
    DB_NAME = "central_db"
    
    # Construir URL con autenticación
    MONGO_URL = f"mongodb://{MONGO_USER}:{MONGO_PASSWORD}@{MONGO_HOST}:{MONGO_PORT}/{DB_NAME}?authSource=admin"
    
    try:
        print("🔄 Conectando a MongoDB...")
        client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=5000)
        
        # Verificar conexión
        client.admin.command('ping')
        print("✅ Conexión exitosa\n")
        
        db = client[DB_NAME]
        
        # 1. Renombrar colección
        print("1️⃣  Renombrando colección 'incidencias' → 'atenciones'...")
        collections = db.list_collection_names()
        
        if 'incidencias' in collections:
            db.incidencias.rename('atenciones')
            print("   ✅ Colección renombrada\n")
        else:
            print("   ⚠️  Colección 'incidencias' no encontrada")
            print("   (Probablemente ya fue renombrada)\n")
        
        # 2. Actualizar campos en reporte_dashboards
        print("2️⃣  Actualizando campos en 'reporte_dashboards'...")
        
        if 'reporte_dashboards' in db.list_collection_names():
            # Primera pasada: copiar datos
            result = db.reporte_dashboards.update_many(
                {'incidencia_id': {'$exists': True}},
                [
                    {
                        '$set': {
                            'atencion_id': '$incidencia_id',
                            'titulo_atencion': {'$cond': [{'$eq': ['$titulo_incidencia', None]}, '', '$titulo_incidencia']},
                            'descripcion_atencion': {'$cond': [{'$eq': ['$descripcion_incidencia', None]}, '', '$descripcion_incidencia']},
                            'estado_atencion': {'$cond': [{'$eq': ['$estado_incidencia', None]}, '', '$estado_incidencia']},
                            'fecha_creacion_atencion': '$fecha_creacion_incidencia',
                            'fecha_cierre_atencion': '$fecha_cierre_incidencia'
                        }
                    }
                ]
            )
            
            # Segunda pasada: eliminar campos antiguos
            result2 = db.reporte_dashboards.update_many(
                {},
                {
                    '$unset': {
                        'incidencia_id': '',
                        'titulo_incidencia': '',
                        'descripcion_incidencia': '',
                        'estado_incidencia': '',
                        'fecha_creacion_incidencia': '',
                        'fecha_cierre_incidencia': ''
                    }
                }
            )
            print(f"   ✅ {result.modified_count} documentos actualizados")
            print(f"   ✅ {result2.modified_count} documentos limpiados\n")
        else:
            print("   ⚠️  Colección 'reporte_dashboards' no encontrada\n")
        
        # 3. Crear/Verificar índices
        print("3️⃣  Verificando índices...")
        if 'atenciones' in db.list_collection_names():
            db.atenciones.create_index([('dni', 1)])
            db.atenciones.create_index([('estado', 1)])
            db.atenciones.create_index([('fecha_creacion', 1)])
            print("   ✅ Índices verificados/creados\n")
        
        # 4. Mostrar estadísticas
        print("✅ ¡Migración completada exitosamente!\n")
        print("📊 Estadísticas finales:")
        print("-" * 50)
        
        collections = db.list_collection_names()
        for col_name in sorted(collections):
            count = db[col_name].count_documents({})
            print(f"  • {col_name}: {count} documentos")
        
        print("-" * 50)
        print("\n✨ ¡Base de datos actualizada correctamente!")
        
        client.close()
        
    except Exception as e:
        print(f"\n❌ Error durante la migración: {str(e)}")
        print("\n💡 Posibles soluciones:")
        print("  1. Verifica que MongoDB está ejecutándose")
        print("  2. Verifica la URL de conexión")
        print("  3. Comprueba las credenciales si es necesario")
        sys.exit(1)

if __name__ == '__main__':
    migrate()
