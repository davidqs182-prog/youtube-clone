const { chromium } = require('playwright');
const fs = require('fs');

const LINKS = [
  { idx: 1, id: "VTjh1yRwAjg", url: "https://www.youtube.com/watch?v=VTjh1yRwAjg" },
  { idx: 2, id: "j4CmXKDCMzI", url: "https://www.youtube.com/watch?v=j4CmXKDCMzI" },
  { idx: 3, id: "Wh1zERcDWGM", url: "https://www.youtube.com/watch?v=Wh1zERcDWGM" },
  { idx: 4, id: "FJqbePx-ihc", url: "https://www.youtube.com/watch?v=FJqbePx-ihc" },
  { idx: 5, id: "IEE3ih", url: "https://www.youtube.com/watch?v=IEE3ih" },
  { idx: 6, id: "kK6nId6Mx1s", url: "https://www.youtube.com/watch?v=kK6nId6Mx1s" },
  { idx: 7, id: "uW7Ej4vv1Dk", url: "https://www.youtube.com/watch?v=uW7Ej4vv1Dk" }
];

(async () => {
  console.log("=== PLAYWRIGHT PROBING ALL 7 YOUTUBE LINKS ===");
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const item of LINKS) {
    console.log(`\n---------------------------------------------------`);
    console.log(`[${item.idx}/7] Navigating to: ${item.url}`);
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    let streamUrl = null;
    page.on('response', resp => {
      const rUrl = resp.url();
      if (rUrl.includes('googlevideo.com/videoplayback') && !streamUrl) {
        streamUrl = rUrl;
      }
    });

    try {
      await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(4000);

      // Try playing video to reveal duration and trigger streams
      await page.evaluate(() => {
        const v = document.querySelector('video');
        if (v) v.play().catch(() => {});
      });
      await page.waitForTimeout(3000);

      const title = await page.title();
      const metaInfo = await page.evaluate(() => {
        const v = document.querySelector('video');
        const channelElem = document.querySelector('#owner #channel-name, #upload-info #channel-name');
        return {
          duration: v ? v.duration : 0,
          channel: channelElem ? channelElem.innerText.trim() : ''
        };
      });

      console.log(`   Result Title: ${title}`);
      console.log(`   Result Duration: ${metaInfo.duration}s`);
      console.log(`   Result Channel: ${metaInfo.channel}`);
      console.log(`   Stream URL found: ${!!streamUrl}`);

      results.push({
        ...item,
        title,
        duration: metaInfo.duration,
        channel: metaInfo.channel,
        streamUrl,
        success: true
      });
    } catch (e) {
      console.error(`   ERROR probing ${item.url}: ${e.message.split('\n')[0]}`);
      results.push({
        ...item,
        success: false,
        error: e.message.split('\n')[0]
      });
    }

    await context.close();
  }

  await browser.close();
  fs.writeFileSync('playwright_probe_results.json', JSON.stringify(results, null, 2));
  console.log("\n=== ALL PROBES COMPLETED & SAVED TO playwright_probe_results.json ===");
})();
