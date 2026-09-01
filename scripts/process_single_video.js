const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FFMPEG = "C:\\Users\\d.quiros\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0-full_build\\bin\\ffmpeg.exe";
const YTDLP = path.join(__dirname, '..', 'yt-dlp.exe');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'videos', 'bachata_fuego');

const videoConfig = {
  index: 1,
  youtubeId: "85USoqN6WZ8",
  title: "ATACA & LA ALEMANA – Bachata Dance Performance – 40 MILLION VIEW PARTY",
  url: "https://www.youtube.com/watch?v=85USoqN6WZ8",
  highlights: [
    { startSec: 25, duration: 8, label: "Highlight 1 (0:25 - 0:33 - Onda Sensual de Inicio)" },
    { startSec: 100, duration: 8, label: "Highlight 2 (1:40 - 1:48 - Footwork & Giros)" },
    { startSec: 157, duration: 8, label: "Highlight 3 (2:37 - 2:45 - Caída Sensual Dip)" }
  ]
};

(async () => {
  console.log(`=== PROCESANDO VIDEO #${videoConfig.index}: ${videoConfig.title} ===`);
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Step A: Download source stream once
  const sourceWebm = path.join(process.cwd(), `source_${videoConfig.youtubeId}.webm`);
  if (!fs.existsSync(sourceWebm)) {
    console.log(`\nDescargando video fuente de YouTube (${videoConfig.youtubeId})...`);
    const downloadCmd = `"${YTDLP}" -f "bestvideo[height<=720]+bestaudio/best" "https://www.youtube.com/watch?v=${videoConfig.youtubeId}" -o "${sourceWebm}" --force-overwrites`;
    execSync(downloadCmd, { stdio: 'inherit' });
  }

  const hPaths = [];

  // Step B: Encode each highlight segment with FFmpeg from sourceWebm
  for (let hIdx = 0; hIdx < videoConfig.highlights.length; hIdx++) {
    const h = videoConfig.highlights[hIdx];
    const outName = `${videoConfig.youtubeId}_h${hIdx}.mp4`;
    const outPath = path.join(OUTPUT_DIR, outName);

    console.log(`\nCodificando ${h.label} -> ${outName}...`);

    // High quality H.264 MP4 with 30fps CFR, faststart, resampled audio, 3000k bitrate
    const ffmpegCmd = `"${FFMPEG}" -y -ss ${h.startSec} -i "${sourceWebm}" -t ${h.duration} -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30" -c:v libx264 -preset medium -b:v 3000k -maxrate 4000k -bufsize 6000k -pix_fmt yuv420p -c:a aac -b:a 128k -ar 48000 -movflags +faststart "${outPath}"`;
    execSync(ffmpegCmd, { stdio: 'inherit' });

    console.log(`   -> GENERADO: ${outName}`);
    hPaths.push(outPath);
  }

  // Step C: Concatenate into full trailer
  const fullTrailerName = `${videoConfig.youtubeId}_full.mp4`;
  const fullTrailerPath = path.join(OUTPUT_DIR, fullTrailerName);
  const concatFile = path.join(process.cwd(), `concat_${videoConfig.youtubeId}.txt`);

  let concatContent = "";
  hPaths.forEach(p => {
    concatContent += `file '${p.replace(/\\/g, '/')}'\n`;
  });
  fs.writeFileSync(concatFile, concatContent);

  console.log(`\nGenerando trailer continuo consolidado: ${fullTrailerName}...`);
  const concatCmd = `"${FFMPEG}" -y -f concat -safe 0 -i "${concatFile}" -c copy -movflags +faststart "${fullTrailerPath}"`;
  execSync(concatCmd, { stdio: 'inherit' });
  if (fs.existsSync(concatFile)) fs.unlinkSync(concatFile);

  // Clean sourceWebm
  if (fs.existsSync(sourceWebm)) fs.unlinkSync(sourceWebm);

  console.log(`\n=== VIDEO #${videoConfig.index} COMPLETADO CON ÉXITO ===`);
})();
