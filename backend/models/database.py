from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import declarative_base, sessionmaker

# For production, load this from environment variables!
SQLALCHEMY_DATABASE_URL = "sqlite:///backend/snagdef.db"
# For PostgreSQL later:
# SQLALCHEMY_DATABASE_URL = "postgresql://user:password@localhost/snagdef_db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}  # SQLite only
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user", nullable=False)  # 'user' or 'admin'

    # Keep models pure; handle password logic in your security utils or services.

    # These methods are better handled in your security utils, not the model itself.
    # If you want to keep them, import the functions at the top:
    # from backend.utils.security import hash_password, verify_password
    # But for best practice, keep models pure and handle hashing in your routes/services.
       
    def set_password(self, password: str):
        self.hashed_password = hash_password(password)
    
    def check_password(self, password: str) -> bool:
        return verify_password(password, self.hashed_password)