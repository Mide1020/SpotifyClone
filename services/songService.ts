import { Song } from "@/type";
import songsMock from "@/mock-data/songs.json";
import likedSongsMock from "@/mock-data/likedSongs.json";

export const songService = {
  getSongs: async (): Promise<Song[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return songsMock as Song[];
  },

  getSongById: async (id: string): Promise<Song | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const song = songsMock.find((s) => s.id === id);
    return (song as Song) || null;
  },

  getSongsByUserId: async (userId: string): Promise<Song[]> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return (songsMock as Song[]).filter((s) => s.user_id === userId);
  },

  getSongsByTitle: async (title: string): Promise<Song[]> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (!title) return songsMock as Song[];
    return (songsMock as Song[]).filter((s) => 
      s.title.toLowerCase().includes(title.toLowerCase())
    );
  },

  getLikedSongs: async (userId: string): Promise<Song[]> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const likedIds = likedSongsMock
      .filter((ls) => ls.user_id === userId)
      .map((ls) => ls.song_id);
    return (songsMock as Song[]).filter((s) => likedIds.includes(s.id));
  },

  toggleLike: async (userId: string, songId: string): Promise<boolean> => {
    // In a real app, this would hit an endpoint
    console.log(`Toggling like for user ${userId} and song ${songId}`);
    return true;
  },

  uploadSong: async (values: any): Promise<void> => {
    console.log("Mock uploading song:", values);
    return Promise.resolve();
  }
};
