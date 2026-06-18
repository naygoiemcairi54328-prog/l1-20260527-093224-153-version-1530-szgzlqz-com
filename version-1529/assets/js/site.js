(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    var showSlide = function (index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    var start = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    };

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        start();
      });
    });

    showSlide(0);
    start();
  }

  var filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    var input = filterPanel.querySelector('[data-filter-input]');
    var selects = Array.prototype.slice.call(filterPanel.querySelectorAll('[data-filter-select]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));

    var applyFilters = function () {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var filters = {};

      selects.forEach(function (select) {
        filters[select.getAttribute('data-filter-select')] = select.value;
      });

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesSelects = Object.keys(filters).every(function (key) {
          return !filters[key] || card.getAttribute('data-' + key) === filters[key];
        });

        card.classList.toggle('is-hidden-card', !(matchesKeyword && matchesSelects));
      });
    };

    if (input) {
      input.addEventListener('input', applyFilters);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });
  }

  var searchInput = document.getElementById('site-search-input');
  var searchResults = document.getElementById('site-search-results');

  if (searchInput && searchResults && Array.isArray(window.SEARCH_INDEX)) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    searchInput.value = initialQuery;

    var render = function () {
      var query = searchInput.value.trim().toLowerCase();
      var results = window.SEARCH_INDEX.filter(function (item) {
        if (!query) {
          return false;
        }

        return [item.title, item.region, item.type, item.year, item.genre, item.tags].join(' ').toLowerCase().indexOf(query) !== -1;
      }).slice(0, 80);

      if (!query) {
        searchResults.innerHTML = '';
        return;
      }

      searchResults.innerHTML = results.map(function (item) {
        return [
          '<a class="movie-card small" href="' + item.url + '">',
          '  <span class="poster-wrap">',
          '    <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
          '    <span class="poster-badge">' + escapeHtml(item.type) + '</span>',
          '  </span>',
          '  <span class="card-body">',
          '    <strong>' + escapeHtml(item.title) + '</strong>',
          '    <span class="card-meta">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + '</span>',
          '    <span class="card-desc">' + escapeHtml(item.oneLine) + '</span>',
          '  </span>',
          '</a>'
        ].join('');
      }).join('');
    };

    var escapeHtml = function (text) {
      return String(text || '').replace(/[&<>"]/g, function (character) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[character];
      });
    };

    searchInput.addEventListener('input', render);
    render();
  }
})();
