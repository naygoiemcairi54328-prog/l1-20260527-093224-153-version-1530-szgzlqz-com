import { H as Hls } from './video-player-dru42stk.js';

const players = Array.from(document.querySelectorAll('.js-player'));

players.forEach(function (video) {
    const source = video.dataset.src;
    if (!source) {
        return;
    }

    if (Hls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
                const message = document.createElement('div');
                message.className = 'player-help';
                message.textContent = '视频加载失败，请稍后重试或检查播放源。';
                video.insertAdjacentElement('afterend', message);
                hls.destroy();
            }
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
    } else {
        const message = document.createElement('div');
        message.className = 'player-help';
        message.textContent = '当前浏览器不支持 HLS 播放。';
        video.insertAdjacentElement('afterend', message);
    }
});
