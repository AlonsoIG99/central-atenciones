from mongoengine import Document, StringField, DateTimeField
from datetime import datetime, timedelta

def hora_peru():
    """Retorna la hora actual de Perú (UTC-5)"""
    return datetime.utcnow() - timedelta(hours=5)

class Visita(Document):
    """Modelo de Visita para MongoDB"""
    
    cliente = StringField(required=True, index=True)
    fecha_visita = DateTimeField(required=True, index=True)
    unidad = StringField(required=True)
    lider_zonal = StringField(required=True)
    comentario = StringField(null=True)
    usuario_id = StringField(required=True, index=True)
    fecha_creacion = DateTimeField(default=hora_peru)
    
    meta = {
        'collection': 'visitas',
        'indexes': ['cliente', 'fecha_visita', 'usuario_id']
    }
    
    def to_dict(self):
        """Convierte el documento a diccionario"""
        return {
            'id': str(self.id),
            'cliente': self.cliente,
            'fecha_visita': self.fecha_visita.isoformat() if self.fecha_visita else None,
            'unidad': self.unidad,
            'lider_zonal': self.lider_zonal,
            'comentario': self.comentario,
            'usuario_id': self.usuario_id,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None
        }
