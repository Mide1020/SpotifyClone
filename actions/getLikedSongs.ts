// NOTE: This action no longer fetches liked songs server-side because
// JWT tokens are stored in localStorage, which is unavailable on the server.
// Liked songs are fetched client-side in LikedContent.tsx using songService.getLikedSongs().
import { Song } from "@/type";

const getLikedSongs = async (): Promise<Song[]> => {
  return [];
};

export default getLikedSongs;