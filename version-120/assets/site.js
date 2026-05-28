(function () {
  var navToggle = document.querySelector('.nav-toggle');
  var navPanel = document.querySelector('.nav-panel');
  if (navToggle && navPanel) {
    navToggle.addEventListener('click', function () {
      var open = navPanel.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('.hero-slider');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;
    var show = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle('is-active', pos === current);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle('is-active', pos === current);
      });
    };
    var next = function () {
      show(current + 1);
    };
    var start = function () {
      timer = window.setInterval(next, 5200);
    };
    var stop = function () {
      if (timer) {
        window.clearInterval(timer);
      }
    };
    var prevButton = hero.querySelector('.hero-prev');
    var nextButton = hero.querySelector('.hero-next');
    if (prevButton) {
      prevButton.addEventListener('click', function () {
        stop();
        show(current - 1);
        start();
      });
    }
    if (nextButton) {
      nextButton.addEventListener('click', function () {
        stop();
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, pos) {
      dot.addEventListener('click', function () {
        stop();
        show(pos);
        start();
      });
    });
    start();
  }

  document.querySelectorAll('.rail-wrap').forEach(function (wrap) {
    var rail = wrap.querySelector('.movie-rail');
    var prev = wrap.querySelector('.rail-prev');
    var next = wrap.querySelector('.rail-next');
    if (!rail) {
      return;
    }
    if (prev) {
      prev.addEventListener('click', function () {
        rail.scrollBy({ left: -420, behavior: 'smooth' });
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        rail.scrollBy({ left: 420, behavior: 'smooth' });
      });
    }
  });

  var normalize = function (value) {
    return (value || '').toString().trim().toLowerCase();
  };

  var applyFilter = function (input, scope) {
    var query = normalize(input.value);
    var items = Array.prototype.slice.call(scope.querySelectorAll('[data-search]'));
    var shown = 0;
    items.forEach(function (item) {
      var text = normalize(item.getAttribute('data-search') + ' ' + item.textContent);
      var match = !query || text.indexOf(query) !== -1;
      item.hidden = !match;
      if (match) {
        shown += 1;
      }
    });
    var empty = scope.parentElement.querySelector('.empty-state');
    if (empty) {
      empty.hidden = shown !== 0;
    }
  };

  document.querySelectorAll('.local-filter').forEach(function (input) {
    var scope = document.querySelector('.searchable-grid');
    if (!scope) {
      return;
    }
    input.addEventListener('input', function () {
      applyFilter(input, scope);
    });
  });

  var searchInput = document.querySelector('.global-search-input');
  var searchGrid = document.querySelector('.search-results-grid');
  if (searchInput && searchGrid) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    searchInput.value = q;
    applyFilter(searchInput, searchGrid);
    searchInput.addEventListener('input', function () {
      applyFilter(searchInput, searchGrid);
    });
  }
})();

function initMoviePlayer(source) {
  var player = document.getElementById('moviePlayer');
  var video = document.getElementById('movieVideo');
  var overlay = document.getElementById('playerOverlay');
  var playToggle = document.getElementById('playToggle');
  var muteToggle = document.getElementById('muteToggle');
  var fullToggle = document.getElementById('fullToggle');
  var attached = false;
  var hlsInstance = null;

  if (!player || !video || !overlay || !source) {
    return;
  }

  var attach = function () {
    if (attached) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
    attached = true;
  };

  var start = function () {
    attach();
    overlay.classList.add('is-hidden');
    player.classList.add('is-playing');
    video.controls = true;
    var action = video.play();
    if (action && typeof action.catch === 'function') {
      action.catch(function () {});
    }
  };

  overlay.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    } else {
      video.pause();
    }
  });

  if (playToggle) {
    playToggle.addEventListener('click', function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });
  }

  if (muteToggle) {
    muteToggle.addEventListener('click', function () {
      video.muted = !video.muted;
      muteToggle.textContent = video.muted ? '静音' : '声音';
    });
  }

  if (fullToggle) {
    fullToggle.addEventListener('click', function () {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (player.requestFullscreen) {
        player.requestFullscreen();
      }
    });
  }

  video.addEventListener('play', function () {
    player.classList.add('is-playing');
    if (playToggle) {
      playToggle.textContent = '暂停';
    }
  });

  video.addEventListener('pause', function () {
    if (playToggle) {
      playToggle.textContent = '▶';
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
