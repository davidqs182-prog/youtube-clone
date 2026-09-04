const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const YTDLP = path.join(__dirname, '..', 'yt-dlp.exe');
const FFMPEG = "C:\\Users\\d.quiros\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0-full_build\\bin\\ffmpeg.exe";
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'videos', 'trailers');
const TEMP_DIR = path.join(__dirname, '..', 'temp_bachata');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

const VIDEOS = [
  { id: 'VZyyfX8WbT4', start: 1 },
  { id: 'Df9GrBwgyjQ', start: 74 },
  { id: 'zV1qLYukTH8', start: 59 },
  { id: 'hHR-e_t-yCE', start: 2 },
  { id: 'HO3cD53RHF4', start: 2 },
  { id: 'GK7q-LBC36g', start: 3 },
  { id: 'fEZdmgHNa10', start: 81 },
  { id: 'xrm7PP1mbtI', start: 3 },
  { id: 'vo_qsb635u0', start: 2 },
  { id: 'LM875jeR-PM', start: 65 }
];

console.log("=== GENERATING 10-SECOND GIFS & WEBMS FOR BACHATA RECOMMENDATIONS ===");

VIDEOS.forEach((item, index) => {
  const outputGif = path.join(OUTPUT_DIR, `${item.id}_sug_10s.gif`);
  const outputWebm = path.join(OUTPUT_DIR, `${item.id}_sug_10s.webm`);

  if (fs.existsSync(outputGif) && fs.statSync(outputGif).size > 50000 &&
      fs.existsSync(outputWebm) && fs.statSync(outputWebm).size > 20000) {
    console.log(`[${index + 1}/10] Skipping ${item.id} (files already generated)`);
    return;
  }

  console.log(`\n[${index + 1}/10] Processing ${item.id} (start=${item.start}s to ${item.start + 10}s)...`);
  const ytUrl = `https://www.youtube.com/watch?v=${item.id}`;
  const tempMp4 = path.join(TEMP_DIR, `${item.id}_clip.mp4`);

  const startSec = item.start;
  const endSec = item.start + 10;

  let downloaded = false;

  // Try multiple format strategies
  const formatStrategies = [
    `--js-runtimes node -f "b/18/best"`,
    `--js-runtimes node --extractor-args "youtube:player_client=ios,web" -f "best"`,
    `--js-runtimes node -f "bestvideo[height<=720]+bestaudio/best"`
  ];

  for (const fmt of formatStrategies) {
    try {
      console.log(`   Trying yt-dlp section download with: ${fmt}...`);
      execSync(`"${YTDLP}" ${fmt} --download-sections "*${startSec}-${endSec}" --force-keyframes-at-cuts "${ytUrl}" -o "${tempMp4}"`, { stdio: 'ignore' });
      if (fs.existsSync(tempMp4) && fs.statSync(tempMp4).size > 100000) {
        downloaded = true;
        break;
      }
    } catch (e) {
      // try next strategy
    }
  }

  if (!downloaded) {
    console.error(`   ❌ Failed all download strategies for ${item.id}`);
    return;
  }

  try {
    // 2. Generate crisp GIF (360p, 12fps)
    console.log(`   Encoding GIF (${item.id}_sug_10s.gif)...`);
    const palettePath = path.join(TEMP_DIR, `${item.id}_palette.png`);
    execSync(`"${FFMPEG}" -y -i "${tempMp4}" -vf "fps=12,scale=360:-1:flags=lanczos,palettegen" "${palettePath}"`, { stdio: 'ignore' });
    execSync(`"${FFMPEG}" -y -i "${tempMp4}" -i "${palettePath}" -filter_complex "fps=12,scale=360:-1:flags=lanczos[x];[x][1:v]paletteuse" "${outputGif}"`, { stdio: 'ignore' });

    // 3. Generate WebM (360p, lightweight VP9)
    console.log(`   Encoding WebM (${item.id}_sug_10s.webm)...`);
    execSync(`"${FFMPEG}" -y -i "${tempMp4}" -c:v libvpx-vp9 -b:v 500k -vf "scale=360:-1" -an "${outputWebm}"`, { stdio: 'ignore' });

    // Cleanup temp mp4 & palette
    if (fs.existsSync(tempMp4)) fs.unlinkSync(tempMp4);
    if (fs.existsSync(palettePath)) fs.unlinkSync(palettePath);

    console.log(`   ✓ Done: ${item.id}_sug_10s.gif & ${item.id}_sug_10s.webm`);
  } catch (err) {
    console.error(`   ❌ Failed encoding for ${item.id}:`, err.message);
  }
});

console.log("\n=== ALL 10 PREVIEWS PROCESSED! ===");
