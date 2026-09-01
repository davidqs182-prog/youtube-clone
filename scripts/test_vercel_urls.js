const { chromium } = require('playwright');

(async () => {
  console.log("=== CHECKING VERCEL DEPLOYMENT URLS ===");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const urlsToTest = [
    "https://youtube-clone-sandy-two.vercel.app/bachata-fuego",
    "https://youtube-clone-git-live-davidqs182-progs-projects.vercel.app/bachata-fuego",
    "https://youtube-clone-git-master-davidqs182-progs-projects.vercel.app/bachata-fuego"
  ];

  for (const u of urlsToTest) {
    try {
      console.log(`Testing URL: ${u}`);
      const resp = await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 15000 });
      console.log(`   Status: ${resp ? resp.status() : 'No response'}`);
      if (resp && resp.status() === 200) {
        const title = await page.textContent('h1');
        console.log(`   SUCCESS! Title: "${title?.trim()}"`);
      }
    } catch(e) {
      console.log(`   Failed: ${e.message.split('\n')[0]}`);
    }
  }

  await browser.close();
})();
