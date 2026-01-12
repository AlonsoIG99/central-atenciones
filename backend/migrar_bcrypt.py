"""
Script de Migración: SHA256 -> bcrypt
======================================
Este script actualiza las contraseñas de usuarios de SHA256 a bcrypt

⚠️ IMPORTANTE: 
- Los usuarios deberán restablecer sus contraseñas después de esta migración
- O bien, debes crear nuevos usuarios con contraseñas bcrypt
"""

import sys
import os
from pathlib import Path

# Agregar el directorio actual al path
sys.path.insert(0, str(Path(__file__).parent))

from database import conectar_db
from models.usuario import Usuario
from auth import obtener_hash_contraseña

def migrar_contraseñas():
    """
    Migra contraseñas de SHA256 a bcrypt
    
    NOTA: Como no podemos "desencriptar" SHA256, esta migración
    requiere una de estas estrategias:
    
    1. Forzar reset de contraseñas para todos los usuarios
    2. Usar una contraseña temporal conocida
    3. Mantener compatibilidad dual (SHA256 y bcrypt)
    """
    
    print("🔐 Iniciando migración de contraseñas...")
    print("⚠️  ADVERTENCIA: Este proceso establecerá contraseñas temporales")
    print()
    
    respuesta = input("¿Continuar? (sí/no): ")
    if respuesta.lower() not in ['si', 'sí', 's', 'yes', 'y']:
        print("❌ Migración cancelada")
        return
    
    # Contraseña temporal que los usuarios deberán cambiar
    CONTRASEÑA_TEMPORAL = "CambiarMe2026!"
    
    usuarios = Usuario.objects.all()
    total = len(usuarios)
    migrados = 0
    
    print(f"\n📊 Total de usuarios a migrar: {total}")
    print(f"🔑 Contraseña temporal: {CONTRASEÑA_TEMPORAL}")
    print()
    
    for usuario in usuarios:
        try:
            # Verificar si la contraseña ya está en formato bcrypt
            if usuario.contraseña.startswith('$2b$'):
                print(f"⏭️  {usuario.email} - Ya usa bcrypt, omitiendo...")
                continue
            
            # Generar hash bcrypt de la contraseña temporal
            nueva_contraseña_hash = obtener_hash_contraseña(CONTRASEÑA_TEMPORAL)
            
            # Actualizar usuario
            usuario.contraseña = nueva_contraseña_hash
            usuario.save()
            
            migrados += 1
            print(f"✅ {usuario.email} - Migrado exitosamente")
            
        except Exception as e:
            print(f"❌ {usuario.email} - Error: {str(e)}")
    
    print()
    print(f"🎉 Migración completada: {migrados}/{total} usuarios migrados")
    print()
    print("📧 SIGUIENTE PASO: Notificar a todos los usuarios que deben:")
    print(f"   1. Iniciar sesión con la contraseña temporal: {CONTRASEÑA_TEMPORAL}")
    print("   2. Cambiar su contraseña inmediatamente")

def crear_usuario_admin():
    """Crea un usuario administrador de prueba con bcrypt"""
    
    print("👤 Creando usuario administrador de prueba...")
    
    # Verificar si ya existe
    admin = Usuario.objects(email="admin@liderman.net.pe").first()
    if admin:
        print("⚠️  Usuario admin@liderman.net.pe ya existe")
        return
    
    admin = Usuario(
        dni="12345678",
        nombre="Administrador",
        email="admin@liderman.net.pe",
        contraseña=obtener_hash_contraseña("Admin2026!"),
        rol="administrador",
        area="TI"
    )
    admin.save()
    
    print("✅ Usuario administrador creado:")
    print("   Email: admin@liderman.net.pe")
    print("   Contraseña: Admin2026!")
    print("   ⚠️ CAMBIAR CONTRASEÑA INMEDIATAMENTE")

if __name__ == "__main__":
    import sys
    
    print("=" * 60)
    print("  MIGRACIÓN DE SEGURIDAD: SHA256 → bcrypt")
    print("=" * 60)
    print()
    
    if len(sys.argv) > 1:
        comando = sys.argv[1]
        
        if comando == "migrar":
            migrar_contraseñas()
        elif comando == "admin":
            crear_usuario_admin()
        else:
            print("❌ Comando no reconocido")
            print()
            print("Uso:")
            print("  python migrar_bcrypt.py migrar  - Migrar todas las contraseñas")
            print("  python migrar_bcrypt.py admin   - Crear usuario admin con bcrypt")
    else:
        print("Opciones disponibles:")
        print()
        print("1. Migrar todas las contraseñas (establece contraseña temporal)")
        print("2. Crear usuario administrador de prueba")
        print("3. Salir")
        print()
        
        opcion = input("Selecciona una opción (1-3): ")
        
        if opcion == "1":
            migrar_contraseñas()
        elif opcion == "2":
            crear_usuario_admin()
        elif opcion == "3":
            print("👋 Saliendo...")
        else:
            print("❌ Opción inválida")
