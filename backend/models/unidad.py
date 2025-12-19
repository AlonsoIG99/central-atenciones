from mongoengine import Document, StringField

class Unidad(Document):
    """Modelo de Unidad para MongoDB"""
    
    nombre = StringField(required=True, unique=True)
    
    meta = {
        'collection': 'unidades',
        'indexes': ['nombre']
    }
    
    def to_dict(self):
        """Convierte el documento a diccionario"""
        return {
            'id': str(self.id),
            'nombre': self.nombre
        }
