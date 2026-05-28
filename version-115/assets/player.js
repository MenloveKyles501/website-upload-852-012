import { H as Hls } from './hls-vendor-dru42stk.js';

function initializePlayer() {
  const video = document.querySelector('[data-player]');
  const overlay = document.querySelector('[data-play-overlay]');

  if (!video) {
    return;
  }

  const source = video.getAttribute('data-src');
  if (!source) {
    return;
  }

  let initialized = false;
  let hls = null;

  function attachSource() {
    if (initialized) {
      return Promise.resolve();
    }

    initialized = true;

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else {
      video.src = source;
    }

    return Promise.resolve();
  }

  function play() {
    attachSource().then(function () {
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          video.setAttribute('controls', 'controls');
        });
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', function () {
      overlay.classList.add('hidden');
      play();
    });
  }

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('hidden');
    }
  });

  video.addEventListener('click', function () {
    if (!initialized) {
      play();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

document.addEventListener('DOMContentLoaded', initializePlayer);
