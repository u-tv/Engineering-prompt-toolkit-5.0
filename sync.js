const fs = require('fs');
const https = require('https');
const SITE_URL = "https://u-tv.github.io/dailymoon.github.io";
const CLIENT_ID = process.env.DAILYMOTION_CLIENT_ID;
const CLIENT_SECRET = process.env.DAILYMOTION_CLIENT_SECRET;
const DM_USER = "dhamtan";
if (!CLIENT_ID || !CLIENT_SECRET) { console.error("Missing secrets"); process.exit(1); }
function escapeHtml(str) { return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'})[m]); }
async function getToken() {
  return new Promise((resolve, reject) => {
    const data = `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
    const req = https.request({ hostname: 'api.dailymotion.com', path: '/oauth/token', method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': data.length } }, res => { let body = ''; res.on('data', c => body += c); res.on('end', () => { try { resolve(JSON.parse(body).access_token); } catch(e) { reject(e); } }); });
    req.on('error', reject); req.write(data); req.end();
  });
}
async function getVideos(token) {
  return new Promise((resolve, reject) => {
    https.get({ hostname: 'api.dailymotion.com', path: `/user/${DM_USER}/videos?fields=id,title,thumbnail_240_url,description&limit=100`, headers: { 'Authorization': `Bearer ${token}` } }, res => { let data = ''; res.on('data', c => data += c); res.on('end', () => { try { resolve(JSON.parse(data).list || []); } catch(e) { reject(e); } }); }).on('error', reject);
  });
}
(async () => {
  try {
    console.log("🔑 Getting Dailymotion token...");
    const token = await getToken();
    console.log("📹 Fetching videos from Dailymotion...");
    let videos = await getVideos(token);
    if (!videos || videos.length === 0) throw new Error("No videos found. Check username or API credentials.");
    console.log(`✅ Fetched ${videos.length} videos from Dailymotion`);
    let existing = [];
    if (fs.existsSync('movies.json')) {
      existing = JSON.parse(fs.readFileSync('movies.json', 'utf8'));
    }
    const existingIds = new Set(existing.map(m => m.id));
    const newVideos = videos.filter(v => !existingIds.has(v.id));
    console.log(`📊 Existing: ${existing.length}, New: ${newVideos.length}`);
    if (newVideos.length === 0) {
      console.log("No new videos to add. Exiting.");
      return;
    }
    if (!fs.existsSync('./movie')) fs.mkdirSync('./movie');
    const added = [];
    for (const v of newVideos) {
      const dir = `./movie/${v.id}`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(v.title)} | DAILYMOON</title>
  <meta name="description" content="${escapeHtml((v.description || '').substring(0,160))}">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#0a0a0a;color:#fff;font-family:system-ui;padding:20px}
    .container{max-width:1200px;margin:0 auto}
    .video-wrapper{position:relative;padding-bottom:56.25%;height:0;margin-bottom:20px}
    iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:none;border-radius:16px}
    h1{font-size:1.8rem;margin:20px 0 10px;color:#0ff}
    .meta{color:#aaa;margin-bottom:20px}
    .back-btn{display:inline-block;background:#0ff;color:#000;padding:8px 20px;border-radius:30px;text-decoration:none;margin:20px 0}
  </style>
</head>
<body>
<div class="container">
  <a href="/" class="back-btn">← Home</a>
  <div class="video-wrapper"><iframe src="https://www.dailymotion.com/embed/video/${v.id}?autoplay=1" allowfullscreen></iframe></div>
  <h1>${escapeHtml(v.title)}</h1>
  <div class="meta">Views: ${Math.floor(Math.random() * 1000000)} | Rating: ★★★★☆</div>
  <p>${escapeHtml(v.description || 'Watch this amazing video on DAILYMOON.')}</p>
</div>
</body>
</html>`;
        fs.writeFileSync(`${dir}/index.html`, html);
        added.push({ id: v.id, title: v.title, thumb: v.thumbnail_240_url, category: "Latest" });
        console.log(`  + Added: ${v.title}`);
      }
    }
    const allMovies = [...existing, ...added];
    fs.writeFileSync('movies.json', JSON.stringify(allMovies, null, 2));
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>${SITE_URL}/</loc><priority>1.0</priority></url>\n<url><loc>${SITE_URL}/trending.html</loc><priority>0.8</priority></url>\n<url><loc>${SITE_URL}/latest.html</loc><priority>0.8</priority></url>`;
    for (const m of allMovies) {
      sitemap += `\n<url><loc>${SITE_URL}/movie/${m.id}/</loc><priority>0.6</priority></url>`;
    }
    sitemap += `\n</urlset>`;
    fs.writeFileSync('sitemap.xml', sitemap);
    fs.writeFileSync('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml`);
    console.log(`🎉 SUCCESS! Added ${added.length} new movies. Total: ${allMovies.length}`);
  } catch(e) {
    console.error("❌ ERROR:", e.message);
    process.exit(1);
  }
})();
