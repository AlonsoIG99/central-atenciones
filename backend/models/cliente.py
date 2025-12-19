from mongoengine import Document, StringField

class Cliente(Document):
    """Modelo de Cliente para MongoDB"""
    
    nombre = StringField(required=True, unique=True)
    
    meta = {
        'collection': 'clientes',
        'indexes': ['nombre']
    }
    
    def to_dict(self):
        """Convierte el documento a diccionario"""
        return {
            'id': str(self.id),
            'nombre': self.nombre
        }
