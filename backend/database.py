import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


def _resolve_database_url() -> str:
    # Render can provide postgres://; SQLAlchemy expects postgresql://
    db_url = os.getenv("DATABASE_URL", "sqlite:///./users.db")
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    return db_url


DATABASE_URL = _resolve_database_url()

engine_kwargs = {}
if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_kwargs)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()