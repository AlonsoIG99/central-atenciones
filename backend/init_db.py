"""
Script para inicializar la base de datos MongoDB con colecciones y datos por defecto
"""

import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from passlib.context import CryptContext
from datetime import datetime

# Importar modelos y base de datos
from database import conectar_db
from models.usuario import Usuario
from models.trabajador import Trabajador
from models.incidencia import Incidencia
from models.asignado import Asignado

def get_password_hash(password):
    """Hashear contraseña con bcrypt"""
    try:
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return pwd_context.hash(password)
    except Exception as e:
        print(f"  ⚠ Error con bcrypt: {e}")
        print(f"  ℹ Usando contraseña sin hash (para desarrollo)")
        return password

def init_database():
    """Inicializar conexión a MongoDB"""
    # La conexión se realiza automáticamente al importar database.py
    print("✓ Conexión a MongoDB establecida")

def create_default_admin():
    """Crear usuario administrador por defecto"""
    try:
        # Verificar si ya existe un admin
        admin_existente = Usuario.objects(email="admin@central.com").first()
        
        if not admin_existente:
            admin = Usuario(
                nombre="Administrador",
                email="admin@central.com",
                contraseña=get_password_hash("admin123"),
                rol="administrador",
                area="Administración",
                fecha_creacion=datetime.utcnow()
            )
            admin.save()
            print("✓ Usuario administrador creado:")
            print(f"  Email: admin@central.com")
            print(f"  Contraseña: admin123")
            print(f"  Rol: administrador")
        else:
            print("ℹ Usuario administrador ya existe")
    except Exception as e:
        print(f"✗ Error al crear usuario administrador: {e}")

def seed_trabajadores():
    """Agregar trabajadores de prueba"""
    
    trabajadores_prueba = [
        {"dni": "12345678", "nombre_completo": "Juan Pérez", "fecha_ingreso": "2022-01-15", "fecha_cese": None},
        {"dni": "23456789", "nombre_completo": "María García", "fecha_ingreso": "2021-03-20", "fecha_cese": None},
        {"dni": "34567890", "nombre_completo": "Carlos López", "fecha_ingreso": "2020-06-10", "fecha_cese": "2024-08-30"},
        {"dni": "45678901", "nombre_completo": "Ana Rodríguez", "fecha_ingreso": "2023-02-01", "fecha_cese": None},
        {"dni": "56789012", "nombre_completo": "Pedro Martínez", "fecha_ingreso": "2019-11-05", "fecha_cese": None},
        {"dni": "67890123", "nombre_completo": "Laura Fernández", "fecha_ingreso": "2022-07-12", "fecha_cese": None},
        {"dni": "78901234", "nombre_completo": "Diego Sánchez", "fecha_ingreso": "2021-09-08", "fecha_cese": None},
        {"dni": "89012345", "nombre_completo": "Sofía González", "fecha_ingreso": "2023-04-18", "fecha_cese": None},
    ]
    
    try:
        agregados = 0
        for datos in trabajadores_prueba:
            existente = Trabajador.objects(dni=datos["dni"]).first()
            
            if not existente:
                trabajador = Trabajador(**datos)
                trabajador.save()
                agregados += 1
        
        if agregados > 0:
            print(f"✓ {agregados} trabajadores agregados")
        else:
            print("ℹ Los trabajadores ya existen")
    except Exception as e:
        print(f"✗ Error al agregar trabajadores: {e}")

def seed_asignados():
    """Agregar asignados de prueba (activos)"""
    
    asignados_prueba = [
        {
            "dni": "12345678",
            "tipo_compania": "Privada",
            "nombre_completo": "Juan Pérez",
            "fecha_ingreso": "2022-01-15",
            "cliente": "Cliente A",
            "zona": "Norte",
            "lider_zonal": "Carlos Manager",
            "jefe_operaciones": "Operador 1",
            "macrozona": "Lima",
            "jurisdiccion": "Lima Centro",
            "sector": "Sector 1",
            "estado": "activo"
        },
        {
            "dni": "23456789",
            "tipo_compania": "Privada",
            "nombre_completo": "María García",
            "fecha_ingreso": "2021-03-20",
            "cliente": "Cliente B",
            "zona": "Sur",
            "lider_zonal": "Laura Manager",
            "jefe_operaciones": "Operador 2",
            "macrozona": "Lima",
            "jurisdiccion": "Lima Sur",
            "sector": "Sector 2",
            "estado": "activo"
        },
        {
            "dni": "45678901",
            "tipo_compania": "Pública",
            "nombre_completo": "Ana Rodríguez",
            "fecha_ingreso": "2023-02-01",
            "cliente": "Cliente C",
            "zona": "Este",
            "lider_zonal": "José Manager",
            "jefe_operaciones": "Operador 3",
            "macrozona": "Callao",
            "jurisdiccion": "Callao Este",
            "sector": "Sector 3",
            "estado": "activo"
        },
    ]
    
    try:
        agregados = 0
        for datos in asignados_prueba:
            existente = Asignado.objects(dni=datos["dni"]).first()
            
            if not existente:
                asignado = Asignado(**datos)
                asignado.save()
                agregados += 1
        
        if agregados > 0:
            print(f"✓ {agregados} asignados agregados")
        else:
            print("ℹ Los asignados ya existen")
    except Exception as e:
        print(f"✗ Error al agregar asignados: {e}")

if __name__ == "__main__":
    print("🔄 Inicializando MongoDB...\n")
    
    # Inicializar conexión
    init_database()
    
    # Crear admin por defecto
    print("\n📝 Creando usuario administrador...")
    create_default_admin()
    
    # Agregar trabajadores de prueba
    print("\n👥 Agregando trabajadores de prueba...")
    seed_trabajadores()
    
    # Agregar asignados de prueba
    print("\n👤 Agregando asignados de prueba...")
    seed_asignados()
    
    print("\n✅ MongoDB inicializado correctamente")
    print("\n" + "="*50)
    print("CREDENCIALES POR DEFECTO:")
    print("="*50)
    print("Email: admin@central.com")
    print("Contraseña: admin123")
    print("="*50)

