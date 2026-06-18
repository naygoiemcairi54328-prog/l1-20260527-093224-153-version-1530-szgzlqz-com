(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var navMenu = document.querySelector('[data-nav-menu]');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navMenu.classList.toggle('is-open');
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

    function setSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        setSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        setSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setSlide(current + 1);
        startTimer();
      });
    }

    startTimer();
  }

  var input = document.getElementById('globalSearch');
  var results = document.getElementById('searchResults');
  var grid = document.getElementById('movieGrid');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-category]'));
  var activeCategory = '';

  function renderResults(query) {
    if (!input || !results || !window.SEARCH_MOVIES) {
      return;
    }
    var keyword = query.trim().toLowerCase();
    if (!keyword) {
      results.classList.remove('is-active');
      results.innerHTML = '';
      return;
    }
    var matches = window.SEARCH_MOVIES.filter(function (item) {
      return [item.title, item.year, item.region, item.genre, item.category]
        .join(' ')
        .toLowerCase()
        .indexOf(keyword) > -1;
    }).slice(0, 12);

    results.innerHTML = matches.map(function (item) {
      return '<a class="search-result-item" href="' + item.url + '">' +
        '<img src="' + item.image + '" alt="' + item.title.replace(/"/g, '&quot;') + ' 封面" loading="lazy">' +
        '<span><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.genre + '</span></span>' +
        '</a>';
    }).join('');
    results.classList.toggle('is-active', matches.length > 0);
  }

  function filterGrid() {
    if (!grid) {
      return;
    }
    var keyword = input ? input.value.trim().toLowerCase() : '';
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-category')
      ].join(' ').toLowerCase();
      var passKeyword = !keyword || haystack.indexOf(keyword) > -1;
      var passCategory = !activeCategory || card.getAttribute('data-category') === activeCategory;
      card.classList.toggle('is-hidden-by-filter', !(passKeyword && passCategory));
    });
  }

  if (input) {
    input.addEventListener('input', function () {
      renderResults(input.value);
      filterGrid();
    });
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      filterButtons.forEach(function (item) {
        item.classList.remove('is-active');
      });
      button.classList.add('is-active');
      activeCategory = button.getAttribute('data-filter-category') || '';
      filterGrid();
    });
  });
})();
