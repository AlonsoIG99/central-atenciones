from mongoengine import Document, StringField, DateTimeField
from datetime import datetime, timedelta

def hora_peru():
    """Retorna la hora actual de Perú (UTC-5)"""
    return datetime.utcnow() - timedelta(hours=5)

class AtencionCultura(Document):
    """Modelo de Atención de Cultura para MongoDB"""
    
    visita_id = StringField(null=True, index=True)  # null si es atención sin visita
    dni = StringField(required=True, index=True)
    nombre_trabajador = StringField(null=True, index=True)
    derivacion = StringField(required=True, choices=[
        "atencion_propia",
        "central_atenciones",
        "bienestar_social",
        "logistica",
        "archivo",
        "operaciones"
    ])
    comentario = StringField(null=True)
    estado = StringField(default="abierta", choices=["abierta", "cerrada"])
    usuario_id = StringField(required=True, index=True)
    fecha_creacion = DateTimeField(default=hora_peru)
    fecha_cierre = DateTimeField(null=True)
    dias_abierta = StringField(null=True)
    
    meta = {
        'collection': 'atenciones_cultura',
        'indexes': ['dni', 'visita_id', 'usuario_id', 'fecha_creacion', 'estado']
    }
    
    def to_dict(self):
        """Convierte el documento a diccionario"""
        return {
            'id': str(self.id),
            'visita_id': self.visita_id,
            'dni': self.dni,
            'nombre_trabajador': self.nombre_trabajador,
            'derivacion': self.derivacion,
            'comentario': self.comentario,
            'estado': self.estado,
            'usuario_id': self.usuario_id,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            'fecha_cierre': self.fecha_cierre.isoformat() if self.fecha_cierre else None,
            'dias_abierta': self.dias_abierta
        }
