from app.core.database import Base
from app.models.user import User
from app.models.song import Song, liked_songs

# Expose all models to ensure they are registered on Base.metadata before import by migrations/Alembic.
__all__ = ["Base", "User", "Song", "liked_songs"]
