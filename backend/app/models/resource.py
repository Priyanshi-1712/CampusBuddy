from sqlalchemy import Column, Integer, String
from app.core.database import Base # Or wherever your Base is

class Resource(Base): # <--- Ensure this name is exactly 'Resource'
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    type = Column(String)
    price = Column(Integer)
    location = Column(String)
    owner = Column(String)