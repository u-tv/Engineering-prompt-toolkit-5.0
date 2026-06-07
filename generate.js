const fs = require('fs');
const path = require('path');

// ==================== CONFIG ====================
const DAILYMOTION_API_KEY = process.env.DAILYMOTION_KEY || '656242f6bd70036a2064';
const SITE_URL = 'https://dailymoon.pages.dev';
const OUTPUT_DIR = './public';

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}

async function fetchDailymotionContent() {
  console.log('📡 Accessing Dailymotion Secure API...');
  
  // मूवी कंटेंट निकालने के लिए रिफाइंड सर्च क्वेरी और पैरामीटर्स
  const searchQueries = ['hindi full movie', 'bollywood superhit movie', 'new webseries clip'];
  let allVideos = [];

  for (const query of searchQueries) {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://api.dailymotion.com/videos?fields=id,title,description,thumbnail_720_url,views_total,duration&search=${encodedQuery}&tags=movie&limit=40`;
    
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Authorization': `Bearer ${DAILYMOTION_API_KEY}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.list) {
          // केवल वही वीडियो लें जो कम से कम 10 मिनट (600 सेकेंड) से ज्यादा बड़े हों, ताकि कचरा क्लिप्स न आएं
          const longVideos = data.list.filter(v => v.duration > 600);
          allVideos.push(...longVideos);
        }
      }
    } catch (e) {
      console.warn(`Query loop skipped for: ${query}`);
    }
  }

  // डुप्लिकेट वीडियो हटाएं
  const uniqueVideos = Array.from(new Map(allVideos.map(item => [item.id, item])).values());
  return uniqueVideos.slice(0, 100); // शीर्ष 100 वीडियो सिलेक्ट करें
}

function generateVideoPage(video) {
  const videoDir = path.join(OUTPUT_DIR, 'video', video.id);
  if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

  const title = escapeHtml(video.title);
  const desc = escapeHtml(video.description || 'Watch full movie online for free in high definition on DailyMoon.');
  const thumb = video.thumbnail_720_url || 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500';
  const durationMin = video.duration ? Math.floor(video.duration / 600) + ' hrs' : 'HD Movie';

  const html = `<!DOCTYPE html>
<html lang="hi-IN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Free HD Stream | DailyMoon</title>
  <meta name="description" content="Stream ${title} free online on DailyMoon. ${desc.slice(0, 140)}...">
  <link rel="canonical" href="${SITE_URL}/video/${video.id}/">
  <meta property="og:title" content="${title}">
  <meta property="og:image" content="${thumb}">
  <meta property="og:type" content="video.movie">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #06070d; color: #e2e8f0; font-family: system-ui, sans-serif; }
    .container { max-width: 1100px; margin: 0 auto; padding: 20px; }
    .player-section { background: #121420; border-radius: 24px; padding: 20px; margin-top: 20px; border: 1px solid #1e2238; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .video-container { position: relative; padding-bottom: 56.25%; height: 0; background: black; border-radius: 16px; overflow: hidden; }
    .video-container iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; }
    h1 { font-size: 1.8rem; margin: 25px 0 10px; color: #fff; line-height: 1.4; }
    .meta { color: #00d2ff; font-weight: bold; font-size: 0.95rem; margin-bottom: 20px; }
    .desc { line-height: 1.7; color: #cbd5e1; background: #121420; padding: 25px; border-radius: 16px; border: 1px solid #1e2238; }
    .ad-container { text-align: center; margin: 25px 0; padding: 15px; background: #121420; border-radius: 16px; }
    .smart-link { display: inline-block; background: #00d2ff; color: #06070d; padding: 12px 28px; border-radius: 40px; text-decoration: none; font-weight: bold; }
    footer { text-align: center; padding: 30px; margin-top: 50px; border-top: 1px solid #1e2238; font-size: 0.85rem; color: #94a3b8; }
  </style>
</head>
<body>
<div class="container">
  <p><a href="/" style="color:#00d2ff; text-decoration:none; font-weight:bold; font-size:1.05rem;">← Back to DailyMoon</a></p>
  
  <div class="player-section">
    <div class="video-container">
      <iframe src="https://www.dailymotion.com/embed/video/${video.id}?autoplay=0&queue-enable=false" allowfullscreen allow="autoplay"></iframe>
    </div>
  </div>

  <div class="ad-container">
    <script async data-cfasync="false" src="https://pl28831952.effectivegatecpm.com/e1fcb13904d27c4fe4e794fb5b4db78d/invoke.js"></script>
    <div id="container-e1fcb13904d27c4fe4e794fb5b4db78d"></div>
  </div>

  <h1>${title}</h1>
  <div class="meta">👁️ ${video.views_total || 'N/A'} Views | Length: ${durationMin} | Premium Player</div>
  
  <p class="desc"><strong>Overview:</strong><br><br>${desc}</p>

  <div class="ad-container">
    <a class="smart-link" href="https://www.effectivegatecpm.com/sa8mca36sv?key=3711015d24018cf89ccb362976c4a2e0" target="_blank">⚡ High-Speed Direct Download Link</a>
  </div>
</div>
<footer><p>© DailyMoon | All Streams Sourced via Secure Provider</p></footer>
<script src="https://pl28831952.effectivegatecpm.com/08/eb/75/08eb7538aa9646008f732c0721d2a5cc.js"></script>
</body>
</html>`;

  fs.writeFileSync(path.join(videoDir, 'index.html'), html);
}

function updateHomepage(videos) {
  const sourceIndex = path.join(process.cwd(), 'index.html');
  if (!fs.existsSync(sourceIndex)) return;
  let html = fs.readFileSync(sourceIndex, 'utf8');

  let cardsHtml = '';
  for (const v of videos) {
    const title = escapeHtml(v.title);
    const thumb = v.thumbnail_720_url || 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500';
    cardsHtml += `
      <div class="movie-card" onclick="location.href='/video/${v.id}/'">
        <div class="poster-wrapper">
          <img src="${thumb}" alt="${title}" loading="lazy">
        </div>
        <div class="movie-info">
          <div class="movie-title">${title}</div>
          <div class="movie-meta">👁️ ${v.views_total || '0'} views • Full HD</div>
        </div>
      </div>`;
  }

  html = html.replace('<div id="moviesGrid" class="movie-grid"></div>', `<div id="moviesGrid" class="movie-grid">${cardsHtml}</div>`);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), html);
}

function generateSitemap(videos) {
  let urls = `<url><loc>${SITE_URL}/</loc><priority>1.0</priority></url>`;
  for (const v of videos) urls += `<url><loc>${SITE_URL}/video/${v.id}/</loc><priority>0.8</priority></url>`;
  fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap.xml'), `<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
}

function copyRepoFiles(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    if (['.git', 'node_modules', 'public', '.github'].includes(name)) continue;
    const sPath = path.join(src, name), dPath = path.join(dest, name);
    if (fs.statSync(sPath).isDirectory()) copyRepoFiles(sPath, dPath);
    else fs.copyFileSync(sPath, dPath);
  }
}

(async () => {
  console.log('🚀 Launching DailyMoon Engine...');
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  copyRepoFiles(process.cwd(), OUTPUT_DIR);

  try {
    const videos = await fetchDailymotionContent();
    console.log(`🎬 Compiling ${videos.length} safe high-quality streams...`);
    for (const video of videos) {
      generateVideoPage(video);
    }
    updateHomepage(videos);
    generateSitemap(videos);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml`);
    console.log('🎉 Execution successful. Content Synced.');
  } catch (err) {
    console.error(`❌ Process Interrupt: ${err.message}`);
  }
})();
