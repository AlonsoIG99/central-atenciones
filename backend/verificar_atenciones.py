"""Script para verificar atenciones asociadas a visitas"""
from database import conectar_db
from models.visita import Visita
from models.atencion_cultura import AtencionCultura

if __name__ == "__main__":
    conectar_db()
    
    print("\n" + "="*60)
    print("VERIFICACIÓN DE ATENCIONES POR VISITA")
    print("="*60 + "\n")
    
    # Obtener todas las visitas
    visitas = Visita.objects.all().order_by('-fecha_creacion')
    
    for visita in visitas[:5]:  # Mostrar últimas 5 visitas
        print(f"📋 VISITA: {visita.cliente}")
        print(f"   ID: {visita.id}")
        print(f"   Fecha: {visita.fecha_visita}")
        print(f"   Unidad: {visita.unidad}")
        print(f"   Líder: {visita.lider_zonal}")
        
        # Buscar atenciones asociadas
        atenciones = AtencionCultura.objects(visita_id=str(visita.id))
        
        if atenciones.count() > 0:
            print(f"\n   ✅ ATENCIONES ASOCIADAS ({atenciones.count()}):")
            for atencion in atenciones:
                print(f"      • DNI: {atencion.dni}")
                print(f"        Derivación: {atencion.derivacion}")
                print(f"        Comentario: {atencion.comentario}")
                print()
        else:
            print("   ⚠️  Sin atenciones registradas\n")
        
        print("-" * 60 + "\n")
    
    # Resumen
    total_visitas = Visita.objects.count()
    total_atenciones = AtencionCultura.objects.count()
    atenciones_con_visita = AtencionCultura.objects(visita_id__ne=None).count()
    atenciones_directas = AtencionCultura.objects(visita_id=None).count()
    
    print("\n" + "="*60)
    print("RESUMEN")
    print("="*60)
    print(f"Total Visitas: {total_visitas}")
    print(f"Total Atenciones: {total_atenciones}")
    print(f"  • Con visita asociada: {atenciones_con_visita}")
    print(f"  • Directas (sin visita): {atenciones_directas}")
    print("="*60 + "\n")
