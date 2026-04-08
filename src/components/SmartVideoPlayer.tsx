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

  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scrubberContainerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const scrubberThumbRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);
  const durationRef = useRef(0);
  const isDraggingRef = useRef(false);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Play/Pause Control
  useEffect(() => {
    if (isActive) {
      hasEndedRef.current = false;
      if (video.youtubeId && ytPlayer) {
        ytPlayer.playVideo();
        setIsPlaying(true);
        globalMuted ? ytPlayer.mute() : ytPlayer.unMute();
      } else if (videoRef.current) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => setIsPlaying(true)).catch(() => {
            if (videoRef.current) {
              videoRef.current.muted = true;
              setGlobalMuted(true);
              videoRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error(e));
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
      setIsPlaying(false);
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
      if (!isActive) return;

      let currentTime = 0;
      let duration = 0;
      if (video.youtubeId && ytPlayer) {
        currentTime = ytPlayer.getCurrentTime() || 0;
        duration = ytPlayer.getDuration() || 0;
      } else if (videoRef.current) {
        currentTime = videoRef.current.currentTime;
        duration = videoRef.current.duration || 0;
      }

      durationRef.current = duration;

      // Update UI refs directly to avoid re-renders
      if (duration > 0 && !isDraggingRef.current) {
         const percentage = (currentTime / duration) * 100;
         if (progressBarRef.current) progressBarRef.current.style.transform = `scaleX(${percentage / 100})`;
         if (scrubberThumbRef.current) scrubberThumbRef.current.style.left = `${percentage}%`;
         if (timeTextRef.current) timeTextRef.current.innerText = `${formatTime(currentTime)} / ${formatTime(duration)}`;
      }

      if (isTrailerMode && video.highlights.length > 0) {
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
      }

      animationFrameId = requestAnimationFrame(checkTime);
    };

    animationFrameId = requestAnimationFrame(checkTime);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isActive, isTrailerMode, ytPlayer, currentHighlightIndex, video]);

  const exitTrailerMode = () => {
    if (!isTrailerMode) return;
    setIsTrailerMode(false);
    setCurrentCaption("");
  };

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (isTrailerMode) {
      exitTrailerMode();
      if (video.youtubeId && ytPlayer) {
        ytPlayer.seekTo(0, true);
        ytPlayer.playVideo();
      } else if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }
      setIsPlaying(true);
      return;
    }
    
    if (isPlaying) {
      if (video.youtubeId && ytPlayer) {
        ytPlayer.pauseVideo();
      } else if (videoRef.current) {
        videoRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      if (video.youtubeId && ytPlayer) {
         ytPlayer.playVideo();
      } else if (videoRef.current) {
         videoRef.current.play();
      }
      setIsPlaying(true);
    }
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const updateScrubberFromEvent = (e: React.PointerEvent | PointerEvent) => {
    if (!scrubberContainerRef.current) return;
    const rect = scrubberContainerRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = percent * durationRef.current;
    
    if (video.youtubeId && ytPlayer) {
      ytPlayer.seekTo(newTime, true);
    } else if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }

    if (progressBarRef.current) progressBarRef.current.style.transform = `scaleX(${percent})`;
    if (scrubberThumbRef.current) scrubberThumbRef.current.style.left = `${percent * 100}%`;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    exitTrailerMode();
    isDraggingRef.current = true;
    updateScrubberFromEvent(e);
    
    // Pause briefly while dragging
    if (video.youtubeId && ytPlayer) ytPlayer.pauseVideo();
    else if (videoRef.current) videoRef.current.pause();
  };

  // Setup global drag listeners
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      updateScrubberFromEvent(e);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        
        // Ensure play resumes after scrubbing
        if (!isPlaying) {
          togglePlay();
        } else {
          if (video.youtubeId && ytPlayer) ytPlayer.playVideo();
          else if (videoRef.current) videoRef.current.play();
        }
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isPlaying, video, ytPlayer]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && isActive) {
        e.preventDefault(); 
        togglePlay();
      }
    };
    
    if (isActive) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive, isPlaying, isTrailerMode, ytPlayer]);

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

  const onYtStateChange = (event: any) => {
    if (event.data === 1) setIsPlaying(true);
    if (event.data === 2) setIsPlaying(false);
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
      ref={containerRef}
      className="relative w-full rounded-[10px] overflow-hidden group aspect-video bg-black"
      onClick={togglePlay}
    >
      {video.youtubeId ? (
        <div className="absolute inset-0 pointer-events-none">
           <YouTube 
             videoId={video.youtubeId} 
             opts={ytOptions} 
             onReady={onYtReady} 
             onStateChange={onYtStateChange}
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
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={() => setVideoError(true)}
        />
      )}


      {/* Header Overlay (Mute only) */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-end items-start pointer-events-none z-40">
        <button 
          onClick={toggleMute}
          className="p-3 pointer-events-auto bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-md transition-all shadow-md"
        >
           {globalMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      {/* Controls Hover Overlay Container Add shadow gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none" />

      {/* Title and Description - Shifts up on hover to make room for controls */}
      <div className={`absolute left-0 right-16 px-6 pt-6 pb-0 flex flex-col justify-end pointer-events-none z-20 transition-all duration-200 bottom-[24px] group-hover:bottom-[100px] ${isTrailerMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <h2 className="text-white text-xl md:text-2xl font-bold leading-tight drop-shadow-lg line-clamp-2">
           {video.title}
        </h2>
        <p className="text-gray-300 text-sm mt-2 line-clamp-2 drop-shadow-md">
           {video.description}
        </p>
      </div>

      {/* YouTube Custom Controls - Reveal on Hover */}
      <div 
        className="absolute bottom-0 left-0 right-0 px-4 pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 flex flex-col gap-2 cursor-default pointer-events-none group-hover:pointer-events-auto"
        onClick={(e) => e.stopPropagation()} // Prevent playing video when clicking controls area
      >
        
        {/* Scrubber Area */}
        <div 
           ref={scrubberContainerRef}
           className="w-full h-[24px] flex items-center cursor-pointer group/scrubber relative"
           onPointerDown={handlePointerDown}
        >
            <div className="w-full relative flex items-center h-full">
               <div className="absolute w-full h-[4px] bg-white/40 rounded-full" />
               <div 
                 ref={progressBarRef} 
                 className="absolute h-[4px] bg-[#ff0000] rounded-l-full will-change-transform" 
                 style={{ width: "100%", transform: 'scaleX(0)', transformOrigin: '0 0' }}
               />
               <div 
                 ref={scrubberThumbRef}
                 className="absolute w-[14px] h-[14px] bg-[#ff0000] rounded-full shadow-sm will-change-left"
                 style={{ left: '0%', transform: "translateX(-50%)" }}
               />
            </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
           {/* Left Controls */}
           <div className="flex items-center gap-2">
             <div className="p-[4px] bg-black/50 backdrop-blur-md rounded-full text-white">
               <button onClick={togglePlay} className="p-[4px] hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                 {isPlaying && !isTrailerMode ? 
                   <svg height="36" version="1.1" viewBox="0 0 36 36" width="36" className="fill-current"><path d="M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z"></path></svg> : 
                   <svg height="36" version="1.1" viewBox="0 0 36 36" width="36" className="fill-current"><path d="M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z"></path></svg>
                 }
               </button>
             </div>
             <div className="p-[4px] bg-black/50 backdrop-blur-md rounded-full text-white">
               <button onClick={toggleMute} className="p-[4px] hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                 {globalMuted ? 
                   <svg height="36" version="1.1" viewBox="0 0 36 36" width="36" className="fill-current"><path d="m 21.48,17.98 c 0,-1.77 -1.02,-3.29 -2.5,-4.03 v 2.21 l 2.45,2.45 c .05,-0.2 .05,-0.4 .05,-0.63 z m 2.5,0 c 0,.94 -0.2,1.82 -0.54,2.64 l 1.51,1.51 c .66,-1.14 1.03,-2.46 1.03,-3.86 0,-4.28 -2.99,-7.86 -7,-8.76 v 2.05 c 2.89,.86 5,3.54 5,5.42 z M 9.25,8.98 l -1.27,1.26 4.72,4.73 H 7.98 v 6 h 4 l 5,5 v -6.73 l 4.25,4.25 c -0.67,.52 -1.42,.93 -2.25,1.18 v 2.06 c 1.38,-0.31 2.63,-0.95 3.69,-1.81 l 2.49,2.51 1.27,-1.27 -17.18,-17.18 z m 8.73,1.64 v 3.09 L 14.16,9.89 l 3.82,-3.52 z"></path></svg> : 
                   <svg height="36" version="1.1" viewBox="0 0 36 36" width="36" className="fill-current"><path d="M8,21 L12,21 L17,26 L17,10 L12,15 L8,15 L8,21 Z M19,14 L19,22 C20.48,21.53 21.5,20.08 21.5,18 C21.5,15.92 20.48,14.47 19,14 Z"></path></svg>
                 }
               </button>
             </div>
             <div className="px-4 py-[16px] bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white font-medium tracking-wide">
                <span ref={timeTextRef} style={{fontFamily: "Roboto, Arial, sans-serif", fontSize: "14px"}}>0:00 / 0:00</span>
             </div>
           </div>

           {/* Right Controls Pill */}
           <div className="flex items-center bg-black/50 backdrop-blur-md rounded-full p-[4px] gap-[16px] text-white mr-2">
             <div className="p-[4px] cursor-pointer hover:bg-white/20 rounded-full transition-colors flex items-center justify-center">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="6" width="18" height="12" rx="2" />
                  <path d="M10 10.5h-2a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h2" />
                  <path d="M17 10.5h-2a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h2" />
                </svg>
             </div>
             <div className="p-[4px] cursor-pointer hover:bg-white/20 rounded-full transition-colors flex items-center justify-center">
                <svg width="36" height="36" viewBox="-3 -3 30 30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
             </div>
             <div className="p-[4px] cursor-pointer hover:bg-white/20 rounded-full transition-colors flex items-center justify-center">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M 9 10 L 7 12 L 9 14"/>
                  <path d="M 15 10 L 17 12 L 15 14"/>
                  <path d="M 3 16 L 21 16"/>
                  <rect x="3" y="6" width="18" height="12" rx="2"/>
                </svg>
             </div>
             <div onClick={toggleFullscreen} className="p-[4px] cursor-pointer hover:bg-white/20 rounded-full transition-colors flex items-center justify-center">
               <svg width="36" height="36" viewBox="-2 -2 28 28" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                 <polyline points="9 5 5 5 5 9" />
                 <line x1="5" y1="5" x2="11" y2="11" />
                 <polyline points="15 19 19 19 19 15" />
                 <line x1="19" y1="19" x2="13" y2="13" />
               </svg>
             </div>
           </div>
        </div>
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
    </div>
  );
}
