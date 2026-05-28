(function () {
  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-main-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }

    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    show(0);
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var scopeId = panel.getAttribute('data-filter-panel');
      var scope = document.querySelector('[data-filter-scope="' + scopeId + '"]');
      if (!scope) {
        return;
      }

      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      var input = panel.querySelector('[data-search]');
      var typeSelect = panel.querySelector('[data-type-filter]');
      var yearSelect = panel.querySelector('[data-year-filter]');
      var count = panel.querySelector('[data-result-count]');
      var empty = scope.querySelector('[data-empty]');

      function filter() {
        var q = normalize(input && input.value);
        var type = normalize(typeSelect && typeSelect.value);
        var year = normalize(yearSelect && yearSelect.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.tags,
            card.dataset.region,
            card.dataset.type,
            card.dataset.category,
            card.dataset.year
          ].join(' '));
          var matchesQuery = !q || haystack.indexOf(q) !== -1;
          var matchesType = !type || normalize(card.dataset.type).indexOf(type) !== -1;
          var matchesYear = !year || normalize(card.dataset.year) === year;
          var ok = matchesQuery && matchesType && matchesYear;
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = '当前显示 ' + visible + ' 部 / 共 ' + cards.length + ' 部';
        }
        if (empty) {
          scope.classList.toggle('no-results', visible === 0);
        }
      }

      [input, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', filter);
          control.addEventListener('change', filter);
        }
      });
      filter();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
