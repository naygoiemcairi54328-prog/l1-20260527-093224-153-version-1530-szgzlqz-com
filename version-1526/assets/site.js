(function () {
  const header = document.querySelector('.site-header');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobilePanel = document.querySelector('.mobile-panel');
  const heroSlides = Array.from(document.querySelectorAll('.hero-slide'));
  const heroDots = Array.from(document.querySelectorAll('.hero-dot'));
  let heroIndex = 0;

  function onScroll() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 16);
  }

  function showHero(index) {
    if (!heroSlides.length) {
      return;
    }
    heroIndex = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach((slide, current) => {
      slide.classList.toggle('is-active', current === heroIndex);
    });
    heroDots.forEach((dot, current) => {
      dot.classList.toggle('is-active', current === heroIndex);
    });
  }

  function setupHero() {
    if (!heroSlides.length) {
      return;
    }
    heroDots.forEach((dot, index) => {
      dot.addEventListener('click', () => showHero(index));
    });
    window.setInterval(() => showHero(heroIndex + 1), 5200);
  }

  function setupMobileMenu() {
    if (!mobileToggle || !mobilePanel) {
      return;
    }
    mobileToggle.addEventListener('click', () => {
      mobilePanel.classList.toggle('is-open');
    });
  }

  function setupHeaderSearch() {
    const inputs = Array.from(document.querySelectorAll('[data-global-search]'));
    if (!inputs.length || !window.SEARCH_INDEX) {
      return;
    }
    inputs.forEach((input) => {
      const holder = input.closest('.search-box');
      const panel = holder ? holder.querySelector('.search-panel') : null;
      if (!panel) {
        return;
      }
      input.addEventListener('input', () => {
        const keyword = input.value.trim().toLowerCase();
        if (!keyword) {
          panel.classList.remove('is-open');
          panel.innerHTML = '';
          return;
        }
        const matched = window.SEARCH_INDEX.filter((item) => {
          return (item.title + ' ' + item.genre + ' ' + item.category + ' ' + item.year).toLowerCase().includes(keyword);
        }).slice(0, 8);
        panel.innerHTML = matched.map((item) => {
          return '<a class="search-result" href="' + item.link + '"><img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '"><span><strong>' + item.title + '</strong><small>' + item.category + ' · ' + item.year + '</small></span></a>';
        }).join('') || '<div class="search-result"><span></span><span><strong>未找到相关影片</strong><small>换个关键词试试</small></span></div>';
        panel.classList.add('is-open');
      });
      input.addEventListener('blur', () => {
        window.setTimeout(() => panel.classList.remove('is-open'), 180);
      });
      input.addEventListener('focus', () => {
        if (panel.innerHTML.trim()) {
          panel.classList.add('is-open');
        }
      });
    });
  }

  function setupPageFilter() {
    const input = document.querySelector('[data-page-filter]');
    const grid = document.querySelector('[data-filter-grid]');
    const sort = document.querySelector('[data-page-sort]');
    const empty = document.querySelector('[data-empty-state]');
    if (!grid) {
      return;
    }
    const cards = Array.from(grid.querySelectorAll('[data-movie-card]'));
    function apply() {
      const keyword = input ? input.value.trim().toLowerCase() : '';
      let visible = 0;
      cards.forEach((card) => {
        const text = card.getAttribute('data-search') || '';
        const matched = !keyword || text.toLowerCase().includes(keyword);
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }
    function applySort() {
      if (!sort) {
        return;
      }
      const mode = sort.value;
      const sorted = cards.slice().sort((a, b) => {
        if (mode === 'rating') {
          return Number(b.dataset.rating) - Number(a.dataset.rating);
        }
        if (mode === 'year') {
          return Number(b.dataset.year) - Number(a.dataset.year);
        }
        return Number(a.dataset.index) - Number(b.dataset.index);
      });
      sorted.forEach((card) => grid.appendChild(card));
      apply();
    }
    if (input) {
      input.addEventListener('input', apply);
    }
    if (sort) {
      sort.addEventListener('change', applySort);
    }
    apply();
  }

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve();
    }
    if (window.__hlsReady) {
      return window.__hlsReady;
    }
    window.__hlsReady = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return window.__hlsReady;
  }

  function setupPlayers() {
    const players = Array.from(document.querySelectorAll('.player-shell'));
    players.forEach((shell) => {
      const video = shell.querySelector('video');
      const button = shell.querySelector('.player-start');
      const playUrl = shell.getAttribute('data-play');
      if (!video || !button || !playUrl) {
        return;
      }
      let hlsInstance = null;
      function begin() {
        const playNow = () => {
          shell.classList.add('is-playing');
          const attempt = video.play();
          if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(() => {});
          }
        };
        if (video.dataset.ready === '1') {
          playNow();
          return;
        }
        video.dataset.ready = '1';
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = playUrl;
          playNow();
          return;
        }
        loadHls().then(() => {
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });
            hlsInstance.loadSource(playUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playNow);
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal && hlsInstance) {
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                  hlsInstance.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                  hlsInstance.recoverMediaError();
                } else {
                  hlsInstance.destroy();
                }
              }
            });
          } else {
            video.src = playUrl;
            playNow();
          }
        }).catch(() => {
          video.src = playUrl;
          playNow();
        });
      }
      button.addEventListener('click', begin);
      video.addEventListener('click', () => {
        if (video.paused) {
          begin();
        }
      });
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('DOMContentLoaded', () => {
    onScroll();
    setupHero();
    setupMobileMenu();
    setupHeaderSearch();
    setupPageFilter();
    setupPlayers();
  });
})();
