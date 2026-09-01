const { execSync } = require('child_process');
const path = require('path');
const YTDLP = path.join(__dirname, '..', 'yt-dlp.exe');

const LINKS = [
  "https://www.youtube.com/watch?v=VTjh1yRwAjg",
  "https://www.youtube.com/watch?v=j4CmXKDCMzI",
  "https://www.youtube.com/watch?v=Wh1zERcDWGM",
  "https://www.youtube.com/watch?v=FJqbePx-ihc",
  "https://www.youtube.com/watch?v=IEE3ih",
  "https://www.youtube.com/watch?v=kK6nId6Mx1s",
  "https://www.youtube.com/watch?v=uW7Ej4vv1Dk"
];

console.log("=== PROBING 7 NEW YOUTUBE LINKS METADATA ===");

LINKS.forEach((url, i) => {
  console.log(`\n[${i + 1}/7] Probing: ${url}`);
  try {
    const extraFlags = `--user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"`;
    const title = execSync(`"${YTDLP}" ${extraFlags} --print title "${url}"`, { encoding: 'utf-8' }).trim();
    const duration = execSync(`"${YTDLP}" ${extraFlags} --print duration "${url}"`, { encoding: 'utf-8' }).trim();
    const channel = execSync(`"${YTDLP}" ${extraFlags} --print uploader "${url}"`, { encoding: 'utf-8' }).trim();
    
    console.log(`   Title: ${title}`);
    console.log(`   Duration: ${duration} seconds (${Math.floor(duration/60)}:${(duration%60).toString().padStart(2,'0')})`);
    console.log(`   Channel: ${channel}`);
  } catch (e) {
    console.error(`   ERROR probing ${url}: ${e.message.split('\n')[0]}`);
  }
});
