const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FFMPEG = "C:\\Users\\d.quiros\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0-full_build\\bin\\ffmpeg.exe";
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'videos', 'bachata_fuego');
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const VALID_LINKS = [
  { idx: 1, id: "VTjh1yRwAjg", url: "https://www.youtube.com/watch?v=VTjh1yRwAjg", title: "Micka & Bachatera - Bachata Social" },
  { idx: 2, id: "j4CmXKDCMzI", url: "https://www.youtube.com/watch?v=j4CmXKDCMzI", title: "Gero & Migle - Para Besarte" },
  { idx: 3, id: "Wh1zERcDWGM", url: "https://www.youtube.com/watch?v=Wh1zERcDWGM", title: "Paolo & Alina - Homenaje a la Música Cubana" },
  { idx: 4, id: "FJqbePx-ihc", url: "https://www.youtube.com/watch?v=FJqbePx-ihc", title: "Micka & Bachatera - Bachata Social Demo" },
  { idx: 6, id: "kK6nId6Mx1s", url: "https://www.youtube.com/watch?v=kK6nId6Mx1s", title: "Cristian & Gabriela - Bachata Workshop" },
  { idx: 7, id: "uW7Ej4vv1Dk", url: "https://www.youtube.com/watch?v=uW7Ej4vv1Dk", title: "Ronald & Bachatera - Bachata Social" }
];

(async () => {
  console.log("=== PLAYWRIGHT STREAM CAPTURE & ENCODING (WITH -user_agent) ===");
  const browser = await chromium.launch({ headless: true });

  for (const item of VALID_LINKS) {
    console.log(`\n=======================================================`);
    console.log(`Processing [Video #${item.idx}]: ${item.title} (${item.id})`);
    console.log(`=======================================================`);

    const context = await browser.newContext({ userAgent: USER_AGENT });
    const page = await context.newPage();

    let streamUrl = null;
    page.on('response', resp => {
      const rUrl = resp.url();
      if (rUrl.includes('googlevideo.com/videoplayback') && !streamUrl) {
        streamUrl = rUrl;
      }
    });

    await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Click anywhere on player to start video playback
    try {
      await page.click('button.ytp-large-play-button, .ytp-play-button, #movie_player, video', { timeout: 4000 });
    } catch(e) {}

    await page.waitForTimeout(6000);

    // Fallback: extract currentSrc directly from video element
    if (!streamUrl) {
      streamUrl = await page.evaluate(() => {
        const v = document.querySelector('video');
        return v ? (v.currentSrc || v.src) : null;
      });
    }

    const videoDuration = await page.evaluate(() => {
      const v = document.querySelector('video');
      return v && !isNaN(v.duration) && v.duration > 0 ? v.duration : 120;
    });

    console.log(`   Captured Stream URL: ${!!streamUrl}`);
    console.log(`   Total Duration: ${videoDuration}s`);

    if (streamUrl && streamUrl.startsWith('http')) {
      // Calculate 3 non-continuous 8-second highlights strictly from the middle body
      const dur = videoDuration;
      const margin = Math.min(15, dur * 0.15);
      const activeRange = Math.max(30, dur - (margin * 2) - 24);
      const step = activeRange / 3;

      const h0Start = Math.floor(margin + 5);
      const h1Start = Math.floor(margin + step + 5);
      const h2Start = Math.floor(margin + (step * 2) + 5);

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
        const userAgentFlag = `-user_agent "${USER_AGENT}"`;
        const ffmpegCmd = `"${FFMPEG}" -y ${userAgentFlag} -ss ${h.startSec} -i "${streamUrl}" -t 8 -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30" -c:v libx264 -preset medium -b:v 3000k -maxrate 4000k -bufsize 6000k -pix_fmt yuv420p -c:a aac -b:a 128k -ar 48000 -movflags +faststart "${outPath}"`;
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
    } else {
      console.error(`   ERROR: Stream URL could not be captured for ${item.id}`);
    }

    await context.close();
  }

  await browser.close();
  console.log("\n=== ALL AVAILABLE VIDEOS PROCESSED & ENCODED ===");
})();
