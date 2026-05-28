(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function setupMenu() {
    const btn = $('#menuBtn');
    const panel = $('#mobilePanel');
    if (!btn || !panel) return;
    btn.addEventListener('click', () => panel.classList.toggle('is-open'));
    $$('.mobile-nav a, .chip-grid a', panel).forEach((link) => {
      link.addEventListener('click', () => panel.classList.remove('is-open'));
    });
  }

  function setupHero() {
    const hero = $('.hero-carousel');
    if (!hero) return;
    const slides = $$('.hero-slide', hero);
    const prev = $('.hero-prev', hero);
    const next = $('.hero-next', hero);
    const dotsWrap = $('.hero-dots', hero);
    if (!slides.length || !dotsWrap) return;

    let index = 0;
    const dots = slides.map((_, i) => {
      const b = document.createElement('button');
      b.className = 'hero-dot';
      b.type = 'button';
      b.setAttribute('aria-label', `切换到第 ${i + 1} 屏`);
      b.addEventListener('click', () => show(i));
      dotsWrap.appendChild(b);
      return b;
    });

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, n) => s.classList.toggle('is-active', n === index));
      dots.forEach((d, n) => d.classList.toggle('is-active', n === index));
    }

    if (prev) prev.addEventListener('click', () => show(index - 1));
    if (next) next.addEventListener('click', () => show(index + 1));
    show(0);
    setInterval(() => show(index + 1), 6500);
  }

  function setupSearch() {
    const shell = $('.filter-shell');
    if (!shell) return;
    const input = $('.filter-input', shell);
    const select = $('.filter-select', shell);
    const cards = $$('.filter-card', shell);
    const counter = $('.filter-count', shell);
    if (!input || !select || !cards.length || !counter) return;

    function apply() {
      const q = input.value.trim().toLowerCase();
      const category = select.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach((card) => {
        const title = (card.dataset.title || '').toLowerCase();
        const keywords = (card.dataset.keywords || '').toLowerCase();
        const cats = (card.dataset.category || '').toLowerCase();
        const okQ = !q || title.includes(q) || keywords.includes(q);
        const okC = !category || cats.includes(category);
        const show = okQ && okC;
        card.style.display = show ? '' : 'none';
        if (show) visible += 1;
      });
      counter.textContent = visible;
    }

    input.addEventListener('input', apply);
    select.addEventListener('change', apply);
    apply();
  }

  function setupPlayers() {
    const players = $$('.movie-player');
    if (!players.length) return;

    const ensureHls = () => {
      if (window.Hls) return Promise.resolve();
      return new Promise((resolve) => {
        const existing = document.querySelector('script[data-hls-lib]');
        if (existing) {
          existing.addEventListener('load', () => resolve(), { once: true });
          existing.addEventListener('error', () => resolve(), { once: true });
          return;
        }
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
        s.async = true;
        s.dataset.hlsLib = '1';
        s.addEventListener('load', () => resolve(), { once: true });
        s.addEventListener('error', () => resolve(), { once: true });
        document.head.appendChild(s);
      });
    };

    players.forEach((shell) => {
      const video = $('.player-video', shell);
      const overlay = $('.play-overlay', shell);
      const button = $('.play-btn', shell);
      const source = shell.dataset.m3u8;
      if (!video || !overlay || !button || !source) return;

      let started = false;
      let hls;

      const start = async () => {
        if (started) return;
        started = true;
        overlay.classList.add('hidden');
        try {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            await video.play();
            return;
          }
          await ensureHls();
          if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true,
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (_, data) {
              if (data && data.fatal) {
                try { hls.destroy(); } catch (e) {}
                overlay.classList.remove('hidden');
                started = false;
              }
            });
            video.addEventListener('loadedmetadata', () => video.play(), { once: true });
            return;
          }
          video.src = source;
          await video.play();
        } catch (err) {
          overlay.classList.remove('hidden');
          started = false;
        }
      };

      overlay.addEventListener('click', start);
      button.addEventListener('click', (e) => {
        e.preventDefault();
        start();
      });
      video.addEventListener('click', start);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupPlayers();
  });
})();
