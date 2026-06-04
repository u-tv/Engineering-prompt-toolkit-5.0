let moviesData = [];
let currentFilter = "all";
let currentSearch = "";
let visibleCount = 12;
let allMovies = [];

async function loadMoviesData() {
  try {
    const res = await fetch("data/movies.json", { cache: "no-store" });
    moviesData = await res.json();
    allMovies = Array.isArray(moviesData) ? moviesData : [];
    renderMovies();
  } catch (e) {
    const grid = document.getElementById("moviesGrid");
    if (grid) grid.innerHTML = '<div class="no-results">Failed to load movies</div>';
  }
}

function renderMovies() {
  const grid = document.getElementById('moviesGrid');
  if (!grid) return;

  let filtered = allMovies.filter(m => {
    if (currentFilter !== "all" && !(m.genres || []).includes(currentFilter)) return false;
    if (currentSearch) {
      const t = (m.title || "").toLowerCase();
      const te = (m.title_en || "").toLowerCase();
      const q = currentSearch.toLowerCase();
      if (!t.includes(q) && !te.includes(q)) return false;
    }
    return true;
  });

  const toShow = filtered.slice(0, visibleCount);

  if (toShow.length === 0) {
    grid.innerHTML = '<div class="no-results">No movies found</div>';
  } else {
    grid.innerHTML = toShow.map(m => `
      <div class="movie-card" onclick="location.href='movie/${m.id}.html'">
        <img src="${m.poster}" alt="${m.title}" loading="lazy">
        <div class="movie-card-info">
          <h3>${m.title}</h3>
          <p>${m.title_en || ""}</p>
          <div class="movie-meta"><span>⭐ ${m.rating}</span><span>🎬 ${m.year}</span></div>
        </div>
      </div>
    `).join('');
  }

  const btn = document.getElementById('loadMoreBtn');
  if (btn) btn.style.display = visibleCount >= filtered.length ? 'none' : 'inline-flex';
}

function initSite() {
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.cat || "all";
      visibleCount = 12;
      renderMovies();
    });
  });

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value || "";
      visibleCount = 12;
      renderMovies();
    });
  }

  const loadBtn = document.getElementById('loadMoreBtn');
  if (loadBtn) {
    loadBtn.addEventListener('click', () => {
      visibleCount += 12;
      renderMovies();
    });
  }

  loadMoviesData();
}

document.addEventListener('DOMContentLoaded', initSite);
