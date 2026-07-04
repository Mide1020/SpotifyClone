"use client";

import useSound from "use-sound";
import { useEffect, useState, useRef, useCallback } from "react";
import { BsPauseFill, BsPlayFill } from "react-icons/bs";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import { AiFillStepBackward, AiFillStepForward } from "react-icons/ai";

import { Song } from "@/type";
import usePlayer from "@/hooks/usePlayer";

import LikeButton from "./LikeButton";
import MediaItem from "./MediaItem";
import Slider from "./Slider";


interface PlayerContentProps {
  song: Song;
  songUrl: string;
}

/** Formats a time in seconds to m:ss string */
const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const PlayerContent: React.FC<PlayerContentProps> = ({ song, songUrl }) => {
  const player = usePlayer();
  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const seekIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const Icon = isPlaying ? BsPauseFill : BsPlayFill;
  const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;

  const onPlayNext = useCallback(() => {
    const { ids, activeId } = player;
    if (ids.length === 0) return;
    const currentIndex = ids.indexOf(activeId!);
    const nextIndex = (currentIndex + 1) % ids.length;
    player.setId(ids[nextIndex]);
  }, [player]);

  const onPlayPrevious = useCallback(() => {
    const { ids, activeId } = player;
    if (ids.length === 0) return;
    const currentIndex = ids.indexOf(activeId!);
    const previousIndex = (currentIndex - 1 + ids.length) % ids.length;
    player.setId(ids[previousIndex]);
  }, [player]);

  const [play, { pause, sound }] = useSound(
    songUrl,
    { 
      volume,
      onplay: () => setIsPlaying(true),
      onend: () => {
        setIsPlaying(false);
        onPlayNext();
      },
      onpause: () => setIsPlaying(false),
      format: ['mp3']
    }
  );

  // Auto-play on mount and clean up on unmount
  useEffect(() => {
    sound?.play();
    return () => {
      sound?.unload();
    };
  }, [sound]);

  // Capture song duration once sound is loaded
  useEffect(() => {
    if (sound) {
      const d = sound.duration();
      if (d) setDuration(d);
    }
  }, [sound]);

  // Poll current playback position every 500ms to drive the seek bar
  useEffect(() => {
    if (!sound) return;

    seekIntervalRef.current = setInterval(() => {
      if (!isSeeking && sound.playing()) {
        setCurrentTime(sound.seek() as number);
        // Also capture duration in case it wasn't ready at load time
        const d = sound.duration();
        if (d) setDuration(d);
      }
    }, 500);

    return () => {
      if (seekIntervalRef.current) clearInterval(seekIntervalRef.current);
    };
  }, [sound, isSeeking]);

  const handlePlay = () => {
    if (!isPlaying) {
      play();
    } else {
      pause();
    }
  };

  const toggleMute = () => {
    setVolume((v) => (v === 0 ? 1 : 0));
  };

  /** Called as the user drags the seek slider */
  const handleSeekChange = (value: number) => {
    setIsSeeking(true);
    setCurrentTime(value);
  };

  /** Called when the user releases the seek slider — actually seek the audio */
  const handleSeekCommit = (value: number) => {
    if (sound) {
      sound.seek(value);
      setCurrentTime(value);
    }
    setIsSeeking(false);
  };

  const seekProgress = duration > 0 ? currentTime / duration : 0;

  return ( 
    <div className="flex flex-col h-full">
      {/* Main player row */}
      <div className="grid grid-cols-2 md:grid-cols-3 h-full">
        {/* Left: song info + like */}
        <div className="flex w-full justify-start">
          <div className="flex items-center gap-x-4">
            <MediaItem data={song} />
            <LikeButton songId={song.id} />
          </div>
        </div>

        {/* Mobile: play button only */}
        <div 
          className="
            flex 
            md:hidden 
            col-auto 
            w-full 
            justify-end 
            items-center
          "
        >
          <div 
            onClick={handlePlay} 
            className="
              h-10
              w-10
              flex 
              items-center 
              justify-center 
              rounded-full 
              bg-white 
              p-1 
              cursor-pointer
            "
          >
            <Icon size={30} className="text-black" />
          </div>
        </div>

        {/* Desktop: prev / play / next */}
        <div 
          className="
            hidden
            h-full
            md:flex 
            justify-center 
            items-center 
            w-full 
            max-w-[722px] 
            gap-x-6
          "
        >
          <AiFillStepBackward
            onClick={onPlayPrevious}
            size={30} 
            className="
              text-neutral-400 
              cursor-pointer 
              hover:text-white 
              transition
            "
          />
          <div 
            onClick={handlePlay} 
            className="
              flex 
              items-center 
              justify-center
              h-10
              w-10 
              rounded-full 
              bg-white 
              p-1 
              cursor-pointer
            "
          >
            <Icon size={30} className="text-black" />
          </div>
          <AiFillStepForward
            onClick={onPlayNext}
            size={30} 
            className="
              text-neutral-400 
              cursor-pointer 
              hover:text-white 
              transition
            " 
          />
        </div>

        {/* Desktop: volume */}
        <div className="hidden md:flex w-full justify-end pr-2">
          <div className="flex items-center gap-x-2 w-[120px]">
            <VolumeIcon 
              onClick={toggleMute} 
              className="cursor-pointer" 
              size={34} 
            />
            <Slider 
              value={volume} 
              onChange={(value) => setVolume(value)}
            />
          </div>
        </div>
      </div>

      {/* Seek / Progress bar — shown below the main controls */}
      <div className="hidden md:flex items-center gap-x-2 px-4 pb-2 w-full">
        <span className="text-neutral-400 text-xs w-10 text-right shrink-0">
          {formatTime(currentTime)}
        </span>
        <div className="flex-1 relative h-1 group">
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={currentTime}
            onChange={(e) => handleSeekChange(parseFloat(e.target.value))}
            onMouseUp={(e) => handleSeekCommit(parseFloat((e.target as HTMLInputElement).value))}
            onTouchEnd={(e) => handleSeekCommit(parseFloat((e.target as HTMLInputElement).value))}
            className="
              w-full h-1 rounded-full appearance-none cursor-pointer
              bg-neutral-600
              accent-white
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:opacity-0
              group-hover:[&::-webkit-slider-thumb]:opacity-100
            "
            style={{
              background: `linear-gradient(to right, white ${seekProgress * 100}%, rgb(82 82 82) ${seekProgress * 100}%)`
            }}
          />
        </div>
        <span className="text-neutral-400 text-xs w-10 shrink-0">
          {formatTime(duration)}
        </span>
      </div>
    </div>
   );
};
 
export default PlayerContent;