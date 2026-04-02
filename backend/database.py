from sqlmodel import SQLModel, create_engine, Session
from typing import Generator
import os

# SQLite database URL - use /app/data for Docker volume mount
DATABASE_URL = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'data', 'hotel.db')}"

# Create engine with check_same_thread=False for SQLite
engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})


def init_db():
    """Initialize database tables"""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """Dependency to get database session"""
    with Session(engine) as session:
        yield session