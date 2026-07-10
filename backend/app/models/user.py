from sqlalchemy import String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.core.database import Base
from typing import List, Optional, TYPE_CHECKING
if TYPE_CHECKING:
    from app.models.song import Song
class User(Base):
    __tablename__ = "users"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    first_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    last_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    full_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    cover_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    # Relationships
    # A user can upload many songs. If a user is deleted, all their uploaded songs are cascadingly deleted.
    songs: Mapped[List["Song"]] = relationship(
        "Song", 
        back_populates="uploader", 
        cascade="all, delete-orphan",
        foreign_keys="[Song.user_id]"
    )
    
    # Many-to-many relationship for Liked Songs.
    liked_songs: Mapped[List["Song"]] = relationship(
        "Song",
        secondary="liked_songs",
        back_populates="liked_by"
    )
