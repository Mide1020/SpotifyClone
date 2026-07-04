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

const LikeButton: React.FC<LikeButtonProps> = ({ songId }) => {
  const router = useRouter();
  const authModal = useAuthModal();
  const { user } = useUser();

  const [isLiked, setIsLiked] = useState<boolean>(false);

  // Efficiently check if this single song is liked — no full-list fetch needed
  useEffect(() => {
    if (!user?.id) {
      return;
    }
  
    const fetchLikedStatus = async () => {
      try {
        const liked = await songService.checkIsLiked(songId);
        setIsLiked(liked);
      } catch (error) {
        console.error("Error fetching liked status:", error);
      }
    };

    fetchLikedStatus();
  }, [songId, user?.id]);

  const Icon = isLiked ? AiFillHeart : AiOutlineHeart;

  const handleLike = async () => {
    if (!user) {
      return authModal.onOpen();
    }

    try {
      const nowLiked = await songService.toggleLike(user.id, songId);
      setIsLiked(nowLiked);
      toast.success(nowLiked ? 'Song liked' : 'Song unliked');
      // Only refresh the page on success to update relevant lists
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    }
  };

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
};

export default LikeButton;