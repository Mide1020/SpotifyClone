import { Song } from "@/type";

const useLoadImage = (song: Song) => {
  if (!song) {
    return null;
  }

  return song.image_path;
};

export default useLoadImage;