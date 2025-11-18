from sqlalchemy import Column, Integer, String
from database import Base

class Trabajador(Base):
    __tablename__ = "trabajadores"
    
    id = Column(Integer, primary_key=True, index=True)
    dni = Column(String, unique=True, index=True, nullable=False)
    nombre_completo = Column(String, nullable=False)
    fecha_ingreso = Column(String, nullable=True)
    fecha_cese = Column(String, nullable=True)
