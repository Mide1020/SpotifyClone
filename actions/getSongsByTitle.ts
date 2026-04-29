import { Song } from "@/type";
import { songService } from "@/services/songService";

const getSongsByTitle = async (title: string): Promise<Song[]> => {
  try {
    const songs = await songService.getSongsByTitle(title);
    return songs;
  } catch (error) {
    console.error("Error fetching songs by title:", error);
    return [];
  }
};

export default getSongsByTitle;