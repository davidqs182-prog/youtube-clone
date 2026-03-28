import fs from "fs";
import path from "path";
import InfiniteFeed from "@/components/InfiniteFeed";

// Server Component: fetching local mock API data
export default async function Home() {
  const filePath = path.join(process.cwd(), "src/data/videos.json");
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(fileContent);

  return (
    <div className="w-full min-h-full bg-[var(--yt-bg)] text-[var(--yt-text)] pattern-bg">
      <InfiniteFeed feedVideos={data.feedVideos} suggestedVideos={data.suggestedVideos} />
    </div>
  );
}
