from mongoengine import Document, StringField

class Asignado(Document):
    """Modelo de Asignado (empleados activos) para MongoDB"""
    
    dni = StringField(required=True)
    tipo_compania = StringField(null=True)
    nombre_completo = StringField(required=True)
    fecha_ingreso = StringField(null=True)
    cliente = StringField(null=True)
    zona = StringField(null=True, index=True)
    lider_zonal = StringField(null=True)
    jefe_operaciones = StringField(null=True)
    macrozona = StringField(null=True, index=True)
    jurisdiccion = StringField(null=True)
    sector = StringField(null=True)
    estado = StringField(default="activo", choices=["activo", "inactivo"])
    
    meta = {
        'collection': 'asignados',
        'indexes': [
            {'fields': ['dni'], 'unique': True, 'sparse': True},
            'zona',
            'macrozona',
            'estado'
        ]
    }
    
    def to_dict(self):
        """Convierte el documento a diccionario"""
        return {
            'id': str(self.id),
            'dni': self.dni,
            'tipo_compania': self.tipo_compania,
            'nombre_completo': self.nombre_completo,
            'fecha_ingreso': self.fecha_ingreso,
            'cliente': self.cliente,
            'zona': self.zona,
            'lider_zonal': self.lider_zonal,
            'jefe_operaciones': self.jefe_operaciones,
            'macrozona': self.macrozona,
            'jurisdiccion': self.jurisdiccion,
            'sector': self.sector,
            'estado': self.estado
        }
