"""
Script de migración: Renombrar colección 'incidencias' a 'atenciones' en MongoDB
Cambiar campos en 'reporte_dashboards': incidencia_* → atencion_*
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Agregar el directorio padre al path
sys.path.insert(0, str(Path(__file__).parent.parent))

from mongoengine import connect, disconnect

load_dotenv()

# Conexión a MongoDB
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://nexus.liderman.net.pe:27017/central_db')

def migrate():
    """Ejecuta la migración"""
    try:
        # Conectar a MongoDB con autenticación
        disconnect()
        
        # URI con credenciales (si es necesario, actualiza user:pass)
        MONGO_URI = os.getenv('MONGO_URI', 'mongodb://nexus.liderman.net.pe:27017/central_db')
        
        # Intenta conectar sin autenticación primero
        try:
            connect(host=MONGO_URI)
        except Exception as e:
            # Si falla, intenta con autenticación
            if 'authentication' in str(e).lower() or 'unauthorized' in str(e).lower():
                print("⚠️  Requiere autenticación. Usando credenciales de entorno...")
                # Descomentar si tienes credenciales configuradas en .env
                # MONGO_USER = os.getenv('MONGO_USER', '')
                # MONGO_PASS = os.getenv('MONGO_PASS', '')
                # MONGO_URI = f"mongodb://{MONGO_USER}:{MONGO_PASS}@nexus.liderman.net.pe:27017/central_db?authSource=admin"
                raise
            else:
                raise
        
        print("🔄 Iniciando migración...")
        
        # Obtener la base de datos
        from mongoengine.connection import get_db
        db = get_db()
        
        # 1. Renombrar colección 'incidencias' a 'atenciones'
        print("\n1️⃣  Renombrando colección 'incidencias' → 'atenciones'...")
        
        if 'incidencias' in db.list_collection_names():
            db.incidencias.rename('atenciones')
            print("   ✅ Colección renombrada exitosamente")
        else:
            print("   ⚠️  Colección 'incidencias' no encontrada (probablemente ya fue renombrada)")
        
        # 2. Actualizar campos en 'reporte_dashboards'
        print("\n2️⃣  Actualizando campos en 'reporte_dashboards'...")
        
        if 'reporte_dashboards' in db.list_collection_names():
            resultado = db.reporte_dashboards.update_many(
                {},
                [
                    {
                        '$set': {
                            'atencion_id': '$incidencia_id',
                            'titulo_atencion': '$titulo_incidencia',
                            'descripcion_atencion': '$descripcion_incidencia',
                            'estado_atencion': '$estado_incidencia',
                            'fecha_creacion_atencion': '$fecha_creacion_incidencia',
                            'fecha_cierre_atencion': '$fecha_cierre_incidencia'
                        }
                    },
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
                ]
            )
            print(f"   ✅ {resultado.modified_count} documentos actualizados")
        else:
            print("   ⚠️  Colección 'reporte_dashboards' no encontrada")
        
        # 3. Crear índice para la nueva colección si es necesario
        print("\n3️⃣  Verificando índices...")
        db.atenciones.create_index([('dni', 1)])
        db.atenciones.create_index([('estado', 1)])
        db.atenciones.create_index([('fecha_creacion', 1)])
        print("   ✅ Índices verificados/creados")
        
        print("\n✅ ¡Migración completada exitosamente!\n")
        
        # Mostrar estadísticas
        colecciones = db.list_collection_names()
        print(f"Colecciones en la base de datos:")
        for col in colecciones:
            count = db[col].count_documents({})
            print(f"  - {col}: {count} documentos")
        
        disconnect()
        
    except Exception as e:
        print(f"\n❌ Error durante la migración: {str(e)}")
        disconnect()
        raise

if __name__ == '__main__':
    migrate()
