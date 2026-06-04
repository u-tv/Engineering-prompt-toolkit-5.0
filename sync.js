const fs = require('fs');
const https = require('https');
const SITE_URL = "https://u-tv.github.io/dailymoon.github.io";
const CLIENT_ID = process.env.DAILYMOTION_CLIENT_ID;
const CLIENT_SECRET = process.env.DAILYMOTION_CLIENT_SECRET;
const DM_USER = "dhamtan"; // Change to your Dailymotion username

if (!CLIENT_ID || !CLIENT_SECRET) { console.error("Missing secrets"); process.exit(1); }

function escapeHtml(str) { return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'})[m]); }

async function getToken() {
  return new Promise((resolve, reject) => {
    const data = `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
    const req = https.request({ hostname: 'api.dailymotion.com', path: '/oauth/token', method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': data.length } }, res => { let body = ''; res.on('data', c => body += c); res.on('end', () => resolve(JSON.parse(body).access_token)); });
    req.on('error', reject); req.write(data); req.end();
  });
}

async function getVideos(token, limit = 100) {
  return new Promise((resolve, reject) => {
    https.get({ hostname: 'api.dailymotion.com', path: `/user/${DM_USER}/videos?fields=id,title,thumbnail_240_url,description&limit=${limit}`, headers: { 'Authorization': `Bearer ${token}` } }, res => { let data = ''; res.on('data', c => data += c); res.on('end', () => resolve(JSON.parse(data).list || [])); }).on('error', reject);
  });
}

(async () => {
  try {
    const token = await getToken();
    let newVideos = await getVideos(token, 100);
    if (!newVideos.length) throw new Error("No videos from API");

    // Load existing movies if any
    let existingMovies = [];
    if (fs.existsSync('movies.json')) {
      existingMovies = JSON.parse(fs.readFileSync('movies.json', 'utf8'));
    }
    // Create a Set of existing video IDs
    const existingIds = new Set(existingMovies.map(m => m.id));

    // Filter only new videos (not already present)
    const videosToAdd = newVideos.filter(v => !existingIds.has(v.id));
    if (videosToAdd.length === 0) {
      console.log("No new videos to add. All already present.");
      return;
    }

    console.log(`Found ${videosToAdd.length} new videos. Adding...`);

    // Create movie folders for new videos
    if (!fs.existsSync('./movie')) fs.mkdirSync('./movie');
    const newMovies = [];
    for (const v of videosToAdd) {
      const dir = `./movie/${v.id}`;
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(v.title)} | DAILYMOON</title><meta name="description" content="${escapeHtml((v.description || '').substring(0,160))}"><style>body{background:#0a0a0a;color:#fff;font-family:system-ui;padding:20px}iframe{width:100%;aspect-ratio:16/9;border:none;border-radius:16px}h1{color:#0ff}</style></head><body><iframe src="https://www.dailymotion.com/embed/video/${v.id}?autoplay=1"></iframe><h1>${escapeHtml(v.title)}</h1><p>${escapeHtml(v.description || '')}</p><a href="/">← Home</a></body></html>`;
        fs.writeFileSync(`${dir}/index.html`, html);
        newMovies.push({ id: v.id, title: v.title, thumb: v.thumbnail_240_url, category: "Latest" });
      }
    }

    // Merge old + new
    const updatedMovies = [...existingMovies, ...newMovies];
    fs.writeFileSync('movies.json', JSON.stringify(updatedMovies, null, 2));
    console.log(`✅ movies.json updated. Total movies: ${updatedMovies.length}`);

    // Regenerate sitemap with all movies
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${SITE_URL}/</loc></url>`;
    updatedMovies.forEach(m => sitemap += `<url><loc>${SITE_URL}/movie/${m.id}/</loc></url>`);
    sitemap += `</urlset>`;
    fs.writeFileSync('sitemap.xml', sitemap);
    console.log("🎉 Auto-sync complete: added new videos without deleting old ones.");
  } catch(e) { console.error(e); process.exit(1); }
})();
