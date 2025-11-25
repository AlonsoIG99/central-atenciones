from mongoengine import Document, StringField, signals
import logging

logger = logging.getLogger(__name__)

class Trabajador(Document):
    """Modelo de Trabajador (histórico) para MongoDB"""
    
    dni = StringField(required=True)
    nombre_completo = StringField(required=True)
    fecha_ingreso = StringField(null=True)
    fecha_cese = StringField(null=True)
    
    meta = {
        'collection': 'trabajadores',
        'indexes': [
            {'fields': ['dni'], 'unique': True, 'sparse': True},
            'nombre_completo'
        ]
    }

    def to_dict(self):
        """Convierte el documento a diccionario"""
        return {
            'id': str(self.id),
            'dni': self.dni,
            'nombre_completo': self.nombre_completo,
            'fecha_ingreso': self.fecha_ingreso,
            'fecha_cese': self.fecha_cese
        }


# Signal para registrar inserciones
def log_save(sender, document, **kwargs):
    """Log cuando se guarda un trabajador"""
    import traceback
    stack = ''.join(traceback.format_stack()[:-1])
    logger.warning(f"[TRACE] Insertando/Actualizando trabajador DNI={document.dni}")
    # logger.debug(f"Stack trace:\n{stack}")

signals.post_save.connect(log_save, sender=Trabajador)
