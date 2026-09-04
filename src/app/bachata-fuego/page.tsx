import videosData from "@/data/videos.json";
import InfiniteFeed from "@/components/InfiniteFeed";

// Server Component: using static imported video data for 100% Vercel Serverless compatibility
export default function BachataFuegoPage() {
  const feedVideos = (videosData as any).bachataVideos || (videosData as any).feedVideos;

  return (
    <div className="w-full min-h-full bg-[var(--yt-bg)] text-[var(--yt-text)] pattern-bg">
      <InfiniteFeed 
        feedVideos={feedVideos} 
        suggestedVideos={(videosData as any).bachataSuggestedVideos || (videosData as any).suggestedVideos} 
        title="Bachata Fuego 🔥"
        showBackButton={true}
      />
    </div>
  );
}
