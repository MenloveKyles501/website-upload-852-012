(function () {
  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupCarousel() {
    document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
      var prev = carousel.querySelector("[data-prev]");
      var next = carousel.querySelector("[data-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, position) {
          slide.classList.toggle("is-active", position === index);
        });
        dots.forEach(function (dot, position) {
          dot.classList.toggle("is-active", position === index);
        });
      }

      function start() {
        stop();
        timer = setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }

      if (!slides.length) {
        return;
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-slide-to") || 0));
          start();
        });
      });

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

      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
      show(0);
      start();
    });
  }

  function setupFilters() {
    var input = document.querySelector("[data-card-search]");
    var list = document.querySelector("[data-card-list]");
    var empty = document.querySelector("[data-search-empty]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
    var activeFilter = "all";

    if (!input || !list) {
      return;
    }

    function apply() {
      var query = normalize(input.value);
      var visible = 0;
      var cards = Array.prototype.slice.call(list.querySelectorAll(".js-movie-card"));

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesFilter = activeFilter === "all" || text.indexOf(normalize(activeFilter)) !== -1;
        var shouldShow = matchesQuery && matchesFilter;
        card.style.display = shouldShow ? "" : "none";
        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("is-active");
        });
        chip.classList.add("is-active");
        activeFilter = chip.getAttribute("data-filter-value") || "all";
        apply();
      });
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query) {
      input.value = query;
    }

    input.addEventListener("input", apply);
    apply();
  }

  setupMenu();
  setupCarousel();
  setupFilters();
})();
