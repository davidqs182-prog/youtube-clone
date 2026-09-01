import videosData from "@/data/videos.json";
import InfiniteFeed from "@/components/InfiniteFeed";

// Server Component: using static imported video data for 100% Vercel Serverless compatibility
export default function Home() {
  return (
    <div className="w-full min-h-full bg-[var(--yt-bg)] text-[var(--yt-text)] pattern-bg">
      <InfiniteFeed 
        feedVideos={(videosData as any).feedVideos} 
        suggestedVideos={(videosData as any).suggestedVideos} 
      />
    </div>
  );
}
