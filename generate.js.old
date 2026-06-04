const fs = require('fs');
const https = require('https');

const DM_USER = "dhamtan";
const SITE_URL = "https://dailymoon.pages.dev";

async function fetchVideos() {
  return new Promise((resolve) => {
    https.get(`https://api.dailymotion.com/user/${DM_USER}/videos?fields=id,title,thumbnail_medium_url&limit=20`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.list || []);
        } catch(e) { resolve([]); }
      });
    }).on('error', () => resolve([]));
  });
}

async function main() {
  console.log('Fetching videos...');
  const videos = await fetchVideos();
  console.log(`Found ${videos.length} videos`);
  
  if (!fs.existsSync('./movie')) fs.mkdirSync('./movie');
  
  for (const v of videos) {
    const dir = `./movie/${v.id}`;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const html = `<!DOCTYPE html>
<html>
<head><title>${v.title}</title><meta charset="UTF-8"></head>
<body><h1>${v.title}</h1><iframe src="https://www.dailymotion.com/embed/video/${v.id}" width="100%" height="500" allowfullscreen></iframe><br><a href="/">Back to Home</a></body>
</html>`;
    fs.writeFileSync(`${dir}/index.html`, html);
  }
  
  let cards = '';
  for (const v of videos) {
    cards += `<div onclick="location.href='/movie/${v.id}/'" style="cursor:pointer;margin:10px;display:inline-block;width:200px"><img src="${v.thumbnail_medium_url}" style="width:100%;border-radius:10px"><p>${v.title}</p></div>`;
  }
  const homepage = `<!DOCTYPE html>
<html>
<head><title>DAILYMOON - Free Movies & Web Series</title><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{background:#0a0a0a;color:#fff;font-family:sans-serif;text-align:center}.grid{display:flex;flex-wrap:wrap;justify-content:center;gap:20px;padding:20px}div{background:#1a1a1a;border-radius:12px;padding:10px;transition:0.2s}div:hover{transform:scale(1.02)}img{border-radius:8px}</style></head>
<body><h1>🌙 DAILYMOON</h1><p>Auto-sync movies & web series from Dailymotion</p><div class="grid">${cards}</div><footer style="margin-top:40px;color:#666">© DAILYMOON - Daily fresh content</footer></body>
</html>`;
  fs.writeFileSync('./index.html', homepage);
  
  fs.writeFileSync('./sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>' + SITE_URL + '/</loc></url></urlset>');
  fs.writeFileSync('./robots.txt', 'User-agent: *\nAllow: /\nSitemap: ' + SITE_URL + '/sitemap.xml');
  
  console.log('✅ Done! Ready to deploy.');
}

main().catch(console.error);
