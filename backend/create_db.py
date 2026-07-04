import asyncio
import asyncpg

async def create_database():
    # Connect to the default 'postgres' database
    conn = await asyncpg.connect('postgresql://postgres:1234@localhost:5432/postgres')
    try:
        # Create the new database
        await conn.execute('CREATE DATABASE spotify_clone')
        print("Database 'spotify_clone' created successfully.")
    except asyncpg.exceptions.DuplicateDatabaseError:
        print("Database 'spotify_clone' already exists.")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(create_database())
