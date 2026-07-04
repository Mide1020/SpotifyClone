"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Song } from "@/type";
import { useUser } from "@/hooks/useUser";
import { songService } from "@/services/songService";
import MediaItem from "@/components/MediaItem";
import LikeButton from "@/components/LikeButton";
import useOnPlay from "@/hooks/useOnPlay";

interface LikedContentProps {
  songs: Song[]; // Initial songs — always empty, we fetch client-side
};

const LikedContent: React.FC<LikedContentProps> = () => {
  const router = useRouter();
  const { isLoading, user } = useUser();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const onPlay = useOnPlay(songs);

  // Redirect unauthenticated users away from this protected page
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/');
    }
  }, [isLoading, user, router]);

  // Fetch liked songs client-side once the user is authenticated
  useEffect(() => {
    if (!user?.id) return;

    const fetchLikedSongs = async () => {
      setIsFetching(true);
      try {
        const likedSongs = await songService.getLikedSongs(user.id);
        setSongs(likedSongs);
      } catch (error) {
        console.error("Error fetching liked songs:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchLikedSongs();
  }, [user?.id]);

  if (isFetching) {
    return (
      <div className="flex flex-col gap-y-2 w-full px-6 text-neutral-400">
        Loading liked songs...
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div 
        className="
          flex 
          flex-col 
          gap-y-2 
          w-full px-6 
          text-neutral-400
        "
      >
        No liked songs.
      </div>
    )
  }

  return ( 
    <div className="flex flex-col gap-y-2 w-full p-6">
      {songs.map((song: Song) => (
        <div 
          key={song.id} 
          className="flex items-center gap-x-4 w-full"
        >
          <div className="flex-1">
            <MediaItem onClick={(id) => onPlay(id)} data={song} />
          </div>
          <LikeButton songId={song.id} />
        </div>
      ))}
    </div>
  );
}
 
export default LikedContent;