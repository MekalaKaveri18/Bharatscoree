import os
from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL")

def get_engine():
    url = os.getenv("DATABASE_URL")
    if not url:
        url = "postgresql+psycopg2://postgres:Kala1729@localhost:5432/bharatscore"
    return create_engine(url, pool_pre_ping=True, future=True)

SessionLocal = sessionmaker(bind=get_engine(), autocommit=False, autoflush=False, future=True)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
