import fs from "fs";
import path from "path";
import InfiniteFeed from "@/components/InfiniteFeed";

// Server Component: fetching Bachata Fuego collection data
export default async function BachataFuegoPage() {
  const filePath = path.join(process.cwd(), "src/data/videos.json");
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(fileContent);

  const feedVideos = data.bachataVideos || data.feedVideos;

  return (
    <div className="w-full min-h-full bg-[var(--yt-bg)] text-[var(--yt-text)] pattern-bg">
      <InfiniteFeed 
        feedVideos={feedVideos} 
        suggestedVideos={data.suggestedVideos} 
        title="Bachata Fuego 🔥"
        showBackButton={true}
      />
    </div>
  );
}
