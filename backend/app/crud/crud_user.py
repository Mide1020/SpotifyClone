from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
from typing import Optional

from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash

class CRUDUser:
    """
    CRUD (Create, Read, Update, Delete) repository class for managing 
    the User model database operations.
    """
    
    async def get_by_id(self, db: AsyncSession, user_id: str) -> Optional[User]:
        """
        Retrieves a user by their unique string/UUID ID.
        """
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalars().first()

    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        """
        Retrieves a user by their unique email address.
        """
        result = await db.execute(select(User).where(User.email == email))
        return result.scalars().first()

    async def create(self, db: AsyncSession, *, obj_in: UserCreate) -> User:
        """
        Registers a new user, hashes their password, and persists their details in PostgreSQL.
        """
        # Generate a unique UUID for the user
        user_id = str(uuid.uuid4())
        
        # Split names if full_name is present but first/last names are empty
        first_name = obj_in.first_name
        last_name = obj_in.last_name
        if obj_in.full_name and not (first_name or last_name):
            parts = obj_in.full_name.split(" ", 1)
            first_name = parts[0]
            last_name = parts[1] if len(parts) > 1 else ""

        # Create SQLAlchemy ORM object
        db_user = User(
            id=user_id,
            email=obj_in.email,
            hashed_password=get_password_hash(obj_in.password),
            first_name=first_name,
            last_name=last_name,
            full_name=obj_in.full_name,
            avatar_url=obj_in.avatar_url
        )
        
        # Add to session and save
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        return db_user

# Global singleton repository instance
user_crud = CRUDUser()
