"""Script para verificar datos de clientes en asignados"""
import sys
sys.path.insert(0, 'C:/Users/aingar/Proyectos/proyecto-central-atencion')

from backend.models.asignado import Asignado
from backend.database import conectar_db

conectar_db()

# Ver algunos ejemplos de clientes
asignados = Asignado.objects(cliente__ne=None, estado='activo').limit(20).only('cliente')
clientes = [a.cliente for a in asignados if a.cliente and a.cliente.strip()]

print('Ejemplos de clientes en asignados:')
for c in sorted(set(clientes))[:10]:
    print(f'  - {c}')

print(f'\nTotal de clientes únicos (primeros 20): {len(set(clientes))}')

# Buscar clientes que contengan "inmu"
busqueda = "inmu"
encontrados = Asignado.objects(
    cliente__icontains=busqueda,
    estado="activo",
    cliente__ne=None
).only('cliente').all()

clientes_encontrados = list(set([a.cliente for a in encontrados if a.cliente and a.cliente.strip()]))
print(f'\nClientes que contienen "{busqueda}": {len(clientes_encontrados)}')
for c in sorted(clientes_encontrados)[:5]:
    print(f'  - {c}')
