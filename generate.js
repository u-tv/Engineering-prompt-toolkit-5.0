const fs = require('fs');
const SITE_URL = "https://u-tv.github.io/dailymoon.github.io";

// REAL Dailymotion video IDs (bina underscore)
const BASE_VIDEOS = [
  { id: "x9tr0em", title: "Fight Club", thumbnail: "https://img.youtube.com/vi/SUXWAEX2jlg/maxresdefault.jpg", desc: "An insomniac office worker forms an underground fight club." },
  { id: "x9u5obe", title: "Inception", thumbnail: "https://img.youtube.com/vi/YoHD9XEInc0/maxresdefault.jpg", desc: "Dream-sharing technology to plant an idea." },
  { id: "x9usy48", title: "The Dark Knight", thumbnail: "https://img.youtube.com/vi/EXeTwQWrcwY/maxresdefault.jpg", desc: "Batman vs Joker in Gotham." },
  { id: "x9usy9c", title: "Interstellar", thumbnail: "https://img.youtube.com/vi/zSWdZVtXT7E/maxresdefault.jpg", desc: "A team of explorers travel through a wormhole." },
  { id: "x9vs9pc", title: "The Matrix", thumbnail: "https://img.youtube.com/vi/vKQi3bBA1y8/maxresdefault.jpg", desc: "A computer hacker learns reality is a simulation." },
  { id: "x9y6afu", title: "Pulp Fiction", thumbnail: "https://img.youtube.com/vi/s7EdQ4FqbhY/maxresdefault.jpg", desc: "Interwoven stories of hitmen, a boxer, and criminals." },
  { id: "xa2tqou", title: "Forrest Gump", thumbnail: "https://img.youtube.com/vi/bLvqoHBptjg/maxresdefault.jpg", desc: "The life of an Alabama man with a low IQ." },
  { id: "xa2tqzc", title: "Gladiator", thumbnail: "https://img.youtube.com/vi/owK1qxDselE/maxresdefault.jpg", desc: "A betrayed Roman general seeks revenge." },
  { id: "xab8u8q", title: "The Shawshank Redemption", thumbnail: "https://img.youtube.com/vi/6hB3S9bIaco/maxresdefault.jpg", desc: "Two imprisoned men bond over several years." },
  { id: "xab8u9r", title: "The Godfather", thumbnail: "https://img.youtube.com/vi/UaVTIH8mujA/maxresdefault.jpg", desc: "The aging patriarch of an organized crime dynasty." }
];

// 1000 movies generate: har base ke liye 10 copies (0-99)
let allMovies = [];
for (let i = 0; i < 100; i++) {
  for (const base of BASE_VIDEOS) {
    allMovies.push({
      folderId: `${base.id}_${i}`,    // URL ke liye
      videoId: base.id,               // asli Dailymotion ID
      title: `${base.title} ${i+1}`,
      thumbnail: base.thumbnail,
      description: base.desc
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m]));
}

async function main() {
  console.log('🚀 Generating 1000 movie pages with REAL embeds...');
  if (!fs.existsSync('./movie')) fs.mkdirSync('./movie');

  for (const m of allMovies) {
    const dir = `./movie/${m.folderId}`;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(m.title)} | DAILYMOON</title>
  <meta name="description" content="${escapeHtml(m.description.substring(0,160))}">
  <link rel="canonical" href="${SITE_URL}/movie/${m.folderId}/">
  <meta property="og:title" content="${escapeHtml(m.title)}">
  <meta property="og:image" content="${m.thumbnail}">
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
  <iframe src="https://www.dailymotion.com/embed/video/${m.videoId}?autoplay=1" allowfullscreen></iframe>
  <h1>${escapeHtml(m.title)}</h1>
  <p>${escapeHtml(m.description)}</p>
  <a href="/" class="back-btn">← Back to Home</a>
</div>
</body>
</html>`;
    fs.writeFileSync(`${dir}/index.html`, html);
  }
  console.log(`✅ Generated ${allMovies.length} movie pages (real embeds)`);

  // movies.json for infinite scroll
  const moviesJson = allMovies.map(m => ({
    id: m.folderId,
    title: m.title,
    thumbnail: m.thumbnail
  }));
  fs.writeFileSync('movies.json', JSON.stringify(moviesJson));
  console.log('✅ movies.json updated');

  // Sitemap (all 1000)
  let sitemapUrls = `<url><loc>${SITE_URL}/</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod><priority>1.0</priority></url>`;
  for (const m of allMovies) {
    sitemapUrls += `<url><loc>${SITE_URL}/movie/${m.folderId}/</loc><priority>0.8</priority></url>`;
  }
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapUrls}</urlset>`;
  fs.writeFileSync('./sitemap.xml', sitemap);
  fs.writeFileSync('./robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml`);

  console.log('🎉 All fixed! Now every movie page plays the REAL video.');
}
main().catch(console.error);
