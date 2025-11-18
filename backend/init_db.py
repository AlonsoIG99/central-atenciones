"""
Script para inicializar la base de datos con esquema nuevo y usuario admin por defecto
"""

import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from passlib.context import CryptContext

# Importar modelos y base de datos
from database import Base, engine, SessionLocal
from models.usuario import Usuario
from models.trabajador import Trabajador

# Contexto para hash de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def init_database():
    """Crear todas las tablas"""
    Base.metadata.create_all(bind=engine)
    print("✓ Tablas creadas correctamente")

def create_default_admin():
    """Crear usuario administrador por defecto"""
    db = SessionLocal()
    
    try:
        # Verificar si ya existe un admin
        admin_existente = db.query(Usuario).filter(Usuario.email == "admin@central.com").first()
        
        if not admin_existente:
            admin = Usuario(
                nombre="Administrador",
                email="admin@central.com",
                contraseña=get_password_hash("admin123"),
                rol="administrador",
                area="Administración"
            )
            db.add(admin)
            db.commit()
            print("✓ Usuario administrador creado:")
            print(f"  Email: admin@central.com")
            print(f"  Contraseña: admin123")
            print(f"  Rol: administrador")
        else:
            print("ℹ Usuario administrador ya existe")
    except Exception as e:
        db.rollback()
        print(f"✗ Error al crear usuario administrador: {e}")
    finally:
        db.close()

def seed_trabajadores():
    """Agregar trabajadores de prueba"""
    db = SessionLocal()
    
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
            existente = db.query(Trabajador).filter(Trabajador.dni == datos["dni"]).first()
            
            if not existente:
                trabajador = Trabajador(**datos)
                db.add(trabajador)
                agregados += 1
        
        if agregados > 0:
            db.commit()
            print(f"✓ {agregados} trabajadores agregados")
        else:
            print("ℹ Los trabajadores ya existen")
    except Exception as e:
        db.rollback()
        print(f"✗ Error al agregar trabajadores: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("🔄 Inicializando base de datos...\n")
    
    # Eliminar BD antigua si existe
    if os.path.exists("central_atencion.db"):
        try:
            os.remove("central_atencion.db")
            print("✓ Base de datos antigua eliminada")
        except Exception as e:
            print(f"ℹ No se pudo eliminar BD antigua (probablemente está en uso): {e}")
            print("ℹ Continuando con inicialización...\n")
    
    # Crear tablas
    init_database()
    
    # Crear admin por defecto
    print("\n📝 Creando usuario administrador...")
    create_default_admin()
    
    # Agregar trabajadores de prueba
    print("\n👥 Agregando trabajadores de prueba...")
    seed_trabajadores()
    
    print("\n✅ Base de datos inicializada correctamente")
    print("\n" + "="*50)
    print("CREDENCIALES POR DEFECTO:")
    print("="*50)
    print("Email: admin@central.com")
    print("Contraseña: admin123")
    print("="*50)
