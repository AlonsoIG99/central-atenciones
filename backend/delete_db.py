import os

db_file = 'central_atencion.db'
if os.path.exists(db_file):
    os.remove(db_file)
    print(f"Base de datos '{db_file}' eliminada")
else:
    print(f"Base de datos '{db_file}' no encontrada")
