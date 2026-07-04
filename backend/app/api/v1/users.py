from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.user import UserOut
from app.crud import user_crud

router = APIRouter()

@router.get("/{id}", response_model=UserOut)
async def get_user_profile(id: str, db: AsyncSession = Depends(get_db)):
    """
    Retrieves public profile details for a user by their unique ID.
    
    Delegates database query to CRUDUser.
    """
    user = await user_crud.get_by_id(db, user_id=id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The requested user profile does not exist."
        )
    return user
