import { Song } from "@/type";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// Helper to retrieve the cached JWT token from local storage
const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("spotify_clone_token") : null;
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

export const songService = {
  getSongs: async (): Promise<Song[]> => {
    try {
      const response = await fetch(`${API_URL}/songs`);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error("Error in getSongs:", error);
      return [];
    }
  },

  getSongById: async (id: string): Promise<Song | null> => {
    try {
      const response = await fetch(`${API_URL}/songs/${id}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error("Error in getSongById:", error);
      return null;
    }
  },

  getSongsByUserId: async (userId: string): Promise<Song[]> => {
    try {
      // Securely fetch songs uploaded by the currently authenticated user
      const response = await fetch(`${API_URL}/songs/user`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error("Error in getSongsByUserId:", error);
      return [];
    }
  },

  getSongsByTitle: async (title: string): Promise<Song[]> => {
    try {
      const response = await fetch(`${API_URL}/songs/search?title=${encodeURIComponent(title)}`);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error("Error in getSongsByTitle:", error);
      return [];
    }
  },

  getLikedSongs: async (userId: string): Promise<Song[]> => {
    try {
      // Fetch liked songs for the currently authenticated user securely using JWT
      const response = await fetch(`${API_URL}/songs/liked`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error("Error in getLikedSongs:", error);
      return [];
    }
  },

  /**
   * Efficiently checks if a single song is liked by the current user.
   * Uses GET /songs/{id}/liked instead of fetching the entire liked list.
   */
  checkIsLiked: async (songId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/songs/${songId}/liked`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) return false;
      const data = await response.json();
      return data.liked;
    } catch (error) {
      console.error("Error in checkIsLiked:", error);
      return false;
    }
  },

  toggleLike: async (userId: string, songId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/songs/${songId}/like`, {
        method: "POST",
        headers: getAuthHeaders()
      });
      if (!response.ok) return false;
      const data = await response.json();
      return data.liked; // returns true if liked, false if unliked
    } catch (error) {
      console.error("Error in toggleLike:", error);
      return false;
    }
  },

  /**
   * Deletes a song uploaded by the current user.
   * The backend enforces ownership — only the uploader can delete.
   */
  deleteSong: async (songId: string): Promise<void> => {
    const response = await fetch(`${API_URL}/songs/${songId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to delete song.");
    }
  },

  uploadSong: async (values: any): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("author", values.author);
      
      // Support both styles of keys (songFile/song and imageFile/image)
      const song = values.songFile || (values.song?.[0] ? values.song[0] : values.song);
      const image = values.imageFile || (values.image?.[0] ? values.image[0] : values.image);

      if (song) {
        formData.append("songFile", song);
      }
      if (image) {
        formData.append("imageFile", image);
      }

      // NOTE: Do NOT set Content-Type header when sending FormData!
      // The browser automatically structures the multipart boundary when Content-Type is omitted.
      const response = await fetch(`${API_URL}/songs`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to upload song.");
      }
    } catch (error) {
      console.error("Error in uploadSong:", error);
      throw error;
    }
  }
};
