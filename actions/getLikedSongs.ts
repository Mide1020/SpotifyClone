import { Song } from "@/type";
import { songService } from "@/services/songService";
import { userService } from "@/services/userService";

const getLikedSongs = async (): Promise<Song[]> => {
  try {
    const user = await userService.getCurrentUser();

    if (!user) {
      return [];
    }

    const songs = await songService.getLikedSongs(user.id);
    return songs;
  } catch (error) {
    console.error("Error fetching liked songs:", error);
    return [];
  }
};

export default getLikedSongs;