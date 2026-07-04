from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import verify_password, create_access_token
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserOut, Token
from app.crud import user_crud

router = APIRouter()

@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def signup(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Registers a new user in the system.
    
    Delegates user check and creation to the CRUD repository layer.
    """
    existing_user = await user_crud.get_by_email(db, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
    
    return await user_crud.create(db, obj_in=user_in)

@router.post("/login", response_model=Token)
async def login(user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    """
    Logs in an existing user using JSON credentials.
    Returns a JWT access token.
    """
    user = await user_crud.get_by_email(db, email=user_in.email)
    
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    
    return Token(
        access_token=create_access_token(user.id),
        token_type="bearer"
    )

@router.post("/login-swagger", response_model=Token)
async def login_swagger(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    """
    Utility endpoint for Swagger UI login. 
    Accepts form-urlencoded credentials.
    """
    user = await user_crud.get_by_email(db, email=form_data.username)
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    
    return Token(
        access_token=create_access_token(user.id),
        token_type="bearer"
    )

@router.post("/logout")
async def logout():
    """
    Standard logout endpoint.
    JWT is stateless, so client should destroy their token.
    """
    return {"detail": "Successfully logged out. Please clear your JWT token from local storage."}

@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the currently logged-in user profile, resolved via get_current_user dependency.
    """
    return current_user
