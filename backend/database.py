from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy import event
from typing import Generator
import os

# SQLite database URL - use /app/data for Docker volume mount
DATABASE_URL = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'data', 'hotel.db')}"

# Create engine with check_same_thread=False for SQLite
# Note: pool_pre_ping is not needed for SQLite as it's a file-based database
# and doesn't have the same connection drop issues as network databases
engine = create_engine(
    DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False},
)


@event.listens_for(engine, "connect")
def set_sqlite_pragmas(dbapi_connection, connection_record):
    """Apply SQLite performance pragmas on every connection."""
    cursor = dbapi_connection.cursor()
    # WAL mode: better concurrent read/write performance
    cursor.execute("PRAGMA journal_mode=WAL")
    # Wait up to 5 seconds for locks instead of immediate failure
    cursor.execute("PRAGMA busy_timeout=5000")
    # NORMAL is safe with WAL mode and reduces fsync overhead
    cursor.execute("PRAGMA synchronous=NORMAL")
    # 2MB page cache (value is in KB, negative means KB)
    cursor.execute("PRAGMA cache_size=-2000")
    cursor.close()


def init_db():
    """Initialize database tables"""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """Dependency to get database session"""
    with Session(engine) as session:
        yield session
