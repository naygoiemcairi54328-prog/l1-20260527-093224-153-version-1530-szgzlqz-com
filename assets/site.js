(function () {
  var toggle = document.querySelector("[data-nav-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  document.querySelectorAll("[data-search-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector("input[name='q']");
      if (!input || !input.value.trim()) {
        return;
      }
      event.preventDefault();
      window.location.href = "./search.html?q=" + encodeURIComponent(input.value.trim());
    });
  });

  var slider = document.querySelector("[data-hero-slider]");
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;
    var show = function (index) {
      current = index % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    };
    var start = function () {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5000);
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    if (slides.length > 1) {
      start();
    }
  }

  document.querySelectorAll("[data-card-list]").forEach(function (list) {
    var scope = list.closest("section") || document;
    var input = scope.querySelector("[data-card-search]");
    var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-type]"));
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
    var empty = scope.querySelector("[data-empty-state]");
    var activeType = "all";
    var apply = function () {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var typeValue = card.getAttribute("data-type") || "";
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchType = activeType === "all" || typeValue.indexOf(activeType) !== -1;
        var visible = matchKeyword && matchType;
        card.style.display = visible ? "" : "none";
        if (visible) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", shown === 0);
      }
    };
    if (input) {
      input.addEventListener("input", apply);
    }
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeType = button.getAttribute("data-filter-type") || "all";
        buttons.forEach(function (btn) {
          btn.classList.toggle("active", btn === button);
        });
        apply();
      });
    });
  });

  var searchResults = document.querySelector("[data-search-results]");
  var searchInput = document.querySelector("[data-search-input]");
  var searchForm = document.querySelector("[data-local-search-form]");
  var searchSummary = document.querySelector("[data-search-summary]");

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function renderSearch(query) {
    if (!searchResults || !window.SEARCH_INDEX) {
      return;
    }
    var keyword = (query || "").trim().toLowerCase();
    if (searchInput) {
      searchInput.value = query || "";
    }
    if (!keyword) {
      searchResults.innerHTML = "";
      if (searchSummary) {
        searchSummary.textContent = "输入关键词开始搜索";
      }
      return;
    }
    var items = window.SEARCH_INDEX.filter(function (item) {
      return [item.title, item.region, item.year, item.type, item.category, item.genre, item.tags, item.oneLine].join(" ").toLowerCase().indexOf(keyword) !== -1;
    }).slice(0, 120);
    searchResults.innerHTML = items.map(function (item) {
      return "<a class=\"movie-card\" href=\"./" + escapeHtml(item.url) + "\">" +
        "<span class=\"poster-wrap\"><img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\"><span class=\"duration-pill\">" + escapeHtml(item.duration) + "</span><span class=\"score-pill\">" + escapeHtml(item.score) + "</span></span>" +
        "<span class=\"card-body\"><strong>" + escapeHtml(item.title) + "</strong><span class=\"card-line\">" + escapeHtml(item.oneLine) + "</span><span class=\"card-meta\"><em>" + escapeHtml(item.region) + "</em><em>" + escapeHtml(item.year) + "</em><em>" + escapeHtml(item.type) + "</em></span></span>" +
        "</a>";
    }).join("");
    if (searchSummary) {
      searchSummary.textContent = items.length ? "搜索结果：" + items.length + " 条" : "没有匹配的影片";
    }
  }

  if (searchResults) {
    var params = new URLSearchParams(window.location.search);
    renderSearch(params.get("q") || "");
  }

  if (searchForm) {
    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      renderSearch(searchInput ? searchInput.value : "");
    });
  }
})();
