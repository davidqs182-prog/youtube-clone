"use client";

// Simple Suggested Video Card without auto-playing video previews
export default function SuggestedVideoCard({ video }: { video: any }) {
  return (
    <div 
      className="relative w-full aspect-video rounded-xl overflow-hidden cursor-pointer group shadow-md hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all border border-white/10 shrink-0"
    >
      <img 
        src={video.thumbnail} 
        alt={video.title} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
      />

      {/* Gradient for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-90 group-hover:opacity-100 transition-opacity z-10" />
      
      {/* Overlay Text (Title Only) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col justify-end z-20">
          <h4 className="text-white font-bold text-base line-clamp-2 drop-shadow-lg leading-snug">{video.title}</h4>
      </div>
      
      {/* Time Badge */}
      <div className="absolute top-3 right-3 bg-black/80 text-white font-medium text-[11px] px-2 py-1 rounded-md shadow-sm backdrop-blur-sm z-20">10:24</div>
    </div>
  );
}
