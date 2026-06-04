const fs = require('fs');
const SITE_URL = "https://u-tv.github.io/dailymoon.github.io";   // ✅ ये तुम्हारा असली URL है

const PREMIUM_VIDEOS = [
  { id: "x9tr0em", title: "Fight Club", thumbnail: "https://img.youtube.com/vi/SUXWAEX2jlg/maxresdefault.jpg", description: "An insomniac office worker forms an underground fight club." },
  { id: "x9u5obe", title: "Inception", thumbnail: "https://img.youtube.com/vi/YoHD9XEInc0/maxresdefault.jpg", description: "Dream-sharing technology to plant an idea." },
  { id: "x9usy48", title: "The Dark Knight", thumbnail: "https://img.youtube.com/vi/EXeTwQWrcwY/maxresdefault.jpg", description: "Batman vs Joker in Gotham." },
  { id: "x9usy9c", title: "Interstellar", thumbnail: "https://img.youtube.com/vi/zSWdZVtXT7E/maxresdefault.jpg", description: "A team of explorers travel through a wormhole." },
  { id: "x9vs9pc", title: "The Matrix", thumbnail: "https://img.youtube.com/vi/vKQi3bBA1y8/maxresdefault.jpg", description: "A computer hacker learns reality is a simulation." },
  { id: "x9y6afu", title: "Pulp Fiction", thumbnail: "https://img.youtube.com/vi/s7EdQ4FqbhY/maxresdefault.jpg", description: "Interwoven stories of hitmen, a boxer, and criminals." },
  { id: "xa2tqou", title: "Forrest Gump", thumbnail: "https://img.youtube.com/vi/bLvqoHBptjg/maxresdefault.jpg", description: "The life of an Alabama man with a low IQ." },
  { id: "xa2tqzc", title: "Gladiator", thumbnail: "https://img.youtube.com/vi/owK1qxDselE/maxresdefault.jpg", description: "A betrayed Roman general seeks revenge." },
  { id: "xab8u8q", title: "The Shawshank Redemption", thumbnail: "https://img.youtube.com/vi/6hB3S9bIaco/maxresdefault.jpg", description: "Two imprisoned men bond over several years." },
  { id: "xab8u9r", title: "The Godfather", thumbnail: "https://img.youtube.com/vi/UaVTIH8mujA/maxresdefault.jpg", description: "The aging patriarch of an organized crime dynasty." }
];

// Flat list बनाओ – original array को mutate mat karo
let allVideos = [];
for (let i = 0; i < 100; i++) {
  for (const v of PREMIUM_VIDEOS) {
    allVideos.push({
      id: `${v.id}_${i}`,
      title: `${v.title} ${i+1}`,
      thumbnail: v.thumbnail,
      description: v.description
    });
  }
}
const videos = allVideos; // 1000 movies

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m]));
}

async function main() {
  console.log('🚀 Generating 1000 flat movie pages...');
  if (!fs.existsSync('./movie')) fs.mkdirSync('./movie');

  for (const v of videos) {
    const dir = `./movie/${v.id}`;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(v.title)} | DAILYMOON</title>
  <meta name="description" content="${escapeHtml(v.description.substring(0,160))}">
  <link rel="canonical" href="${SITE_URL}/movie/${v.id}/">
  <meta property="og:title" content="${escapeHtml(v.title)}">
  <meta property="og:image" content="${v.thumbnail}">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#0a0a0a;color:#e5e5e5;font-family:system-ui;padding:20px}
    .container{max-width:1200px;margin:0 auto}
    iframe{width:100%;aspect-ratio:16/9;border:none;border-radius:16px}
    h1{font-size:1.8rem;margin:20px 0;color:#0ff}
    .back-btn{display:inline-block;background:#0ff;color:#000;padding:10px 24px;border-radius:30px;text-decoration:none;margin-top:20px}
  </style>
</head>
<body>
<div class="container">
  <iframe src="https://www.dailymotion.com/embed/video/${v.id}?autoplay=1" allowfullscreen></iframe>
  <h1>${escapeHtml(v.title)}</h1>
  <p>${escapeHtml(v.description)}</p>
  <a href="/" class="back-btn">← Back to Home</a>
</div>
</body>
</html>`;
    fs.writeFileSync(`${dir}/index.html`, html);
  }
  console.log(`✅ Generated ${videos.length} movie pages (flat folders)`);

  // Homepage – सारी 1000 movies दिखाएगा
  let cards = '';
  for (const v of videos) {
    cards += `<div class="card" onclick="location.href='/movie/${v.id}/'"><img src="${v.thumbnail}" loading="lazy"><div class="title">${escapeHtml(v.title)}</div></div>`;
  }

  const homepage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DAILYMOON - 1000+ Movies & Web Series</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#0a0a0a;color:#e5e5e5;font-family:system-ui;padding:20px}
    h1{text-align:center;margin:20px 0;color:#0ff;font-size:2.5rem}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:20px;max-width:1400px;margin:0 auto}
    .card{background:#1a1a1a;border-radius:16px;overflow:hidden;cursor:pointer;transition:0.2s}
    .card:hover{transform:scale(1.02);border:1px solid #0ff}
    .card img{width:100%;aspect-ratio:16/9;object-fit:cover}
    .title{padding:10px;font-size:0.8rem;text-align:center}
    footer{text-align:center;margin-top:40px;padding:20px;color:#666}
  </style>
</head>
<body>
<h1>🌙 DAILYMOON</h1>
<p style="text-align:center;margin-bottom:20px">1000+ movies & web series • Auto-sync daily</p>
<div class="grid">${cards}</div>
<footer>© DAILYMOON - Daily fresh content</footer>
</body>
</html>`;
  fs.writeFileSync('./index.html', homepage);

  // Sitemap – सभी 1000 URLs
  let sitemapUrls = `<url><loc>${SITE_URL}/</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod><priority>1.0</priority></url>`;
  for (const v of videos) {
    sitemapUrls += `<url><loc>${SITE_URL}/movie/${v.id}/</loc><priority>0.8</priority></url>`;
  }
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapUrls}</urlset>`;
  fs.writeFileSync('./sitemap.xml', sitemap);
  fs.writeFileSync('./robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml`);

  console.log('🎉 Done! 1000 flat folders, full sitemap, all movies on homepage.');
}
main().catch(console.error);
