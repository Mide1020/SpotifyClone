from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

# Create an async database engine
# echo=True allows logging all raw SQL statements to the console—excellent for learning and debugging!
# engine = create_async_engine(
#     settings.DATABASE_URL,
#     echo=True,
#     future=True
# )

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True,
    future=True,
    connect_args={
        "statement_cache_size": 0
    }
)

# Create a sessionmaker factory configured for async database sessions
SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# The base class for all our database models (SQLAlchemy ORM models)
class Base(DeclarativeBase):
    pass

# FastAPI Dependency that yields a new database session per request
# Using 'async with' ensures the connection is automatically closed or rolled back when the request ends.
async def get_db():
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
