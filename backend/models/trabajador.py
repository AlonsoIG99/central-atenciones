from mongoengine import Document, StringField

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
