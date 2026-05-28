function initMoviePlayer(videoId, overlayId, buttonId, sourceUrl) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var button = document.getElementById(buttonId);
  var attached = false;
  var hls = null;

  if (!video || !sourceUrl) {
    return;
  }

  function attach() {
    if (attached) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      attached = true;
      return;
    }

    if (typeof Hls !== "undefined" && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      attached = true;
      return;
    }

    video.src = sourceUrl;
    attached = true;
  }

  function start() {
    attach();
    video.controls = true;
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  }

  function toggle() {
    if (video.paused) {
      start();
    } else {
      video.pause();
    }
  }

  if (overlay) {
    overlay.addEventListener("click", start);
  }

  if (button) {
    button.addEventListener("click", start);
  }

  video.addEventListener("click", toggle);
  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });
  video.addEventListener("ended", function () {
    if (overlay) {
      overlay.classList.remove("is-hidden");
    }
  });
  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
