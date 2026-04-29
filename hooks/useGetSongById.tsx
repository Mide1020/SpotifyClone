import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Song } from "@/type";
import { songService } from "@/services/songService";

const useGetSongById = (id?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [song, setSong] = useState<Song | undefined>(undefined);

  useEffect(() => {
    if (!id) {
      return;
    }

    setIsLoading(true);

    const fetchSong = async () => {
      try {
        const data = await songService.getSongById(id);
        setSong(data || undefined);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSong();
  }, [id]);

  return useMemo(() => ({
    isLoading,
    song
  }), [isLoading, song]);
};

export default useGetSongById;