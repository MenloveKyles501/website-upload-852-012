(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setStatus(shell, text) {
    var status = shell.querySelector(".player-status");
    if (status) {
      status.textContent = text;
    }
  }

  function attachHls(video, source, shell) {
    if (!source) {
      setStatus(shell, "播放地址未加载");
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      setStatus(shell, "播放已就绪");
      return;
    }
    var Hls = window.Hls;
    if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus(shell, "播放已就绪");
      });
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus(shell, "播放加载异常");
        }
      });
      shell._hlsInstance = hls;
    } else {
      setStatus(shell, "当前浏览器不支持该播放格式");
    }
  }

  function initPlayer(shell) {
    var video = shell.querySelector("video[data-src]");
    var button = shell.querySelector(".player-start");
    if (!video) {
      return;
    }
    var source = video.getAttribute("data-src");
    attachHls(video, source, shell);

    function togglePlay() {
      if (video.paused) {
        video.play().catch(function () {
          setStatus(shell, "点击视频控件继续播放");
        });
      } else {
        video.pause();
      }
    }

    if (button) {
      button.addEventListener("click", togglePlay);
    }
    video.addEventListener("click", togglePlay);
    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
      setStatus(shell, "正在播放");
    });
    video.addEventListener("pause", function () {
      shell.classList.remove("is-playing");
      setStatus(shell, "已暂停");
    });
    video.addEventListener("ended", function () {
      shell.classList.remove("is-playing");
      setStatus(shell, "播放结束");
    });
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(initPlayer);
  });
})();
