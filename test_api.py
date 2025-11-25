#!/usr/bin/env python
"""
Script para probar la API de Central de Atención con MongoDB
"""
import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8001"

def test_root():
    """Probar endpoint raíz"""
    print("\n[TEST] GET /")
    try:
        resp = requests.get(f"{BASE_URL}/")
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.json()}")
        return resp.status_code == 200
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def test_login():
    """Probar login"""
    print("\n[TEST] POST /auth/token")
    try:
        data = {"email": "admin@central.com", "password": "admin123"}
        resp = requests.post(f"{BASE_URL}/auth/token", json=data)
        print(f"Status: {resp.status_code}")
        result = resp.json()
        print(f"Response: {json.dumps(result, indent=2, ensure_ascii=False)}")
        if resp.status_code == 200:
            return result.get("access_token")
        return None
    except Exception as e:
        print(f"ERROR: {e}")
        return None

def test_usuarios(token):
    """Probar obtener usuarios"""
    print("\n[TEST] GET /usuarios/")
    try:
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        resp = requests.get(f"{BASE_URL}/usuarios/", headers=headers)
        print(f"Status: {resp.status_code}")
        result = resp.json()
        print(f"Response (primeros 2 usuarios): {json.dumps(result[:2] if isinstance(result, list) else result, indent=2, ensure_ascii=False)}")
        return resp.status_code == 200
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def test_trabajadores():
    """Probar obtener trabajadores"""
    print("\n[TEST] GET /trabajadores/")
    try:
        resp = requests.get(f"{BASE_URL}/trabajadores/")
        print(f"Status: {resp.status_code}")
        result = resp.json()
        count = len(result) if isinstance(result, list) else 0
        print(f"Trabajadores encontrados: {count}")
        if count > 0:
            print(f"Primero: {json.dumps(result[0], indent=2, ensure_ascii=False)}")
        return resp.status_code == 200
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def test_asignados():
    """Probar obtener asignados"""
    print("\n[TEST] GET /asignados/")
    try:
        resp = requests.get(f"{BASE_URL}/asignados/")
        print(f"Status: {resp.status_code}")
        result = resp.json()
        count = len(result) if isinstance(result, list) else 0
        print(f"Asignados encontrados: {count}")
        if count > 0:
            print(f"Primero: {json.dumps(result[0], indent=2, ensure_ascii=False)}")
        return resp.status_code == 200
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def test_incidencias():
    """Probar obtener incidencias"""
    print("\n[TEST] GET /incidencias/")
    try:
        resp = requests.get(f"{BASE_URL}/incidencias/")
        print(f"Status: {resp.status_code}")
        result = resp.json()
        count = len(result) if isinstance(result, list) else 0
        print(f"Incidencias encontradas: {count}")
        if count > 0:
            print(f"Primero: {json.dumps(result[0], indent=2, ensure_ascii=False)}")
        return resp.status_code == 200
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def main():
    print("="*60)
    print("Pruebas de API - Central de Atención con MongoDB")
    print("="*60)
    
    # Prueba 1: Endpoint raíz
    test_root()
    
    # Prueba 2: Login
    token = test_login()
    
    # Prueba 3: Usuarios
    test_usuarios(token)
    
    # Prueba 4: Trabajadores
    test_trabajadores()
    
    # Prueba 5: Asignados
    test_asignados()
    
    # Prueba 6: Incidencias
    test_incidencias()
    
    print("\n" + "="*60)
    print("Pruebas completadas")
    print("="*60)

if __name__ == "__main__":
    main()
