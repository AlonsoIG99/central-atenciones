#!/usr/bin/env python
"""
Script de verificación post-migración MongoDB
"""
import os
import sys

def check_file(path, description):
    """Verificar que un archivo existe"""
    exists = os.path.exists(path)
    status = "✓" if exists else "✗"
    print(f"  {status} {description}")
    return exists

def check_imports():
    """Verificar que los imports principales funcionan"""
    print("\n[Verificando imports...]")
    try:
        from backend.database import conectar_db
        print("  ✓ database.conectar_db")
    except Exception as e:
        print(f"  ✗ database.conectar_db: {e}")
        return False
    
    try:
        from backend.models.usuario import Usuario
        print("  ✓ models.usuario")
    except Exception as e:
        print(f"  ✗ models.usuario: {e}")
        return False
    
    try:
        from backend.models.trabajador import Trabajador
        print("  ✓ models.trabajador")
    except Exception as e:
        print(f"  ✗ models.trabajador: {e}")
        return False
    
    try:
        from backend.models.asignado import Asignado
        print("  ✓ models.asignado")
    except Exception as e:
        print(f"  ✗ models.asignado: {e}")
        return False
    
    try:
        from backend.models.incidencia import Incidencia
        print("  ✓ models.incidencia")
    except Exception as e:
        print(f"  ✗ models.incidencia: {e}")
        return False
    
    return True

def check_mongodb():
    """Verificar conexión a MongoDB"""
    print("\n[Verificando MongoDB...]")
    try:
        from backend.database import conectar_db
        from backend.models.usuario import Usuario
        
        usuarios = Usuario.objects.all()
        count = len(usuarios)
        print(f"  ✓ Conexión exitosa")
        print(f"  ✓ Usuarios en BD: {count}")
        
        # Verificar datos de prueba
        admin = Usuario.objects(email="admin@central.com").first()
        if admin:
            print(f"  ✓ Usuario admin existe")
        else:
            print(f"  ✗ Usuario admin no encontrado")
            return False
        
        return True
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

def main():
    print("\n" + "="*70)
    print("  VERIFICACIÓN POST-MIGRACIÓN")
    print("="*70)
    
    print("\n[Verificando estructura de archivos...]")
    
    files_to_check = [
        ("backend/app.py", "app.py"),
        ("backend/database.py", "database.py"),
        ("backend/auth.py", "auth.py"),
        ("backend/init_db.py", "init_db.py"),
        ("backend/models/usuario.py", "models/usuario.py"),
        ("backend/models/trabajador.py", "models/trabajador.py"),
        ("backend/models/asignado.py", "models/asignado.py"),
        ("backend/models/incidencia.py", "models/incidencia.py"),
        ("backend/routes/auth.py", "routes/auth.py"),
        ("backend/routes/usuarios.py", "routes/usuarios.py"),
        ("backend/routes/trabajadores.py", "routes/trabajadores.py"),
        ("backend/routes/asignados.py", "routes/asignados.py"),
        ("backend/routes/incidencias.py", "routes/incidencias.py"),
        ("requirements.txt", "requirements.txt"),
        ("INSTRUCCIONES_MONGODB.md", "INSTRUCCIONES_MONGODB.md"),
    ]
    
    all_files_ok = True
    for file_path, description in files_to_check:
        if not check_file(file_path, description):
            all_files_ok = False
    
    if not all_files_ok:
        print("\n[✗] Algunos archivos están faltando")
        return 1
    
    # Verificar imports
    if not check_imports():
        print("\n[✗] Problemas con imports")
        return 1
    
    # Verificar MongoDB
    if not check_mongodb():
        print("\n[✗] Problemas con MongoDB")
        return 1
    
    print("\n" + "="*70)
    print("  [✓] TODAS LAS VERIFICACIONES PASARON")
    print("="*70)
    print("\nPara iniciar el servidor:")
    print("  python -m uvicorn backend.app:app --port 8000")
    print("\nDocs disponibles en:")
    print("  http://127.0.0.1:8000/docs")
    print("="*70 + "\n")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
