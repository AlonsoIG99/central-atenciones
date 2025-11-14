import os
import sys
from pathlib import Path

# Obtener la ruta del archivo de base de datos
db_path = Path(__file__).parent / "central_atencion.db"

# Intentar eliminar el archivo
if db_path.exists():
    try:
        os.remove(db_path)
        print(f"✓ Base de datos eliminada: {db_path}")
    except Exception as e:
        print(f"✗ Error al eliminar la base de datos: {e}")
        sys.exit(1)
else:
    print(f"ℹ La base de datos no existe: {db_path}")

print("✓ Ahora reinicia el servidor FastAPI para recrear la base de datos con el nuevo esquema")
