from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
import app.models
from app.core.config import settings
from app.api.v1 import api_router
from app.core.database import Base, engine

# The lifespan context manager handles application startup and shutdown events asynchronously.
# Here, it automatically builds all defined database tables in PostgreSQL if they do not already exist.
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup event: Initialize database models
    print("Initializing database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables initialized successfully!")
    
    yield
    
    # Shutdown event: (Cleanup logic can go here)
    print("Shutting down application...")

# Initialize the main FastAPI application with settings
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS (Cross-Origin Resource Sharing) middleware configuration
# Allows the frontend (Next.js on port 3000) to communicate with this backend (on port 8000).
cors_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://spotify-clone-zeta-blue.vercel.app",
]

# Allow specifying additional origins via environment variable (comma-separated)
env_origins = os.getenv("CORS_ORIGINS")
if env_origins:
    cors_origins.extend([origin.strip() for origin in env_origins.split(",") if origin.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Ensure the upload directory path exists on disk
os.makedirs("static", exist_ok=True)

# Mount the static directory to serve files at http://localhost:8000/static/...
app.mount("/static", StaticFiles(directory="static"), name="static")

# Mount all endpoint routers under the configured API V1 prefix (/api/v1)
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    """
    Server health check endpoint.
    """
    return {
        "status": "online",
        "message": f"Welcome to the {settings.PROJECT_NAME}!",
        "documentation": "/docs"
    }
