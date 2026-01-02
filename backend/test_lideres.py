"""Script para verificar datos de líderes zonales en asignados"""
import sys
sys.path.insert(0, 'C:/Users/aingar/Proyectos/proyecto-central-atencion')

from backend.models.asignado import Asignado
from backend.database import conectar_db

conectar_db()

# Ver algunos ejemplos de líderes zonales
asignados = Asignado.objects(lider_zonal__ne=None, estado='activo').limit(20).only('lider_zonal')
lideres = [a.lider_zonal for a in asignados if a.lider_zonal and a.lider_zonal.strip()]

print('Ejemplos de líderes zonales en asignados:')
for l in sorted(set(lideres))[:10]:
    print(f'  - {l}')

print(f'\nTotal de líderes únicos (primeros 20): {len(set(lideres))}')

# Buscar líderes que contengan ciertas letras
busqueda = "manu"
encontrados = Asignado.objects(
    lider_zonal__icontains=busqueda,
    estado="activo",
    lider_zonal__ne=None
).only('lider_zonal').all()

lideres_encontrados = list(set([a.lider_zonal for a in encontrados if a.lider_zonal and a.lider_zonal.strip()]))
print(f'\nLíderes que contienen "{busqueda}": {len(lideres_encontrados)}')
for l in sorted(lideres_encontrados)[:5]:
    print(f'  - {l}')
