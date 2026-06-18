(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var players = Array.prototype.slice.call(document.querySelectorAll(".video-player"));

        players.forEach(function (player) {
            var video = player.querySelector("video");
            var overlay = player.querySelector(".player-overlay");
            var stream = player.getAttribute("data-stream");
            var prepared = false;

            function prepare() {
                if (prepared || !video || !stream) {
                    return;
                }
                prepared = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }

            function start() {
                prepare();
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                if (video) {
                    video.setAttribute("controls", "controls");
                    var attempt = video.play();
                    if (attempt && typeof attempt.catch === "function") {
                        attempt.catch(function () {});
                    }
                }
            }

            if (overlay) {
                overlay.addEventListener("click", start);
            }

            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        start();
                    }
                });
            }
        });
    });
})();
