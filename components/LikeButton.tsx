"use client";

import { useEffect, useState } from "react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import { useUser } from "@/hooks/useUser";
import useAuthModal from "@/hooks/useAuthModal";
import { songService } from "@/services/songService";

interface LikeButtonProps {
  songId: string;
};

const LikeButton: React.FC<LikeButtonProps> = ({
  songId
}) => {
  const router = useRouter();
  const authModal = useAuthModal();
  const { user } = useUser();

  const [isLiked, setIsLiked] = useState<boolean>(false);

  useEffect(() => {
    if (!user?.id) {
      return;
    }
  
    const fetchData = async () => {
      try {
        const likedSongs = await songService.getLikedSongs(user.id);
        const isCurrentlyLiked = likedSongs.some((s) => s.id === songId);
        setIsLiked(isCurrentlyLiked);
      } catch (error) {
        console.error("Error fetching liked status:", error);
      }
    }

    fetchData();
  }, [songId, user?.id]);

  const Icon = isLiked ? AiFillHeart : AiOutlineHeart;

  const handleLike = async () => {
    if (!user) {
      return authModal.onOpen();
    }

    try {
      const success = await songService.toggleLike(user.id, songId);
      
      if (success) {
        setIsLiked(!isLiked);
        toast.success(isLiked ? 'Song unliked' : 'Song liked');
      }
    } catch (error: any) {
      toast.error(error.message);
    }

    router.refresh();
  }

  return (
    <button 
      className="
        cursor-pointer 
        hover:opacity-75 
        transition
      "
      onClick={handleLike}
    >
      <Icon color={isLiked ? '#22c55e' : 'white'} size={25} />
    </button>
  );
}

export default LikeButton;