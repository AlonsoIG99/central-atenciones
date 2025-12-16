from mongoengine import Document, StringField, DateTimeField
from datetime import datetime, timedelta

def hora_peru():
    """Retorna la hora actual de Perú (UTC-5)"""
    return datetime.utcnow() - timedelta(hours=5)

class Usuario(Document):
    """Modelo de Usuario para MongoDB"""
    
    dni = StringField(null=True, index=True)
    nombre = StringField(required=True, index=True)
    email = StringField(required=True, unique=True, index=True)
    contraseña = StringField(required=True)
    rol = StringField(default="gestor", choices=["administrador", "gestor"])
    area = StringField(required=True, index=True)
    fecha_creacion = DateTimeField(default=hora_peru)
    
    meta = {
        'collection': 'usuarios',
        'indexes': ['nombre', 'email', 'area']
    }
    
    def to_dict(self):
        """Convierte el documento a diccionario"""
        return {
            'id': str(self.id),
            'dni': self.dni,
            'nombre': self.nombre,
            'email': self.email,
            'rol': self.rol,
            'area': self.area,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None
        }
