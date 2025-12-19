from mongoengine import Document, StringField

class Lider(Document):
    """Modelo de Líder Zonal para MongoDB"""
    
    nombre = StringField(required=True, unique=True)
    
    meta = {
        'collection': 'lideres',
        'indexes': ['nombre']
    }
    
    def to_dict(self):
        """Convierte el documento a diccionario"""
        return {
            'id': str(self.id),
            'nombre': self.nombre
        }
