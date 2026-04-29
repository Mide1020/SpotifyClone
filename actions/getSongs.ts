import { Song } from "@/type";
import { songService } from "@/services/songService";

const getSongs = async (): Promise<Song[]> => {
  try {
    const songs = await songService.getSongs();
    return songs;
  } catch (error) {
    console.error("Error fetching songs:", error);
    return [];
  }
};

export default getSongs;
