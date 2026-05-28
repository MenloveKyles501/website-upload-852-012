document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  initHeroSlider();
  initFilters();
  initPlayers();
});

function initHeroSlider() {
  var hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }

  var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
  var prev = hero.querySelector("[data-hero-prev]");
  var next = hero.querySelector("[data-hero-next]");
  var index = 0;
  var timer = null;

  function show(nextIndex) {
    if (!slides.length) {
      return;
    }

    index = (nextIndex + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === index);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  }

  function restart() {
    window.clearInterval(timer);
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  if (prev) {
    prev.addEventListener("click", function () {
      show(index - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      show(index + 1);
      restart();
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener("click", function () {
      show(dotIndex);
      restart();
    });
  });

  show(0);
  restart();
}

function initFilters() {
  var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
  var query = new URLSearchParams(window.location.search).get("q") || "";

  scopes.forEach(function (scope) {
    var input = scope.querySelector("[data-filter-input]");
    var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-select]"));
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
    var empty = scope.querySelector("[data-empty]");

    if (input && query) {
      input.value = query;
    }

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var filters = {};

      selects.forEach(function (select) {
        filters[select.getAttribute("data-filter-select")] = select.value;
      });

      var visible = 0;

      cards.forEach(function (card) {
        var text = card.getAttribute("data-search") || "";
        var region = card.getAttribute("data-region") || "";
        var type = card.getAttribute("data-type") || "";
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }

        if (filters.region && region !== filters.region) {
          matched = false;
        }

        if (filters.type && type !== filters.type) {
          matched = false;
        }

        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    selects.forEach(function (select) {
      select.addEventListener("change", apply);
    });

    apply();
  });
}

function initPlayers() {
  var videos = Array.prototype.slice.call(document.querySelectorAll("video[data-stream]"));

  videos.forEach(function (video) {
    attachStream(video);

    var overlay = document.querySelector('[data-play-overlay][data-target="#' + video.id + '"]');

    if (overlay) {
      overlay.addEventListener("click", function () {
        attachStream(video);
        video.play().catch(function () {});
        overlay.classList.add("is-hidden");
      });

      video.addEventListener("play", function () {
        overlay.classList.add("is-hidden");
      });

      video.addEventListener("pause", function () {
        if (video.currentTime === 0) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  });
}

function attachStream(video) {
  if (!video || video.getAttribute("data-ready") === "true") {
    return;
  }

  var stream = video.getAttribute("data-stream");
  if (!stream) {
    return;
  }

  if (window.Hls && window.Hls.isSupported()) {
    var hls = new window.Hls({
      capLevelToPlayerSize: true,
      enableWorker: true
    });
    hls.loadSource(stream);
    hls.attachMedia(video);
    video.setAttribute("data-ready", "true");
    return;
  }

  video.src = stream;
  video.setAttribute("data-ready", "true");
}
