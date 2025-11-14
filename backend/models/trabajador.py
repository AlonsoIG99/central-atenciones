from sqlalchemy import Column, Integer, String
from database import Base

class Trabajador(Base):
    __tablename__ = "trabajadores"
    
    id = Column(Integer, primary_key=True, index=True)
    dni = Column(String, unique=True, index=True, nullable=False)
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)
    zona = Column(String, nullable=False)
