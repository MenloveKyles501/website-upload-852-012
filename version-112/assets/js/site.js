(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    if (!toggle) {
      return;
    }
    toggle.addEventListener("click", function () {
      document.body.classList.toggle("is-menu-open");
    });
  }

  function setupSiteSearch() {
    document.querySelectorAll("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var q = input ? input.value.trim() : "";
        var prefix = form.getAttribute("data-search-prefix") || "./";
        if (q) {
          window.location.href = prefix + "search.html?q=" + encodeURIComponent(q);
        } else {
          window.location.href = prefix + "search.html";
        }
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    show(0);
    start();
  }

  function setupLocalFilter() {
    document.querySelectorAll("[data-local-filter]").forEach(function (panel) {
      var section = panel.closest(".catalog-section") || document;
      var input = panel.querySelector("[data-filter-input]");
      var year = panel.querySelector("[data-year-filter]");
      var clear = panel.querySelector("[data-filter-clear]");
      var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));

      function apply() {
        var q = normalize(input && input.value);
        var y = year ? year.value : "";
        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-type"),
            card.getAttribute("data-region"),
            card.getAttribute("data-tags")
          ].join(" "));
          var cardYear = Number(card.getAttribute("data-year")) || 0;
          var matchText = !q || text.indexOf(q) !== -1;
          var matchYear = !y || String(cardYear) === y || (y === "old" && cardYear <= 2020);
          card.classList.toggle("is-hidden", !(matchText && matchYear));
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (year) {
        year.addEventListener("change", apply);
      }
      if (clear) {
        clear.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          if (year) {
            year.value = "";
          }
          apply();
        });
      }
    });
  }

  function movieResult(movie) {
    var tags = (movie.tags || []).slice(0, 3).join(" · ");
    return [
      '<article class="movie-card">',
      '<a class="movie-cover" href="' + movie.url + '" aria-label="观看' + escapeHtml(movie.title) + '">',
      '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="movie-year">' + movie.year + '</span>',
      '<span class="movie-play"><span></span></span>',
      '</a>',
      '<div class="movie-info">',
      '<a class="movie-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>',
      '<p>' + escapeHtml(movie.oneLine || "") + '</p>',
      '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '<div class="movie-tags">' + escapeHtml(tags || movie.genre) + '</div>',
      '</div>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupSearchPage() {
    var form = document.querySelector("[data-search-page-form]");
    var results = document.querySelector("[data-search-results]");
    var summary = document.querySelector("[data-search-summary]");
    if (!form || !results || !window.MOVIE_INDEX) {
      return;
    }
    var input = form.querySelector("input[name='q']");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function render(q) {
      var query = normalize(q);
      var data = window.MOVIE_INDEX;
      var list = query ? data.filter(function (movie) {
        var text = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(" "),
          movie.oneLine
        ].join(" "));
        return text.indexOf(query) !== -1;
      }) : data.slice(0, 40);
      list = list.slice(0, 120);
      results.innerHTML = list.map(movieResult).join("");
      summary.textContent = query ? "搜索结果：" + list.length + " 部影片" : "热门影片推荐";
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var q = input.value.trim();
      var url = q ? "search.html?q=" + encodeURIComponent(q) : "search.html";
      window.history.replaceState(null, "", url);
      render(q);
    });

    input.addEventListener("input", function () {
      render(input.value);
    });

    render(initial);
  }

  window.initMoviePlayer = function (source) {
    var video = document.getElementById("video-player");
    var button = document.getElementById("play-toggle");
    if (!video || !source) {
      return;
    }
    var loaded = false;
    var waitingToPlay = false;

    function hideButton() {
      if (button) {
        button.classList.add("is-hidden");
      }
    }

    function showButton() {
      if (button) {
        button.classList.remove("is-hidden");
      }
    }

    function tryPlay() {
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {
          if (video.paused) {
            showButton();
          }
        });
      }
    }

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (waitingToPlay) {
            tryPlay();
          }
        });
      } else {
        video.src = source;
      }
    }

    function start() {
      waitingToPlay = true;
      hideButton();
      video.controls = true;
      load();
      tryPlay();
    }

    if (button) {
      button.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", hideButton);
  };

  ready(function () {
    setupMenu();
    setupSiteSearch();
    setupHero();
    setupLocalFilter();
    setupSearchPage();
  });
})();
