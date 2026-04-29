# Backend Specification for Spotify Clone

This document outlines the required API endpoints and data structures needed for the frontend to function correctly. The frontend currently uses a mock service layer located in `/services/`. To connect a real backend, you should update these services to make real HTTP requests.

## General Requirements

- **Base URL**: To be defined by the intern.
- **Authentication**: JWT-based authentication is recommended. Send the token in the `Authorization: Bearer <token>` header.
- **File Storage**: The backend must handle file uploads for songs (mp3) and images (jpg/png).

## Endpoints

### 1. Authentication
| Method | Endpoint | Description | Payload |
|--------|----------|-------------|---------|
| `POST` | `/auth/signup` | Register a new user | `{ email, password, full_name }` |
| `POST` | `/auth/login` | Login and receive a JWT | `{ email, password }` |
| `POST` | `/auth/logout` | Invalidate the current session | N/A |
| `GET` | `/auth/me` | Get current user session | N/A |

### 2. User Profiles
| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| `GET` | `/users/:id` | Get user details | `{ id, first_name, last_name, full_name, avatar_url }` |

### 3. Songs
| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| `GET` | `/songs` | List all songs (sorted by newest) | `Song[]` |
| `GET` | `/songs/search` | Search songs by title or author | `Song[]` (query param: `?title=...`) |
| `GET` | `/songs/user` | Get songs uploaded by the current user | `Song[]` |
| `GET` | `/songs/:id` | Get a specific song by ID | `Song` |
| `POST` | `/songs` | Upload a new song | `multipart/form-data` (fields: `title`, `author`, `songFile`, `imageFile`) |

### 4. Liked Songs
| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| `GET` | `/songs/liked` | Get list of songs liked by current user | `Song[]` |
| `POST` | `/songs/:id/like` | Toggle like/unlike status | `{ success: boolean, liked: boolean }` |

## Data Models

### Song Object
```json
{
  "id": "string",
  "user_id": "string",
  "author": "string",
  "title": "string",
  "song_path": "string (full URL to mp3)",
  "image_path": "string (full URL to image)"
}
```

### User Object
```json
{
  "id": "string",
  "email": "string",
  "first_name": "string",
  "last_name": "string",
  "full_name": "string",
  "avatar_url": "string"
}
```

## Migration Guide for Intern

1. **Service Layer**: Open `services/songService.ts` and `services/userService.ts`.
2. **Implementation**: Replace the mock JSON imports and logic with `axios` or `fetch` calls to your backend.
3. **Environment Variables**: Create a `.env.local` file with `NEXT_PUBLIC_API_URL` and use it in your services.
