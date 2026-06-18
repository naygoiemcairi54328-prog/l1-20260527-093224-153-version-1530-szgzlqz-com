function initializeVideo(options) {
  var video = document.getElementById(options.videoId);
  var button = document.getElementById(options.buttonId);
  var source = options.src;
  var hls = null;
  var ready = false;

  if (!video || !source) {
    return;
  }

  var load = function () {
    if (ready) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    }

    ready = true;
  };

  var play = function () {
    load();

    if (button) {
      button.classList.add('is-hidden');
    }

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  };

  if (button) {
    button.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
