from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # Role-based access levels: explorer | contributor | verifier | moderator | admin
    role = Column(String, default="explorer", nullable=False)
    
    # Track contributor standing in the community (used in trust workflows)
    reputation_score = Column(Integer, default=0, nullable=False)
    
    created_at = Column(DateTime, default=utcnow, nullable=False)
