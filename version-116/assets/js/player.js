import { H as Hls } from "./hls.js";

export function initPlayer(video, trigger, source) {
  if (!video || !trigger || !source) {
    return;
  }

  let ready = false;
  let hls = null;

  const attach = () => {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    }
  };

  const start = async () => {
    attach();
    trigger.classList.add("is-hidden");
    try {
      await video.play();
    } catch (error) {
      trigger.classList.remove("is-hidden");
    }
  };

  trigger.addEventListener("click", start);

  video.addEventListener("click", () => {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener("play", () => {
    trigger.classList.add("is-hidden");
  });

  video.addEventListener("pause", () => {
    if (video.currentTime === 0) {
      trigger.classList.remove("is-hidden");
    }
  });

  window.addEventListener("pagehide", () => {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
