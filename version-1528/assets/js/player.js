(function () {
  var shells = Array.prototype.slice.call(document.querySelectorAll('.js-player'));
  shells.forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.player-start');
    var source = shell.getAttribute('data-m3u8');
    var hls = null;

    function prepare() {
      if (!video || !source || video.getAttribute('data-ready') === '1') {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      video.setAttribute('data-ready', '1');
    }

    function start() {
      prepare();
      if (button) {
        button.classList.add('is-hidden');
      }
      if (video) {
        video.controls = true;
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {
            if (button) {
              button.classList.remove('is-hidden');
            }
          });
        }
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.getAttribute('data-ready') !== '1') {
          start();
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
    }
  });
})();
