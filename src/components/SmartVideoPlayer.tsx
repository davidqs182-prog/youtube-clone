"use client";

import { useRef, useState, useEffect } from "react";
import { Volume2, VolumeX, ThumbsUp, ThumbsDown, MessageSquare, Share2, MoreHorizontal, Play } from "lucide-react";
import YouTube, { YouTubePlayer } from "react-youtube";

interface Highlight {
  start: number;
  end: number;
  caption: string;
}

interface VideoData {
  id: string;
  youtubeId?: string;
  url: string;
  title: string;
  author: string;
  avatar: string;
  views: string;
  publishedAt: string;
  likes?: string;
  comments?: string;
  description?: string;
  thumbnail?: string;
  highlights: Highlight[];
}

interface SmartVideoPlayerProps {
  video: VideoData;
  isActive: boolean;
  onTrailerEnd: () => void;
  globalMuted: boolean;
  setGlobalMuted: (val: boolean) => void;
}

export default function SmartVideoPlayer({ video, isActive, onTrailerEnd, globalMuted, setGlobalMuted }: SmartVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ytPlayer, setYtPlayer] = useState<YouTubePlayer>(null);
  const hasEndedRef = useRef(false);
  const [videoError, setVideoError] = useState(false);
  
  const [isTrailerMode, setIsTrailerMode] = useState(true);
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(0);
  const [currentCaption, setCurrentCaption] = useState("");

  // Play/Pause Control
  useEffect(() => {
    if (isActive) {
      hasEndedRef.current = false;
      if (video.youtubeId && ytPlayer) {
        ytPlayer.playVideo();
        globalMuted ? ytPlayer.mute() : ytPlayer.unMute();
      } else if (videoRef.current) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            if (videoRef.current) {
              videoRef.current.muted = true;
              setGlobalMuted(true);
              videoRef.current.play().catch(e => console.error(e));
            }
          });
        }
      }
    } else {
      if (video.youtubeId && ytPlayer) {
        ytPlayer.pauseVideo();
      } else if (videoRef.current) {
        videoRef.current.pause();
      }
      setIsTrailerMode(true);
      setCurrentHighlightIndex(0);
    }
  }, [isActive, ytPlayer, video.youtubeId, globalMuted, setGlobalMuted]);

  // Jump to first highlight when becoming active in trailer mode
  useEffect(() => {
    if (isActive && isTrailerMode && video.highlights.length > 0) {
      if (video.youtubeId && ytPlayer) {
         ytPlayer.seekTo(video.highlights[0].start, true);
      } else if (videoRef.current) {
         videoRef.current.currentTime = video.highlights[0].start;
      }
    }
  }, [isActive, isTrailerMode, video.highlights, video.youtubeId, ytPlayer]);

  // Unified RequestAnimationFrame loop for timing
  useEffect(() => {
    let animationFrameId: number;
    
    const checkTime = () => {
      if (!isActive || !isTrailerMode || video.highlights.length === 0) return;

      let currentTime = 0;
      if (video.youtubeId && ytPlayer) {
        currentTime = ytPlayer.getCurrentTime() || 0;
      } else if (videoRef.current) {
        currentTime = videoRef.current.currentTime;
      }

      const currentHighlight = video.highlights[currentHighlightIndex];

      if (currentTime >= currentHighlight.start && currentTime < currentHighlight.end) {
        setCurrentCaption(currentHighlight.caption);
      }

      if (currentTime >= currentHighlight.end) {
        if (currentHighlightIndex < video.highlights.length - 1) {
          const nextIndex = currentHighlightIndex + 1;
          setCurrentHighlightIndex(nextIndex);
          if (video.youtubeId && ytPlayer) {
             ytPlayer.seekTo(video.highlights[nextIndex].start, true);
          } else if (videoRef.current) {
             videoRef.current.currentTime = video.highlights[nextIndex].start;
          }
        } else {
          if (!hasEndedRef.current) {
            hasEndedRef.current = true;
            onTrailerEnd();
          }
        }
      }

      animationFrameId = requestAnimationFrame(checkTime);
    };

    animationFrameId = requestAnimationFrame(checkTime);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isActive, isTrailerMode, ytPlayer, currentHighlightIndex, video]);

  const enterFullVideoMode = () => {
    if (!isTrailerMode) return; 
    setIsTrailerMode(false);
    setCurrentCaption("");
    if (video.youtubeId && ytPlayer) {
      ytPlayer.seekTo(0, true);
      ytPlayer.playVideo();
    } else if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMuteState = !globalMuted;
    setGlobalMuted(newMuteState);
    if (video.youtubeId && ytPlayer) {
      newMuteState ? ytPlayer.mute() : ytPlayer.unMute();
    } else if (videoRef.current) {
      videoRef.current.muted = newMuteState;
    }
  };

  const onYtReady = (event: any) => {
    setYtPlayer(event.target);
    if (globalMuted) {
      event.target.mute();
    } else {
      event.target.unMute();
    }
  };

  const ytOptions = {
    width: "100%",
    height: "100%",
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      rel: 0,
      showinfo: 0,
      modestbranding: 1,
      playsinline: 1,
      origin: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
      loop: 1,
      playlist: video.youtubeId
    }
  };

  return (
    <div 
      className="relative w-full rounded-[10px] overflow-hidden group aspect-video bg-black"
      onClick={enterFullVideoMode}
    >
      {video.youtubeId ? (
        <div className="absolute inset-0 pointer-events-none">
           <YouTube 
             videoId={video.youtubeId} 
             opts={ytOptions} 
             onReady={onYtReady} 
             className="w-[100%] h-[100%] scale-[1.3] transition-opacity duration-300" 
           />
        </div>
      ) : videoError || !video.url ? (
        // Fallback: show thumbnail when video URL is missing or fails
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <video
          ref={videoRef}
          src={video.url}
          className="w-full h-full object-cover"
          muted={globalMuted}
          loop={!isTrailerMode}
          playsInline
          onError={() => setVideoError(true)}
        />
      )}


      {/* Header Overlay (Mute + Captions if in trailer mode) */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-none">
        <div className="flex-1">
          {isTrailerMode && isActive && currentCaption && (
            <div className="text-white text-xl md:text-3xl font-bold tracking-tight drop-shadow-md bg-black/40 w-fit px-5 py-2 rounded-full backdrop-blur-md">
              {currentCaption}
            </div>
          )}
        </div>
        <button 
          onClick={toggleMute}
          className="p-3 pointer-events-auto bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-md transition-all"
        >
           {globalMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      {/* Bottom Info Overlay (Title and Description only) */}
      <div className="absolute bottom-0 left-0 right-16 p-6 flex flex-col justify-end pointer-events-none z-10">
        <h2 className="text-white text-xl md:text-2xl font-bold leading-tight drop-shadow-lg line-clamp-2">
           {video.title}
        </h2>
        <p className="text-gray-300 text-sm mt-2 mb-2 line-clamp-2 drop-shadow-md">
           {video.description}
        </p>
      </div>

      {/* Right Side Interaction Bar (TikTok style) */}
      <div className="absolute top-1/2 -translate-y-1/2 right-3 md:right-5 flex flex-col items-center gap-5 z-20 pointer-events-auto">

         {/* Profile Badge (Subscribe Action) */}
         <div className="flex flex-col items-center gap-1 cursor-pointer hover:scale-105 transition-transform mb-2">
            <div className="relative">
               <img src={video.avatar} className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-sm" alt="Avatar"/>
               <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[var(--yt-brand)] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-md">
                  +
               </div>
            </div>
         </div>

         {/* Like */}
         <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
            <div className="w-12 h-12 bg-white/20 group-hover:bg-white/30 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors">
               <ThumbsUp size={24} fill="currentColor" className="opacity-100"/>
            </div>
            <span className="text-white text-[12px] font-semibold drop-shadow-md">{video.likes || "10K"}</span>
         </div>

         {/* Dislike */}
         <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
            <div className="w-12 h-12 bg-white/20 group-hover:bg-white/30 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors">
               <ThumbsDown size={24} fill="currentColor" className="opacity-100 mt-0.5"/>
            </div>
            <span className="text-white text-[12px] font-semibold drop-shadow-md">Dislike</span>
         </div>

         {/* Comment */}
         <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
            <div className="w-12 h-12 bg-white/20 group-hover:bg-white/30 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors">
               <MessageSquare size={24} fill="currentColor" className="opacity-100"/>
            </div>
            <span className="text-white text-[12px] font-semibold drop-shadow-md">{video.comments || "120"}</span>
         </div>

         {/* Share */}
         <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
            <div className="w-12 h-12 bg-white/20 group-hover:bg-white/30 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors">
               <Share2 size={24} fill="currentColor" className="opacity-100"/>
            </div>
            <span className="text-white text-[12px] font-semibold drop-shadow-md">Share</span>
         </div>

         {/* More */}
         <div className="flex flex-col items-center cursor-pointer group mt-1">
            <div className="w-12 h-12 bg-white/20 group-hover:bg-white/30 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors">
               <MoreHorizontal size={24} />
            </div>
         </div>
      </div>

      {/* Trailer Progress Indicator */}
      {isTrailerMode && isActive && (
         <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 pointer-events-none z-30">
            {video.highlights.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1 flex-1 rounded-full bg-white transition-opacity duration-300 shadow-sm ${idx <= currentHighlightIndex ? "opacity-100" : "opacity-30"}`}
              />
            ))}
         </div>
      )}

      {/* Red progress line for Full Video Mode */}
      {!isTrailerMode && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--yt-brand)] opacity-80 z-30" />
      )}
    </div>
  );
}
