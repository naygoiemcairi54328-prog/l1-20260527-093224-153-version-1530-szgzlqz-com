(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function bindMobileNav() {
    var toggle = $('[data-mobile-toggle]');
    var panel = $('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function bindHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    show(0);
    start();
  }

  function bindImageFallback() {
    $all('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.style.opacity = '0';
      }, { once: true });
    });
  }

  function suggestionMarkup(movie) {
    return [
      '<a class="suggestion-item" href="' + movie.url + '">',
      '<img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '">',
      '<span><strong>' + movie.title + '</strong><span>' + movie.category + ' · ' + movie.year + '</span></span>',
      '</a>'
    ].join('');
  }

  function bindSearchSuggestions() {
    var input = $('[data-search-input]');
    var box = $('[data-search-suggestions]');
    if (!input || !box || !window.MOVIE_INDEX) {
      return;
    }

    function render() {
      var q = normalize(input.value);
      if (!q) {
        box.classList.remove('open');
        box.innerHTML = '';
        return;
      }
      var results = window.MOVIE_INDEX.filter(function (movie) {
        return normalize(movie.title + ' ' + movie.category + ' ' + movie.genre + ' ' + movie.tags + ' ' + movie.oneLine).indexOf(q) !== -1;
      }).slice(0, 6);
      box.innerHTML = results.length ? results.map(suggestionMarkup).join('') : '<div class="empty-state">未找到相关影片</div>';
      box.classList.add('open');
    }

    input.addEventListener('input', render);
    input.addEventListener('focus', render);
    document.addEventListener('click', function (event) {
      if (!box.contains(event.target) && event.target !== input) {
        box.classList.remove('open');
      }
    });
  }

  function bindFilters() {
    var filter = $('[data-filter]');
    if (!filter) {
      return;
    }
    var query = $('[data-filter-query]', filter);
    var region = $('[data-filter-region]', filter);
    var year = $('[data-filter-year]', filter);
    var reset = $('[data-filter-reset]', filter);
    var cards = $all('[data-title]');

    function apply() {
      var q = normalize(query && query.value);
      var r = normalize(region && region.value);
      var y = normalize(year && year.value);
      cards.forEach(function (card) {
        var matchQuery = !q || normalize(card.getAttribute('data-title')).indexOf(q) !== -1;
        var matchRegion = !r || normalize(card.getAttribute('data-region')) === r;
        var matchYear = !y || normalize(card.getAttribute('data-year')) === y;
        card.style.display = matchQuery && matchRegion && matchYear ? '' : 'none';
      });
    }

    [query, region, year].forEach(function (item) {
      if (item) {
        item.addEventListener('input', apply);
        item.addEventListener('change', apply);
      }
    });
    if (reset) {
      reset.addEventListener('click', function () {
        if (query) query.value = '';
        if (region) region.value = '';
        if (year) year.value = '';
        apply();
      });
    }
  }

  function renderSearchPage() {
    var root = $('[data-search-results]');
    if (!root || !window.MOVIE_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = normalize(params.get('q'));
    var input = $('[data-search-page-input]');
    if (input) {
      input.value = params.get('q') || '';
    }
    var results = q ? window.MOVIE_INDEX.filter(function (movie) {
      return normalize(movie.title + ' ' + movie.category + ' ' + movie.genre + ' ' + movie.tags + ' ' + movie.oneLine).indexOf(q) !== -1;
    }).slice(0, 120) : window.MOVIE_INDEX.slice(0, 80);
    if (!results.length) {
      root.innerHTML = '<div class="empty-state">未找到相关影片</div>';
      return;
    }
    root.innerHTML = results.map(function (movie) {
      return [
        '<article class="search-result">',
        '<a class="rank-poster" href="' + movie.url + '"><img class="poster-img" src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '"></a>',
        '<div class="rank-info">',
        '<div class="card-meta"><span>' + movie.year + '</span><span>' + movie.region + '</span><span>' + movie.category + '</span><span>★ ' + movie.rating + '</span></div>',
        '<h3><a href="' + movie.url + '">' + movie.title + '</a></h3>',
        '<p>' + movie.oneLine + '</p>',
        '<div class="tag-row">' + movie.tags.slice(0, 4).map(function (tag) { return '<span>' + tag + '</span>'; }).join('') + '</div>',
        '</div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function setupHls(video, source) {
    if (!video || video.dataset.ready === '1') {
      return;
    }
    video.dataset.ready = '1';
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hls = hls;
      return;
    }
    video.src = source;
  }

  function bindPlayers() {
    $all('[data-player]').forEach(function (box) {
      var video = $('video', box);
      var source = box.getAttribute('data-video-url');
      var overlay = $('[data-player-button]', box);
      if (!video || !source) {
        return;
      }
      function play() {
        setupHls(video, source);
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
        box.classList.add('is-playing');
      }
      if (overlay) {
        overlay.addEventListener('click', play);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        box.classList.remove('is-playing');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindMobileNav();
    bindHero();
    bindImageFallback();
    bindSearchSuggestions();
    bindFilters();
    renderSearchPage();
    bindPlayers();
  });
})();
