import os
import shutil
import uuid
import asyncio
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.song import SongOut, LikeToggleResult, IsLikedResult
from app.crud import song_crud

router = APIRouter()

# Define local media storage paths inside the backend directory
UPLOAD_DIR = "static/uploads"
SONGS_UPLOAD_DIR = os.path.join(UPLOAD_DIR, "songs")
IMAGES_UPLOAD_DIR = os.path.join(UPLOAD_DIR, "images")

# Automatically construct folders if they don't exist
os.makedirs(SONGS_UPLOAD_DIR, exist_ok=True)
os.makedirs(IMAGES_UPLOAD_DIR, exist_ok=True)

# File size limits
MAX_AUDIO_SIZE_BYTES = 50 * 1024 * 1024   # 50 MB
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024    # 5 MB


async def save_upload_file(upload_file: UploadFile, destination_folder: str) -> str:
    """
    Asynchronously saves an uploaded file with a unique UUID filename to avoid collisions.
    Uses asyncio.to_thread to avoid blocking the event loop during disk I/O.
    """
    file_ext = os.path.splitext(upload_file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(destination_folder, unique_filename)

    contents = await upload_file.read()

    def write_file():
        with open(file_path, "wb") as f:
            f.write(contents)

    await asyncio.to_thread(write_file)
    return unique_filename


def delete_file_if_exists(file_path: str) -> None:
    """
    Safely deletes a file from disk if it exists. Silently ignores missing files.
    """
    if os.path.exists(file_path):
        os.remove(file_path)


@router.post("", response_model=SongOut, status_code=status.HTTP_201_CREATED)
async def upload_song(
    request: Request,
    title: str = Form(...),
    author: str = Form(...),
    songFile: UploadFile = File(...),
    imageFile: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Uploads a new song.
    
    - Accepts multipart/form-data.
    - Validates file extensions and size limits.
    - Saves binary files to disk asynchronously.
    - Delegates database persist operations to CRUDSong repository.
    """
    # 1. Extension validation
    if not songFile.filename.lower().endswith(('.mp3', '.wav', '.ogg', '.m4a')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Unsupported audio format. Please upload MP3, WAV, OGG, or M4A."
        )
    if not imageFile.filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Unsupported image format. Please upload JPG, JPEG, PNG, or WEBP."
        )

    # 2. File size validation
    song_contents = await songFile.read()
    if len(song_contents) > MAX_AUDIO_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Audio file too large. Maximum allowed size is 50MB."
        )
    await songFile.seek(0)

    image_contents = await imageFile.read()
    if len(image_contents) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image file too large. Maximum allowed size is 5MB."
        )
    await imageFile.seek(0)

    # 3. Save files to local disk storage (async, non-blocking)
    song_filename = await save_upload_file(songFile, SONGS_UPLOAD_DIR)
    image_filename = await save_upload_file(imageFile, IMAGES_UPLOAD_DIR)
    
    # 4. Form absolute URL dynamically
    base_url = str(request.base_url)
    song_path = f"{base_url}static/uploads/songs/{song_filename}"
    image_path = f"{base_url}static/uploads/images/{image_filename}"
    
    # 5. Delegate DB storage to CRUD layer
    return await song_crud.create(
        db, 
        title=title, 
        author=author, 
        song_path=song_path, 
        image_path=image_path, 
        user_id=current_user.id
    )


@router.get("", response_model=List[SongOut])
async def get_songs(db: AsyncSession = Depends(get_db)):
    """
    Lists all songs in the system, sorted by newest upload.
    """
    return await song_crud.get_multi(db)


@router.get("/search", response_model=List[SongOut])
async def search_songs(title: str = "", db: AsyncSession = Depends(get_db)):
    """
    Searches songs by matching query strings against song title or author.
    """
    return await song_crud.search(db, query=title)


@router.get("/user", response_model=List[SongOut])
async def get_user_songs(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Gets all songs uploaded by the current authenticated user.
    """
    return await song_crud.get_by_user(db, user_id=current_user.id)


@router.get("/liked", response_model=List[SongOut])
async def get_liked_songs(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Gets all songs liked by the current authenticated user.
    """
    return await song_crud.get_liked_songs(db, user_id=current_user.id)


@router.get("/{id}/liked", response_model=IsLikedResult)
async def check_song_liked(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Checks whether the current user has liked a specific song.
    Returns { liked: true/false }.
    """
    liked = await song_crud.is_liked(db, song_id=id, user_id=current_user.id)
    return IsLikedResult(liked=liked)


@router.get("/{id}", response_model=SongOut)
async def get_song_by_id(id: str, db: AsyncSession = Depends(get_db)):
    """
    Gets a specific song by its unique ID.
    """
    song = await song_crud.get_by_id(db, song_id=id)
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="The requested song could not be found."
        )
    return song


@router.post("/{id}/like", response_model=LikeToggleResult)
async def toggle_like_song(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Toggles the like/unlike status of a song for the current user.
    """
    # 1. Verify the song exists
    song = await song_crud.get_by_id(db, song_id=id)
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Cannot like/unlike a song that does not exist."
        )
        
    # 2. Delegate like-toggling to CRUD layer
    success, liked = await song_crud.toggle_like(db, song_id=id, user_id=current_user.id)
    return LikeToggleResult(success=success, liked=liked)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_song(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Deletes a song uploaded by the current user.
    
    - Only the song's uploader can delete it.
    - Removes the song and image files from disk.
    - Removes the database record (cascade deletes likes).
    """
    song = await song_crud.get_by_id(db, song_id=id)
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The requested song could not be found."
        )

    # Ownership check — only the uploader can delete their song
    if song.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this song."
        )

    # Extract local file paths from the stored URLs and delete files from disk
    # URL format: http://localhost:8000/static/uploads/songs/filename.mp3
    try:
        song_filename = song.song_path.split("/static/uploads/songs/")[-1]
        image_filename = song.image_path.split("/static/uploads/images/")[-1]
        delete_file_if_exists(os.path.join(SONGS_UPLOAD_DIR, song_filename))
        delete_file_if_exists(os.path.join(IMAGES_UPLOAD_DIR, image_filename))
    except Exception:
        # Do not fail the request if file deletion encounters an issue
        pass

    # Delete the DB record (cascade will also remove liked_songs rows)
    await song_crud.delete(db, song=song)
