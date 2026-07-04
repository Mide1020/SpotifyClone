from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, desc
import uuid
import os
from typing import List, Optional, Tuple

from app.models.song import Song, liked_songs

class CRUDSong:
    """
    CRUD (Create, Read, Update, Delete) repository class for managing
    the Song model and junction like table operations.
    """

    async def get_by_id(self, db: AsyncSession, song_id: str) -> Optional[Song]:
        """
        Retrieves a single song by its unique ID.
        """
        result = await db.execute(select(Song).where(Song.id == song_id))
        return result.scalars().first()

    async def get_multi(self, db: AsyncSession) -> List[Song]:
        """
        Retrieves all songs, sorted by newest upload.
        """
        result = await db.execute(select(Song).order_by(desc(Song.created_at)))
        return result.scalars().all()

    async def search(self, db: AsyncSession, *, query: str) -> List[Song]:
        """
        Searches songs whose title or author contains the search query (case-insensitive).
        """
        stmt = select(Song)
        if query:
            stmt = stmt.where(
                (Song.title.ilike(f"%{query}%")) | (Song.author.ilike(f"%{query}%"))
            )
        result = await db.execute(stmt.order_by(desc(Song.created_at)))
        return result.scalars().all()

    async def get_by_user(self, db: AsyncSession, *, user_id: str) -> List[Song]:
        """
        Retrieves all songs uploaded by a specific user.
        """
        result = await db.execute(
            select(Song).where(Song.user_id == user_id).order_by(desc(Song.created_at))
        )
        return result.scalars().all()

    async def get_liked_songs(self, db: AsyncSession, *, user_id: str) -> List[Song]:
        """
        Retrieves all songs that have been liked by a specific user.
        """
        stmt = (
            select(Song)
            .join(liked_songs, Song.id == liked_songs.c.song_id)
            .where(liked_songs.c.user_id == user_id)
            .order_by(desc(liked_songs.c.created_at))
        )
        result = await db.execute(stmt)
        return result.scalars().all()

    async def create(
        self, 
        db: AsyncSession, 
        *, 
        title: str, 
        author: str, 
        song_path: str, 
        image_path: str, 
        user_id: str
    ) -> Song:
        """
        Saves uploaded song file paths and metadata to the database.
        """
        song_id = str(uuid.uuid4())
        db_song = Song(
            id=song_id,
            user_id=user_id,
            title=title,
            author=author,
            song_path=song_path,
            image_path=image_path
        )
        db.add(db_song)
        await db.commit()
        await db.refresh(db_song)
        return db_song

    async def delete(self, db: AsyncSession, *, song: Song) -> None:
        """
        Deletes a song record from the database.
        The caller is responsible for deleting the associated files from disk.
        """
        await db.delete(song)
        await db.commit()

    async def is_liked(self, db: AsyncSession, *, song_id: str, user_id: str) -> bool:
        """
        Checks if a specific song has been liked by a specific user.
        Returns True if liked, False otherwise.
        """
        stmt = select(liked_songs).where(
            liked_songs.c.user_id == user_id,
            liked_songs.c.song_id == song_id
        )
        result = await db.execute(stmt)
        return result.first() is not None

    async def toggle_like(self, db: AsyncSession, *, song_id: str, user_id: str) -> Tuple[bool, bool]:
        """
        Toggles a song's liked status for a user.
        
        Returns:
            A tuple of (success_boolean, liked_boolean) indicating if the action
            succeeded and whether the song is now liked (True) or unliked (False).
        """
        # Re-use is_liked to check current state
        has_liked = await self.is_liked(db, song_id=song_id, user_id=user_id)

        if has_liked:
            # Unlike: Remove entry from liked_songs
            delete_stmt = liked_songs.delete().where(
                liked_songs.c.user_id == user_id,
                liked_songs.c.song_id == song_id
            )
            await db.execute(delete_stmt)
            await db.commit()
            return True, False
        else:
            # Like: Insert entry into liked_songs
            insert_stmt = liked_songs.insert().values(user_id=user_id, song_id=song_id)
            await db.execute(insert_stmt)
            await db.commit()
            return True, True

# Global singleton repository instance
song_crud = CRUDSong()
