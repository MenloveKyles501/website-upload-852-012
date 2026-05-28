(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initImageFallbacks() {
    var images = document.querySelectorAll("img.js-cover");
    images.forEach(function (image) {
      image.addEventListener("error", function () {
        var holder = image.closest(".poster");
        if (holder) {
          holder.classList.add("cover-fallback");
        }
      }, { once: true });
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var featureTitle = hero.querySelector("[data-hero-title]");
    var featureText = hero.querySelector("[data-hero-text]");
    var featureLink = hero.querySelector("[data-hero-link]");
    var featureImage = hero.querySelector("[data-hero-image]");
    var current = 0;

    function activate(index) {
      current = index % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
      var active = slides[current];
      if (featureTitle) {
        featureTitle.textContent = active.getAttribute("data-title") || "";
      }
      if (featureText) {
        featureText.textContent = active.getAttribute("data-text") || "";
      }
      if (featureLink) {
        featureLink.setAttribute("href", active.getAttribute("data-link") || "#");
      }
      if (featureImage) {
        featureImage.setAttribute("src", active.getAttribute("data-image") || "");
        featureImage.setAttribute("alt", active.getAttribute("data-title") || "");
      }
    }

    if (slides.length === 0) {
      return;
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        activate(index);
      });
    });
    activate(0);
    if (slides.length > 1) {
      window.setInterval(function () {
        activate(current + 1);
      }, 5200);
    }
  }

  function getSearchQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get("q") || "").trim();
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase();
  }

  function createResultCard(item) {
    return '' +
      '<a class="movie-card" href="' + item.url + '">' +
        '<div class="movie-poster poster" data-title="' + escapeHtml(item.title) + '">' +
          '<img class="js-cover" src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<div class="poster-shade"></div>' +
          '<span class="year-badge">' + escapeHtml(item.year) + '</span>' +
          '<span class="play-mark">▶</span>' +
        '</div>' +
        '<div class="movie-card-body">' +
          '<div class="pill-row">' +
            '<span class="pill cyan">' + escapeHtml(item.region) + '</span>' +
            '<span class="pill purple">' + escapeHtml(item.type) + '</span>' +
          '</div>' +
          '<h3>' + escapeHtml(item.title) + '</h3>' +
          '<p>' + escapeHtml(item.oneLine) + '</p>' +
        '</div>' +
      '</a>';
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;"
      }[character];
    });
  }

  function initSearchPage() {
    var box = document.querySelector("[data-search-results]");
    var input = document.querySelector("[data-search-input]");
    var title = document.querySelector("[data-search-title]");
    if (!box || !window.MovieSearchData) {
      return;
    }
    var query = getSearchQuery();
    if (input) {
      input.value = query;
    }
    if (!query) {
      box.innerHTML = "";
      return;
    }
    if (title) {
      title.textContent = '“' + query + '”相关片单';
    }
    var lowered = normalizeText(query);
    var results = window.MovieSearchData.filter(function (item) {
      return normalizeText(item.title).indexOf(lowered) !== -1 ||
        normalizeText(item.region).indexOf(lowered) !== -1 ||
        normalizeText(item.type).indexOf(lowered) !== -1 ||
        normalizeText(item.genre).indexOf(lowered) !== -1 ||
        normalizeText(item.tags).indexOf(lowered) !== -1 ||
        normalizeText(item.oneLine).indexOf(lowered) !== -1;
    }).slice(0, 120);
    if (results.length === 0) {
      box.innerHTML = '<div class="detail-panel"><p class="prose">没有找到匹配内容，可以换一个关键词继续搜索。</p></div>';
      return;
    }
    box.innerHTML = results.map(createResultCard).join("");
    initImageFallbacks();
  }

  ready(function () {
    initMenu();
    initImageFallbacks();
    initHero();
    initSearchPage();
  });
})();
