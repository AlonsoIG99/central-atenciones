"""
Script para agregar trabajadores de prueba a la base de datos
Ejecutar después de que la aplicación haya creado las tablas
"""

import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.trabajador import Trabajador

# Configurar base de datos
DATABASE_URL = "sqlite:///./central_atencion.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Trabajadores de prueba
TRABAJADORES_PRUEBA = [
    {"dni": "12345678", "nombre": "Juan", "apellido": "Pérez", "zona": "Centro"},
    {"dni": "23456789", "nombre": "María", "apellido": "García", "zona": "Sur"},
    {"dni": "34567890", "nombre": "Carlos", "apellido": "López", "zona": "Norte"},
    {"dni": "45678901", "nombre": "Ana", "apellido": "Rodríguez", "zona": "Este"},
    {"dni": "56789012", "nombre": "Pedro", "apellido": "Martínez", "zona": "Oeste"},
    {"dni": "67890123", "nombre": "Laura", "apellido": "Fernández", "zona": "Centro"},
    {"dni": "78901234", "nombre": "Diego", "apellido": "Sánchez", "zona": "Sur"},
    {"dni": "89012345", "nombre": "Sofía", "apellido": "González", "zona": "Norte"},
]

def agregar_trabajadores():
    """Agregar trabajadores de prueba a la base de datos"""
    db = SessionLocal()
    
    try:
        for datos in TRABAJADORES_PRUEBA:
            # Verificar si el trabajador ya existe
            existente = db.query(Trabajador).filter(
                Trabajador.dni == datos["dni"]
            ).first()
            
            if not existente:
                trabajador = Trabajador(**datos)
                db.add(trabajador)
                print(f"✓ Agregado: {datos['dni']} - {datos['nombre']} {datos['apellido']}")
            else:
                print(f"ℹ Ya existe: {datos['dni']}")
        
        db.commit()
        print("\n✓ Todos los trabajadores han sido agregados exitosamente")
    except Exception as e:
        db.rollback()
        print(f"✗ Error al agregar trabajadores: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    agregar_trabajadores()
