from sqlalchemy import String, ForeignKey, DateTime, Column, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.core.database import Base
from typing import List

# Association Table for Liked Songs (Many-to-Many between User and Song)
# It records which users liked which songs, and when.
liked_songs = Table(
    "liked_songs",
    Base.metadata,
    Column("user_id", String, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("song_id", String, ForeignKey("songs.id", ondelete="CASCADE"), primary_key=True),
    Column("created_at", DateTime, server_default=func.now())
)

class Song(Base):
    __tablename__ = "songs"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, index=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    author: Mapped[str] = mapped_column(String, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String, nullable=False, index=True)
    
    # Path/URL to the uploaded audio (.mp3) and cover image (.jpg/.png)
    song_path: Mapped[str] = mapped_column(String, nullable=False)
    image_path: Mapped[str] = mapped_column(String, nullable=False)
    
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

    # Relationships
    # Direct relationship to the user who uploaded the song.
    uploader: Mapped["User"] = relationship("User", back_populates="songs", foreign_keys=[user_id])
    
    # Many-to-many relationship tracking who has liked this song.
    liked_by: Mapped[List["User"]] = relationship(
        "User",
        secondary=liked_songs,
        back_populates="liked_songs"
    )
