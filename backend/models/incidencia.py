from mongoengine import Document, StringField, DateTimeField, IntField
from datetime import datetime

class Incidencia(Document):
    """Modelo de Incidencia para MongoDB"""
    
    dni = StringField(required=True, index=True)
    titulo = StringField(required=True, index=True)
    descripcion = StringField(required=True)
    estado = StringField(default="abierta", choices=["abierta", "en_proceso", "cerrada"])
    usuario_id = IntField(null=True)
    fecha_creacion = DateTimeField(default=datetime.utcnow)
    fecha_actualizacion = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'incidencias',
        'indexes': ['dni', 'estado', 'fecha_creacion']
    }
    
    def to_dict(self):
        """Convierte el documento a diccionario"""
        return {
            'id': str(self.id),
            'dni': self.dni,
            'titulo': self.titulo,
            'descripcion': self.descripcion,
            'estado': self.estado,
            'usuario_id': self.usuario_id,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            'fecha_actualizacion': self.fecha_actualizacion.isoformat() if self.fecha_actualizacion else None
        }
