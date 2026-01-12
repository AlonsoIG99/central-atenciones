from mongoengine import Document, StringField, DateTimeField, DictField, ListField
from datetime import datetime

class ReporteDashboard(Document):
    """Modelo de Reporte Dashboard - unión de datos de atenciones, trabajadores y asignados"""
    
    # Campos de Atención
    atencion_id = StringField(required=True)
    dni = StringField(required=True, index=True)
    canal = StringField(null=True)
    titulo_atencion = StringField()
    descripcion_atencion = StringField()
    estado_atencion = StringField()
    consultas = ListField(StringField(), default=list)  # Lista de consultas específicas
    fecha_creacion_atencion = DateTimeField()
    fecha_cierre_atencion = DateTimeField(null=True)
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
            'atencion_id': self.atencion_id,
            'dni': self.dni,
            'canal': self.canal,
            'titulo_atencion': self.titulo_atencion,
            'descripcion_atencion': self.descripcion_atencion,
            'estado_atencion': self.estado_atencion,
            'consultas': self.consultas if self.consultas else [],
            'fecha_creacion_atencion': self.fecha_creacion_atencion.isoformat() if self.fecha_creacion_atencion else None,
            'fecha_cierre_atencion': self.fecha_cierre_atencion.isoformat() if self.fecha_cierre_atencion else None,
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
