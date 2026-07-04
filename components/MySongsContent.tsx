"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { FiTrash2, FiMusic } from "react-icons/fi";
import { BsPlayCircleFill } from "react-icons/bs";

import { useUser } from "@/hooks/useUser";
import usePlayer from "@/hooks/usePlayer";
import useOnPlay from "@/hooks/useOnPlay";
import { songService } from "@/services/songService";
import { Song } from "@/type";

const MySongsContent = () => {
  const { user } = useUser();
  const router = useRouter();
  const player = usePlayer();

  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const onPlay = useOnPlay(songs);

  useEffect(() => {
    if (!user?.id) {
      setSongs([]);
      setLoading(false);
      return;
    }

    const fetchSongs = async () => {
      setLoading(true);
      const data = await songService.getSongsByUserId(user.id);
      setSongs(data);
      setLoading(false);
    };

    fetchSongs();
  }, [user?.id]);

  const handleDelete = async (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    if (!user) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${song.title}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(song.id);
    try {
      await songService.deleteSong(song.id);
      setSongs((prev) => prev.filter((s) => s.id !== song.id));

      // Stop playback if this song is currently playing
      if (player.activeId === song.id) {
        player.reset();
      }

      toast.success(`"${song.title}" deleted successfully.`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete song.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-neutral-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-neutral-600 border-t-green-500 rounded-full animate-spin" />
          <p className="text-sm">Loading your songs…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-neutral-400">
        <FiMusic size={48} className="text-neutral-600" />
        <p className="text-lg font-medium">Sign in to see your uploaded songs</p>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-neutral-400">
        <FiMusic size={48} className="text-neutral-600" />
        <p className="text-lg font-medium">You haven&apos;t uploaded any songs yet</p>
        <p className="text-sm">Use the + button in the sidebar to upload your first track.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-y-2">
      {/* Table header */}
      <div className="hidden md:grid grid-cols-[auto_1fr_1fr_auto] gap-4 items-center px-4 py-2 text-xs uppercase tracking-wider text-neutral-500 border-b border-neutral-800">
        <span className="w-10">#</span>
        <span>Title</span>
        <span>Author</span>
        <span className="w-20 text-center">Action</span>
      </div>

      {songs.map((song, index) => (
        <div
          key={song.id}
          onClick={() => onPlay(song.id)}
          className="
            group
            grid
            grid-cols-[auto_1fr_auto]
            md:grid-cols-[auto_1fr_1fr_auto]
            gap-4
            items-center
            px-4
            py-3
            rounded-md
            cursor-pointer
            hover:bg-white/5
            transition-all
            duration-200
          "
        >
          {/* Index / play icon */}
          <div className="w-10 flex items-center justify-center text-neutral-500">
            <span className="group-hover:hidden text-sm">{index + 1}</span>
            <BsPlayCircleFill
              size={18}
              className="hidden group-hover:block text-white"
            />
          </div>

          {/* Cover + title */}
          <div className="flex items-center gap-x-3 min-w-0">
            <div className="relative h-10 w-10 flex-shrink-0 rounded overflow-hidden">
              <Image
                src={song.image_path || "/images/music-placeholder.png"}
                alt={song.title}
                fill
                className="object-cover"
              />
            </div>
            <p className="font-medium text-white truncate">{song.title}</p>
          </div>

          {/* Author (desktop only) */}
          <p className="hidden md:block text-neutral-400 text-sm truncate">
            {song.author}
          </p>

          {/* Delete button */}
          <div className="w-20 flex items-center justify-center">
            <button
              onClick={(e) => handleDelete(e, song)}
              disabled={deletingId === song.id}
              title="Delete song"
              className="
                flex items-center gap-x-1.5
                px-3 py-1.5
                rounded-full
                text-xs font-medium
                text-red-400
                border border-red-400/40
                hover:bg-red-500/20
                hover:border-red-400
                hover:text-red-300
                disabled:opacity-40
                disabled:cursor-not-allowed
                transition-all duration-200
              "
            >
              {deletingId === song.id ? (
                <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiTrash2 size={13} />
              )}
              <span className="hidden sm:inline">
                {deletingId === song.id ? "Deleting…" : "Delete"}
              </span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MySongsContent;
