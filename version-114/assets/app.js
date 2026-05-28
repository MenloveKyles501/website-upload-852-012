(function () {
  var navButton = document.querySelector(".nav-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (navButton && mobilePanel) {
    navButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-search-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      var query = input ? input.value.trim() : "";
      if (query) {
        window.location.href = "./search.html?q=" + encodeURIComponent(query);
      } else {
        window.location.href = "./search.html";
      }
    });
  });

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (previous) {
      previous.addEventListener("click", function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        startTimer();
      });
    });

    if (slides.length) {
      showSlide(0);
      startTimer();
    }
  }

  var filterPanel = document.querySelector("[data-filter-panel]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
  var searchInput = document.querySelector("[data-page-search]");
  var resultCount = document.querySelector("[data-result-count]");
  var activeFilter = "all";

  function normalize(text) {
    return String(text || "").trim().toLowerCase();
  }

  function applyCardFilters() {
    var query = normalize(searchInput ? searchInput.value : "");
    var visible = 0;

    cards.forEach(function (card) {
      var matchesQuery = !query || normalize(card.getAttribute("data-search")).indexOf(query) !== -1;
      var matchesFilter = activeFilter === "all" || card.getAttribute("data-category") === activeFilter;
      var shouldShow = matchesQuery && matchesFilter;
      card.classList.toggle("is-hidden", !shouldShow);
      if (shouldShow) {
        visible += 1;
      }
    });

    if (resultCount) {
      resultCount.textContent = visible + " 部影片";
    }
  }

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    searchInput.value = initialQuery;
    searchInput.addEventListener("input", applyCardFilters);
  }

  if (filterPanel) {
    filterPanel.querySelectorAll("[data-filter]").forEach(function (button) {
      button.addEventListener("click", function () {
        activeFilter = button.getAttribute("data-filter") || "all";
        filterPanel.querySelectorAll("[data-filter]").forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        applyCardFilters();
      });
    });
  }

  if (cards.length) {
    applyCardFilters();
  }

  document.querySelectorAll(".player-shell").forEach(function (shell) {
    var video = shell.querySelector("video");
    var overlay = shell.querySelector(".play-overlay");
    var source = video ? video.querySelector("source") : null;
    var videoUrl = source ? source.getAttribute("src") : "";
    var hlsInstance = null;

    function startVideo() {
      if (!video || !videoUrl) {
        return;
      }

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (!video.getAttribute("src")) {
          video.setAttribute("src", videoUrl);
        }
      } else if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(videoUrl);
          hlsInstance.attachMedia(video);
        }
      } else if (!video.getAttribute("src")) {
        video.setAttribute("src", videoUrl);
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", startVideo);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          startVideo();
        }
      });
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
      video.addEventListener("pause", function () {
        if (overlay && video.currentTime === 0) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  });
})();
