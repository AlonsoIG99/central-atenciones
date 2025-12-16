from mongoengine import Document, StringField, DateTimeField
from datetime import datetime, timedelta

def hora_peru():
    """Retorna la hora actual de Perú (UTC-5)"""
    return datetime.utcnow() - timedelta(hours=5)

class Incidencia(Document):
    """Modelo de Atención para MongoDB"""
    
    dni = StringField(required=True, index=True)
    titulo = StringField(required=True, index=True)
    descripcion = StringField(required=True)
    canal = StringField(default="llamada_telefonica", choices=["llamada_telefonica", "whatsapp", "presencial", "correo"])
    estado = StringField(default="abierta", choices=["abierta", "en_proceso", "cerrada"])
    usuario_id = StringField(null=True)
    fecha_creacion = DateTimeField(default=hora_peru)
    fecha_actualizacion = DateTimeField(default=hora_peru)
    fecha_cierre = DateTimeField(null=True)
    dias_abierta = StringField(null=True)  # Se calcula cuando se cierra
    
    meta = {
        'collection': 'atenciones',
        'indexes': ['dni', 'estado', 'fecha_creacion', 'canal']
    }
    
    def to_dict(self):
        """Convierte el documento a diccionario"""
        return {
            'id': str(self.id),
            'dni': self.dni,
            'titulo': self.titulo,
            'descripcion': self.descripcion,
            'canal': self.canal,
            'estado': self.estado,
            'usuario_id': self.usuario_id,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            'fecha_actualizacion': self.fecha_actualizacion.isoformat() if self.fecha_actualizacion else None,
            'fecha_cierre': self.fecha_cierre.isoformat() if self.fecha_cierre else None,
            'dias_abierta': self.dias_abierta
        }
