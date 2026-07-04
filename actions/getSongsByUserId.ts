// NOTE: This action no longer fetches user songs server-side because
// JWT tokens are stored in localStorage, which is unavailable on the server.
// User songs are fetched client-side in Library.tsx using songService.getSongsByUserId().
import { Song } from "@/type";

const getSongsByUserId = async (): Promise<Song[]> => {
  return [];
};

export default getSongsByUserId;