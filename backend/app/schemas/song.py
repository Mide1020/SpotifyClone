from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Shared properties
class SongBase(BaseModel):
    title: str
    author: str

# Properties returned to the client (matches BACKEND_SPEC.md requirements)
class SongOut(SongBase):
    id: str
    user_id: str
    song_path: str
    image_path: str
    created_at: datetime

    class Config:
        from_attributes = True

# Response schema when toggling a song like
class LikeToggleResult(BaseModel):
    success: bool
    liked: bool

# Response schema when checking if a single song is liked
class IsLikedResult(BaseModel):
    liked: bool
