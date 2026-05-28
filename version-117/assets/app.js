(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    restart();
  }

  function textOf(element, name) {
    return (element.getAttribute(name) || "").toLowerCase();
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }
    var search = panel.querySelector("[data-card-search]");
    var region = panel.querySelector("[data-filter-region]");
    var type = panel.querySelector("[data-filter-type]");
    var year = panel.querySelector("[data-filter-year]");
    var category = panel.querySelector("[data-filter-category]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (query && search) {
      search.value = query;
    }

    function apply() {
      var needle = search ? search.value.trim().toLowerCase() : "";
      var selectedRegion = region ? region.value : "";
      var selectedType = type ? type.value : "";
      var selectedYear = year ? year.value : "";
      var selectedCategory = category ? category.value : "";

      cards.forEach(function (card) {
        var haystack = [
          textOf(card, "data-title"),
          textOf(card, "data-region"),
          textOf(card, "data-type"),
          textOf(card, "data-year"),
          textOf(card, "data-tags"),
          textOf(card, "data-category")
        ].join(" ");
        var matched = true;

        if (needle && haystack.indexOf(needle) === -1) {
          matched = false;
        }
        if (selectedRegion && card.getAttribute("data-region") !== selectedRegion) {
          matched = false;
        }
        if (selectedType && card.getAttribute("data-type") !== selectedType) {
          matched = false;
        }
        if (selectedYear && card.getAttribute("data-year") !== selectedYear) {
          matched = false;
        }
        if (selectedCategory && card.getAttribute("data-category") !== selectedCategory) {
          matched = false;
        }

        card.classList.toggle("is-hidden", !matched);
      });
    }

    [search, region, type, year, category].forEach(function (field) {
      if (field) {
        field.addEventListener("input", apply);
        field.addEventListener("change", apply);
      }
    });

    apply();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video[data-stream]");
      var overlay = player.querySelector("[data-play-overlay]");
      var hls = null;
      var prepared = false;

      if (!video || !overlay) {
        return;
      }

      function prepare() {
        if (prepared) {
          return;
        }
        prepared = true;
        var stream = video.getAttribute("data-stream");
        if (!stream) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function play() {
        prepare();
        overlay.classList.add("is-hidden");
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            overlay.classList.remove("is-hidden");
          });
        }
      }

      overlay.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (!prepared) {
          play();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
