import { Song } from "@/type";
import { songService } from "@/services/songService";
import { userService } from "@/services/userService";

const getSongsByUserId = async (): Promise<Song[]> => {
  try {
    const user = await userService.getCurrentUser();
    
    if (!user) {
      return [];
    }

    const songs = await songService.getSongsByUserId(user.id);
    return songs;
  } catch (error) {
    console.error("Error fetching songs by user id:", error);
    return [];
  }
};

export default getSongsByUserId;