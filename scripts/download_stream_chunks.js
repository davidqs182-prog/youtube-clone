const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FFMPEG = "C:\\Users\\d.quiros\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0-full_build\\bin\\ffmpeg.exe";
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'videos', 'bachata_fuego');

const REMAINING_LINKS = [
  { idx: 3, id: "Wh1zERcDWGM", url: "https://www.youtube.com/watch?v=Wh1zERcDWGM", title: "Paolo & Alina - Homenaje a la Música Cubana" },
  { idx: 4, id: "FJqbePx-ihc", url: "https://www.youtube.com/watch?v=FJqbePx-ihc", title: "Micka & Bachatera - Bachata Social Demo" },
  { idx: 6, id: "kK6nId6Mx1s", url: "https://www.youtube.com/watch?v=kK6nId6Mx1s", title: "Cristian & Gabriela - Bachata Workshop" },
  { idx: 7, id: "uW7Ej4vv1Dk", url: "https://www.youtube.com/watch?v=uW7Ej4vv1Dk", title: "Ronald & Bachatera - Bachata Social" }
];

(async () => {
  console.log("=== PLAYWRIGHT RESPONSE STREAMING & ENCODING ===");
  const browser = await chromium.launch({ headless: true });

  for (const item of REMAINING_LINKS) {
    console.log(`\n=======================================================`);
    console.log(`Processing [Video #${item.idx}]: ${item.title} (${item.id})`);
    console.log(`=======================================================`);

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    const sourceMp4 = path.join(process.cwd(), `source_${item.id}.mp4`);
    if (fs.existsSync(sourceMp4)) fs.unlinkSync(sourceMp4);

    const fileStream = fs.createWriteStream(sourceMp4, { flags: 'a' });
    let totalBytes = 0;

    page.on('response', async resp => {
      const rUrl = resp.url();
      if (rUrl.includes('googlevideo.com/videoplayback')) {
        try {
          const buffer = await resp.body();
          if (buffer && buffer.length > 0) {
            fileStream.write(buffer);
            totalBytes += buffer.length;
          }
        } catch(e) {}
      }
    });

    await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    try {
      await page.click('button.ytp-large-play-button, .ytp-play-button, #movie_player, video', { timeout: 4000 });
    } catch(e) {}

    // Let video stream play for 12 seconds to capture media chunks
    await page.waitForTimeout(12000);

    fileStream.end();
    console.log(`   Captured Source Video Stream: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);

    const videoDuration = await page.evaluate(() => {
      const v = document.querySelector('video');
      return v && !isNaN(v.duration) && v.duration > 0 ? v.duration : 120;
    });

    if (fs.existsSync(sourceMp4) && fs.statSync(sourceMp4).size > 500000) {
      const dur = videoDuration;
      const margin = Math.min(15, dur * 0.15);
      const activeRange = Math.max(30, dur - (margin * 2) - 24);
      const step = activeRange / 3;

      const h0Start = Math.floor(margin + 2);
      const h1Start = Math.floor(margin + step + 2);
      const h2Start = Math.floor(margin + (step * 2) + 2);

      const highlights = [
        { startSec: h0Start, label: `Highlight 1 (${h0Start}s - ${h0Start + 8}s)` },
        { startSec: h1Start, label: `Highlight 2 (${h1Start}s - ${h1Start + 8}s)` },
        { startSec: h2Start, label: `Highlight 3 (${h2Start}s - ${h2Start + 8}s)` }
      ];

      const hPaths = [];
      for (let hIdx = 0; hIdx < highlights.length; hIdx++) {
        const h = highlights[hIdx];
        const outName = `${item.id}_h${hIdx}.mp4`;
        const outPath = path.join(OUTPUT_DIR, outName);

        console.log(`   Cut ${h.label} -> ${outName}...`);
        const ffmpegCmd = `"${FFMPEG}" -y -i "${sourceMp4}" -ss ${h.startSec} -t 8 -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30" -c:v libx264 -preset medium -b:v 3000k -maxrate 4000k -bufsize 6000k -pix_fmt yuv420p -c:a aac -b:a 128k -ar 48000 -movflags +faststart "${outPath}"`;
        try {
          execSync(ffmpegCmd, { stdio: 'inherit' });
          console.log(`      -> GENERADO CON ÉXITO: ${outName}`);
          hPaths.push(outPath);
        } catch(e) {
          console.error(`      ERROR encoding highlight ${hIdx}:`, e.message.split('\n')[0]);
        }
      }

      if (hPaths.length === 3) {
        const fullTrailerName = `${item.id}_full.mp4`;
        const fullTrailerPath = path.join(OUTPUT_DIR, fullTrailerName);
        const concatFile = path.join(process.cwd(), `concat_${item.id}.txt`);
        let concatContent = "";
        hPaths.forEach(p => concatContent += `file '${p.replace(/\\/g, '/')}'\n`);
        fs.writeFileSync(concatFile, concatContent);

        console.log(`   Generando trailer continuo: ${fullTrailerName}...`);
        const concatCmd = `"${FFMPEG}" -y -f concat -safe 0 -i "${concatFile}" -c copy -movflags +faststart "${fullTrailerPath}"`;
        execSync(concatCmd, { stdio: 'inherit' });
        if (fs.existsSync(concatFile)) fs.unlinkSync(concatFile);
        console.log(`   SUCCESS: ${fullTrailerName} GENERADO CON ÉXITO.`);
      }

      if (fs.existsSync(sourceMp4)) fs.unlinkSync(sourceMp4);
    } else {
      console.error(`   ERROR: Source video file missing or incomplete for ${item.id}`);
    }

    await context.close();
  }

  await browser.close();
  console.log("\n=== ALL REMAINING VIDEOS PROCESSED & ENCODED ===");
})();
