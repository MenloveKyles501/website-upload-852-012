document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q") || "";
  const input = document.querySelector("#search-query");
  const box = document.querySelector("#search-results");

  if (input) {
    input.value = query;
  }

  if (!box) {
    return;
  }

  const normalize = value => String(value || "").toLowerCase();
  const words = normalize(query).split(/\s+/).filter(Boolean);

  const results = !words.length
    ? SEARCH_MOVIES.slice(0, 24)
    : SEARCH_MOVIES.filter(movie => {
        const haystack = normalize([
          movie.title,
          movie.year,
          movie.region,
          movie.genre,
          movie.category,
          movie.summary,
          movie.tags.join(" ")
        ].join(" "));
        return words.every(word => haystack.includes(word));
      }).slice(0, 120);

  if (!results.length) {
    box.innerHTML = '<div class="empty-state">没有匹配的影片</div>';
    return;
  }

  box.innerHTML = results.map(movie => `
    <article class="movie-card">
      <a class="poster-link" href="./${movie.url}">
        <img src="./${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
        <span class="play-badge">▶</span>
        <span class="score-badge">${movie.score}</span>
      </a>
      <div class="movie-card-body">
        <a class="movie-title" href="./${movie.url}">${escapeHtml(movie.title)}</a>
        <p>${escapeHtml(movie.summary)}</p>
        <div class="meta-row">
          <span>${escapeHtml(movie.year)}</span>
          <span>${escapeHtml(movie.region)}</span>
          <span>${escapeHtml(movie.genre)}</span>
        </div>
        <span class="chip">${escapeHtml(movie.category)}</span>
      </div>
    </article>
  `).join("");
});

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
