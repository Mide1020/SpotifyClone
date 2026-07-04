from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import settings
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User

# This tells FastAPI how to read the Bearer token from the 'Authorization' header.
# Pointing tokenUrl to our login endpoint allows Swagger UI to authenticate directly using the 'Authorize' lock icon!
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login-swagger", # Custom swagger login route or standard
    auto_error=False
)

async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    """
    Dependency that extracts the JWT token from the Request header, 
    decodes it, verifies the user exists in the database, and returns the User object.
    
    Raises 401 Unauthorized if verification fails.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Missing Authorization Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    user_id = decode_access_token(token)
    if user_id is None:
        raise credentials_exception
        
    # Execute async query to find the user in the database
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="This user account has been deactivated."
        )
        
    return user
