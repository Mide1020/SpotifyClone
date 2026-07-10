import asyncio
from sqlalchemy import text
from app.core.database import engine

async def reset_database():
    print("Resetting database: dropping existing tables using CASCADE...")
    async with engine.begin() as conn:
        # Safely drop all tables using CASCADE to prevent any constraint blocks
        await conn.execute(text("DROP TABLE IF EXISTS liked_songs CASCADE;"))
        await conn.execute(text("DROP TABLE IF EXISTS songs CASCADE;"))
        await conn.execute(text("DROP TABLE IF EXISTS users CASCADE;"))
    print("Database tables dropped successfully!")

if __name__ == "__main__":
    asyncio.run(reset_database())
