"use client";
import React, { useEffect, useState } from "react";
import { TbPlaylist, TbTrash } from "react-icons/tb";
import { AiOutlinePlus } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import { useUser } from "@/hooks/useUser";
import useAuthModal from "@/hooks/useAuthModal";
import useUploadModal from "@/hooks/useUploadModal";
import useOnPlay from "@/hooks/useOnPlay";
import usePlayer from "@/hooks/usePlayer";
import MediaItem from "./MediaItem";
import { Song } from "@/type";
import { songService } from "@/services/songService";

type Props = {
  songs: Song[]; // Initial songs (can be empty — we fetch client-side)
};

const Library = ({ songs: initialSongs }: Props) => {
  const { user } = useUser();
  const uploadModal = useUploadModal();
  const authModal = useAuthModal();
  const router = useRouter();
  const player = usePlayer();

  const [songs, setSongs] = useState<Song[]>(initialSongs);

  // Fetch user's uploaded songs client-side whenever the user changes
  useEffect(() => {
    if (!user?.id) {
      setSongs([]);
      return;
    }

    const fetchUserSongs = async () => {
      const userSongs = await songService.getSongsByUserId(user.id);
      setSongs(userSongs);
    };

    fetchUserSongs();
  }, [user?.id]);

  const onPlay = useOnPlay(songs);

  const handleDelete = async (id: string) => {
    if (!user) return;

    const confirmDelete = window.confirm("Are you sure you want to delete this song?");
    if (!confirmDelete) return;

    try {
      await songService.deleteSong(id);
      setSongs((prevSongs) => prevSongs.filter((song) => song.id !== id));
      
      if (player.activeId === id) {
        player.reset();
      }

      toast.success("Song deleted!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete song.");
    }
  };

  const onClick = () => {
    if (!user) {
      return authModal.onOpen();
    }
    return uploadModal.onOpen();
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-5 pt-4">
        <div className="inline-flex items-center gap-x-2">
          <TbPlaylist size={26} className="text-neutral-500" />
          <p className="text-neutral-500 text-md font-medium">
            Your Library
          </p>
        </div>
        <AiOutlinePlus
          onClick={onClick}
          size={20}
          className="text-neutral-500 cursor-pointer hover:text-white transition duration-300"
        />
      </div>

      <div className="flex flex-col gap-y-2 mt-4 px-3">
        {songs.length === 0 ? (
          <p className="text-neutral-500 text-sm px-2">
            {user ? "No songs uploaded yet." : "Log in to see your library."}
          </p>
        ) : (
          songs.map((item) => (
            <div 
              key={item.id} 
              className="flex items-center justify-between group w-full gap-x-2"
            >
              <div className="flex-1 overflow-hidden">
                <MediaItem
                  onClick={(id: string) => onPlay(id)}
                  data={item}
                />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item.id);
                }}
                className="
                  flex items-center gap-x-1
                  px-2 py-1
                  rounded-full
                  text-xs font-medium
                  text-red-400
                  border border-red-400/40
                  hover:bg-red-500/20
                  hover:border-red-400
                  transition-all
                  duration-200
                  cursor-pointer
                  flex-shrink-0
                "
                title="Delete song"
              >
                <TbTrash size={14} />
                <span>Delete</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Library;
