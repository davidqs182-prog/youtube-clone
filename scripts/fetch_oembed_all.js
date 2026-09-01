const https = require('https');

const LINKS = [
  { idx: 1, url: "https://www.youtube.com/watch?v=VTjh1yRwAjg", id: "VTjh1yRwAjg" },
  { idx: 2, url: "https://www.youtube.com/watch?v=j4CmXKDCMzI", id: "j4CmXKDCMzI" },
  { idx: 3, url: "https://www.youtube.com/watch?v=Wh1zERcDWGM", id: "Wh1zERcDWGM" },
  { idx: 4, url: "https://www.youtube.com/watch?v=FJqbePx-ihc", id: "FJqbePx-ihc" },
  { idx: 5, url: "https://www.youtube.com/watch?v=IEE3ih", id: "IEE3ih" },
  { idx: 6, url: "https://www.youtube.com/watch?v=kK6nId6Mx1s", id: "kK6nId6Mx1s" },
  { idx: 7, url: "https://www.youtube.com/watch?v=uW7Ej4vv1Dk", id: "uW7Ej4vv1Dk" }
];

console.log("=== FETCHING OEMBED METADATA FOR 7 LINKS ===");

LINKS.forEach(item => {
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(item.url)}&format=json`;
  https.get(oembedUrl, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log(`\nLink #${item.idx} [${item.id}]:`);
        console.log(`   Title: ${json.title}`);
        console.log(`   Author: ${json.author_name}`);
        console.log(`   Thumbnail: ${json.thumbnail_url}`);
      } catch (e) {
        console.log(`\nLink #${item.idx} [${item.id}] ERROR: ${data}`);
      }
    });
  }).on('error', (err) => {
    console.error(`Link #${item.idx} ERROR: ${err.message}`);
  });
});
