const { chromium } = require('playwright');

(async () => {
  console.log("=== WAITING FOR VERCEL DEPLOYMENT TO COMPLETE ===");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const targetUrl = "https://youtube-clone-sandy-two.vercel.app/bachata-fuego";
  let success = false;

  for (let attempt = 1; attempt <= 6; attempt++) {
    console.log(`[Attempt ${attempt}/6] Loading ${targetUrl}...`);
    try {
      const resp = await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 25000 });
      if (resp && resp.status() === 200) {
        const titleText = await page.textContent('h1');
        console.log(`   HTTP Status: 200 OK. Title: "${titleText?.trim()}"`);
        if (titleText && titleText.includes("Bachata Fuego")) {
          success = true;
          break;
        }
      } else {
        console.log(`   HTTP Status: ${resp ? resp.status() : 'Error'}`);
      }
    } catch(e) {
      console.log(`   Waiting for Vercel build: ${e.message.split('\n')[0]}`);
    }
    await new Promise(r => setTimeout(r, 8000));
  }

  await browser.close();
  if (success) {
    console.log("=== VERCEL DEPLOYMENT IS 100% LIVE AND VERIFIED! ===");
  } else {
    console.log("=== VERCEL IS STILL BUILDING, PLEASE REFRESH IN 1 MINUTE ===");
  }
})();
