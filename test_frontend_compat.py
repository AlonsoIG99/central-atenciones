#!/usr/bin/env python3
"""
Test de compatibilidad Frontend-Backend después de migración SQLite -> MongoDB
Verifica que todos los endpoints funcionan correctamente con los cambios realizados
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

def test_login():
    """Prueba el endpoint de login con credenciales admin"""
    print("\n=== Test 1: Login ===")
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            data={
                "username": "admin@central.com",
                "password": "admin123"
            }
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Token obtenido: {data.get('access_token', '')[:20]}...")
            print(f"✓ User ID: {data.get('user_id')} (tipo: {type(data.get('user_id')).__name__})")
            print(f"✓ Rol: {data.get('rol')}")
            return data.get('access_token')
        else:
            print(f"✗ Error: {response.text}")
            return None
    except Exception as e:
        print(f"✗ Excepción: {e}")
        return None

def test_usuarios(token):
    """Prueba obtener lista de usuarios"""
    print("\n=== Test 2: Obtener Usuarios ===")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/usuarios", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            usuarios = response.json()
            print(f"✓ Total de usuarios: {len(usuarios)}")
            if usuarios:
                user = usuarios[0]
                print(f"✓ Primer usuario: {user.get('nombre')}")
                print(f"✓ ID: {user.get('id')} (tipo: {type(user.get('id')).__name__})")
                print(f"✓ Email: {user.get('email')}")
            return True
        else:
            print(f"✗ Error: {response.text}")
            return False
    except Exception as e:
        print(f"✗ Excepción: {e}")
        return False

def test_trabajadores(token):
    """Prueba obtener lista de trabajadores"""
    print("\n=== Test 3: Obtener Trabajadores ===")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/trabajadores", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            trabajadores = response.json()
            print(f"✓ Total de trabajadores: {len(trabajadores)}")
            if trabajadores:
                trab = trabajadores[0]
                print(f"✓ Primer trabajador: {trab.get('nombre_completo')}")
                print(f"✓ ID: {trab.get('id')} (tipo: {type(trab.get('id')).__name__})")
                print(f"✓ DNI: {trab.get('dni')}")
            return True
        else:
            print(f"✗ Error: {response.text}")
            return False
    except Exception as e:
        print(f"✗ Excepción: {e}")
        return False

def test_asignados(token):
    """Prueba obtener lista de asignados"""
    print("\n=== Test 4: Obtener Asignados ===")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/asignados", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            asignados = response.json()
            print(f"✓ Total de asignados: {len(asignados)}")
            if asignados:
                asig = asignados[0]
                print(f"✓ Primer asignado: {asig.get('nombre_completo')}")
                print(f"✓ ID: {asig.get('id')} (tipo: {type(asig.get('id')).__name__})")
                print(f"✓ DNI: {asig.get('dni')}")
                print(f"✓ Zona: {asig.get('zona')}")
                print(f"✓ Tipo de compañía: {asig.get('tipo_compania')}")
            return True
        else:
            print(f"✗ Error: {response.text}")
            return False
    except Exception as e:
        print(f"✗ Excepción: {e}")
        return False

def test_incidencias(token):
    """Prueba obtener lista de incidencias"""
    print("\n=== Test 5: Obtener Incidencias ===")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/incidencias", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            incidencias = response.json()
            print(f"✓ Total de incidencias: {len(incidencias)}")
            if incidencias:
                inc = incidencias[0]
                print(f"✓ Primera incidencia: {inc.get('titulo')}")
                print(f"✓ ID: {inc.get('id')} (tipo: {type(inc.get('id')).__name__})")
                print(f"✓ DNI: {inc.get('dni')}")
                print(f"✓ Estado: {inc.get('estado')}")
            return True
        else:
            print(f"✗ Error: {response.text}")
            return False
    except Exception as e:
        print(f"✗ Excepción: {e}")
        return False

def test_crear_incidencia(token, user_id):
    """Prueba crear una nueva incidencia"""
    print("\n=== Test 6: Crear Incidencia ===")
    try:
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        data = {
            "dni": "12345678",
            "titulo": "Incidencia de prueba",
            "descripcion": "Descripción de prueba",
            "usuario_id": user_id,  # Debe ser string ahora
            "estado": "abierta"
        }
        response = requests.post(f"{BASE_URL}/incidencias", json=data, headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Incidencia creada: {result.get('id')}")
            print(f"✓ ID tipo: {type(result.get('id')).__name__}")
            return True
        else:
            print(f"✗ Error: {response.text}")
            return False
    except Exception as e:
        print(f"✗ Excepción: {e}")
        return False

def main():
    print("╔════════════════════════════════════════════════════════════╗")
    print("║ Test Compatibilidad Frontend-Backend (SQLite → MongoDB)    ║")
    print("║ Verificando cambios críticos de la migración              ║")
    print("╚════════════════════════════════════════════════════════════╝")
    
    # Prueba de conexión
    print(f"\nConectando a: {BASE_URL}")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"✓ Servidor accesible: {response.status_code}")
    except Exception as e:
        print(f"✗ Servidor no disponible: {e}")
        return
    
    # Tests
    token = test_login()
    if not token:
        print("\n✗ No se pudo obtener token de autenticación")
        return
    
    # Extraer user_id del almacenamiento (simulamos usando el admin)
    # En realidad lo sacamos del login
    test_usuarios(token)
    test_trabajadores(token)
    test_asignados(token)
    test_incidencias(token)
    test_crear_incidencia(token, "admin_user_id")
    
    print("\n" + "="*60)
    print("✓ Todos los tests completados")
    print("="*60)

if __name__ == "__main__":
    main()
