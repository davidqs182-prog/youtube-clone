const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const YTDLP = path.join(__dirname, '..', 'yt-dlp.exe');
const FFMPEG = "C:\\Users\\d.quiros\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0-full_build\\bin\\ffmpeg.exe";
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'videos', 'trailers');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const VIDEOS = [
  { id: 'VZyyfX8WbT4', start: 1, url: 'http://www.youtube.com/watch?v=VZyyfX8WbT4&start=1' },
  { id: 'Df9GrBwgyjQ', start: 74, url: 'http://www.youtube.com/watch?v=Df9GrBwgyjQ&start=74' },
  { id: 'zV1qLYukTH8', start: 59, url: 'http://www.youtube.com/watch?v=zV1qLYukTH8&start=59' },
  { id: 'hHR-e_t-yCE', start: 2, url: 'http://www.youtube.com/watch?v=hHR-e_t-yCE&start=2' },
  { id: 'HO3cD53RHF4', start: 2, url: 'http://www.youtube.com/watch?v=HO3cD53RHF4&start=2' },
  { id: 'GK7q-LBC36g', start: 3, url: 'http://www.youtube.com/watch?v=GK7q-LBC36g&start=3' },
  { id: 'fEZdmgHNa10', start: 81, url: 'http://www.youtube.com/watch?v=fEZdmgHNa10&start=81' },
  { id: 'xrm7PP1mbtI', start: 3, url: 'http://www.youtube.com/watch?v=xrm7PP1mbtI&start=3' },
  { id: 'vo_qsb635u0', start: 2, url: 'http://www.youtube.com/watch?v=vo_qsb635u0&start=2' },
  { id: 'LM875jeR-PM', start: 65, url: 'http://www.youtube.com/watch?v=LM875jeR-PM&start=65' }
];

console.log("=== FETCHING METADATA FOR 10 BACHATA RECOMMENDATION VIDEOS ===");

const metadataList = [];

VIDEOS.forEach((item, index) => {
  console.log(`\n[${index + 1}/10] Processing ${item.id} (start: ${item.start}s)...`);
  const videoUrl = `https://www.youtube.com/watch?v=${item.id}`;
  const extraFlags = `--user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"`;
  
  try {
    const title = execSync(`"${YTDLP}" ${extraFlags} --print title "${videoUrl}"`, { encoding: 'utf-8' }).trim();
    const author = execSync(`"${YTDLP}" ${extraFlags} --print uploader "${videoUrl}"`, { encoding: 'utf-8' }).trim();
    let description = "";
    try {
      description = execSync(`"${YTDLP}" ${extraFlags} --print description "${videoUrl}"`, { encoding: 'utf-8' }).trim();
    } catch (e) {
      description = title;
    }
    
    // Create short description (first line or first 120 chars)
    const shortDesc = description.split('\n')[0].substring(0, 120).trim() || title;

    console.log(`   Title: ${title}`);
    console.log(`   Author: ${author}`);
    console.log(`   Short Desc: ${shortDesc}`);

    metadataList.push({
      id: `sug-bachata-rec-${index + 1}`,
      youtubeId: item.id,
      url: item.url,
      title: title,
      author: author,
      avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(author)}`,
      views: `${(Math.floor(Math.random() * 800) + 100) / 10}M views`,
      publishedAt: "Recommended",
      description: shortDesc,
      thumbnail: `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
      start: item.start,
      gifUrl: `/videos/trailers/${item.id}_sug_10s.gif`,
      webmUrl: `/videos/trailers/${item.id}_sug_10s.webm`
    });
  } catch (err) {
    console.error(`   Failed to fetch metadata for ${item.id}:`, err.message);
  }
});

fs.writeFileSync(path.join(__dirname, 'bachata_recommendations_meta.json'), JSON.stringify(metadataList, null, 2));
console.log("\n=== METADATA SAVED TO scripts/bachata_recommendations_meta.json ===");
