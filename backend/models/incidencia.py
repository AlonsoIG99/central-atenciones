from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Incidencia(Base):
    __tablename__ = "incidencias"
    
    id = Column(Integer, primary_key=True, index=True)
    dni = Column(String, index=True)
    titulo = Column(String, index=True)
    descripcion = Column(String)
    estado = Column(String, default="abierta")
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_actualizacion = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

