from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    contraseña = Column(String)
    rol = Column(String, default="gestor")  # "administrador" o "gestor"
    area = Column(String, index=True)  # Área a la que pertenece
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    
    incidencias = relationship("Incidencia", back_populates="usuario")
