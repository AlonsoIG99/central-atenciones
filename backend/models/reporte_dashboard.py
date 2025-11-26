from mongoengine import Document, StringField, DateTimeField, DictField
from datetime import datetime

class ReporteDashboard(Document):
    """Modelo de Reporte Dashboard - unión de datos de incidencias, trabajadores y asignados"""
    
    # Campos de Incidencia
    incidencia_id = StringField(required=True)
    dni = StringField(required=True, index=True)
    titulo_incidencia = StringField()
    descripcion_incidencia = StringField()
    estado_incidencia = StringField()
    fecha_creacion_incidencia = DateTimeField()
    fecha_cierre_incidencia = DateTimeField(null=True)
    dias_abierta = StringField(null=True)
    
    # Información del usuario que registró
    usuario_nombre = StringField()
    usuario_area = StringField()
    
    # Campos de Trabajador
    nombre_completo_trabajador = StringField()
    fecha_ingreso_trabajador = StringField(null=True)
    fecha_cese_trabajador = StringField(null=True)
    
    # Campos de Asignado
    tipo_compania = StringField(null=True)
    cliente = StringField(null=True)
    zona = StringField(null=True)
    lider_zonal = StringField(null=True)
    jefe_operaciones = StringField(null=True)
    macrozona = StringField(null=True)
    jurisdiccion = StringField(null=True)
    sector = StringField(null=True)
    
    # Metadatos
    fecha_generacion = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'reporte_dashboards',
        'indexes': ['dni', 'fecha_generacion']
    }
    
    def to_dict(self):
        """Convierte el documento a diccionario"""
        return {
            'id': str(self.id),
            'incidencia_id': self.incidencia_id,
            'dni': self.dni,
            'titulo_incidencia': self.titulo_incidencia,
            'descripcion_incidencia': self.descripcion_incidencia,
            'estado_incidencia': self.estado_incidencia,
            'fecha_creacion_incidencia': self.fecha_creacion_incidencia.isoformat() if self.fecha_creacion_incidencia else None,
            'fecha_cierre_incidencia': self.fecha_cierre_incidencia.isoformat() if self.fecha_cierre_incidencia else None,
            'dias_abierta': self.dias_abierta,
            'usuario_nombre': self.usuario_nombre,
            'usuario_area': self.usuario_area,
            'nombre_completo_trabajador': self.nombre_completo_trabajador,
            'fecha_ingreso_trabajador': self.fecha_ingreso_trabajador,
            'fecha_cese_trabajador': self.fecha_cese_trabajador,
            'tipo_compania': self.tipo_compania,
            'cliente': self.cliente,
            'zona': self.zona,
            'lider_zonal': self.lider_zonal,
            'jefe_operaciones': self.jefe_operaciones,
            'macrozona': self.macrozona,
            'jurisdiccion': self.jurisdiccion,
            'sector': self.sector,
            'fecha_generacion': self.fecha_generacion.isoformat() if self.fecha_generacion else None
        }
