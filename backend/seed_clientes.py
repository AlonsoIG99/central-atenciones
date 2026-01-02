"""Script para agregar clientes de prueba"""
from database import conectar_db
from models.cliente import Cliente

def seed_clientes():
    """Agrega clientes de prueba a la base de datos"""
    
    clientes_prueba = [
        "Jockey Plaza",
        "Universidad Peruana de Ciencias Aplicadas",
        "H&M",
        "Plaza San Miguel",
        "Interbank",
        "Tottus",
        "Metro",
        "Saga Falabella"
    ]
    
    print("Iniciando inserción de clientes de prueba...")
    
    for nombre_cliente in clientes_prueba:
        # Verificar si el cliente ya existe
        cliente_existe = Cliente.objects(nombre=nombre_cliente).first()
        
        if cliente_existe:
            print(f"✓ Cliente '{nombre_cliente}' ya existe (ID: {cliente_existe.id})")
        else:
            # Crear nuevo cliente
            nuevo_cliente = Cliente(nombre=nombre_cliente)
            nuevo_cliente.save()
            print(f"✓ Cliente '{nombre_cliente}' creado exitosamente (ID: {nuevo_cliente.id})")
    
    # Mostrar total de clientes
    total_clientes = Cliente.objects.count()
    print(f"\n✓ Total de clientes en la base de datos: {total_clientes}")

if __name__ == "__main__":
    # Inicializar conexión a la base de datos
    conectar_db()
    print("Conexión establecida\n")
    
    # Ejecutar seed
    seed_clientes()
    
    print("\n✓ Proceso completado")
