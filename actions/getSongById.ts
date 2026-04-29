import { Song } from "@/type";
import { songService } from "@/services/songService";

const getSongById = async (id: string): Promise<Song | null> => {
  try {
    const song = await songService.getSongById(id);
    return song;
  } catch (error) {
    console.error("Error fetching song by id:", error);
    return null;
  }
};

export default getSongById;