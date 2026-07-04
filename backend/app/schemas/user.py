from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

# Properties to receive via API on user registration
class UserCreate(UserBase):
    password: str

# Properties to receive via API on login
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Properties to return to client (excludes password hash!)
class UserOut(UserBase):
    id: str
    is_active: bool
    created_at: datetime

    class Config:
        # Pydantic v2 configuration to allow parsing from SQLAlchemy models directly
        from_attributes = True

# JSON Web Token response schema
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# Schema stored in JWT payload
class TokenData(BaseModel):
    id: Optional[str] = None
