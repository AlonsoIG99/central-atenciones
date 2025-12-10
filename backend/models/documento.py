from mongoengine import Document, StringField, DateTimeField, IntField
from datetime import datetime

class Documento(Document):
    """Modelo de Documento para MongoDB"""
    
    atencion_id = StringField(required=True, index=True)
    nombre_archivo = StringField(required=True)
    nombre_original = StringField(required=True)
    ruta_minio = StringField(required=True)
    tipo_archivo = StringField(required=True)
    tamaño = IntField(required=True)  # en bytes
    fecha_subida = DateTimeField(default=datetime.utcnow)
    usuario_subio = StringField(required=True)
    
    meta = {
        'collection': 'documentos',
        'indexes': ['atencion_id', 'fecha_subida']
    }
    
    def to_dict(self):
        """Convierte el documento a diccionario"""
        return {
            'id': str(self.id),
            'atencion_id': self.atencion_id,
            'nombre_archivo': self.nombre_archivo,
            'nombre_original': self.nombre_original,
            'ruta_minio': self.ruta_minio,
            'tipo_archivo': self.tipo_archivo,
            'tamaño': self.tamaño,
            'fecha_subida': self.fecha_subida.isoformat() if self.fecha_subida else None,
            'usuario_subio': self.usuario_subio
        }
