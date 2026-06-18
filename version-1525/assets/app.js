(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            var open = mobilePanel.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", String(open));
            menuButton.textContent = open ? "×" : "☰";
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector(".hero-prev");
        var next = hero.querySelector(".hero-next");
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(active - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(active + 1);
                start();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    var filterList = document.querySelector("[data-filter-list]");
    var filterText = document.getElementById("filterText");
    var filterRegion = document.getElementById("filterRegion");
    var filterYear = document.getElementById("filterYear");
    var clearFilters = document.getElementById("clearFilters");
    var emptyState = document.querySelector("[data-empty-state]");

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, "");
    }

    function applyInitialQuery() {
        if (!filterText) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query) {
            filterText.value = query;
        }
    }

    function applyFilters() {
        if (!filterList) {
            return;
        }
        var cards = Array.prototype.slice.call(filterList.querySelectorAll(".movie-card"));
        var textValue = normalize(filterText ? filterText.value : "");
        var regionValue = filterRegion ? filterRegion.value : "";
        var yearValue = filterYear ? filterYear.value : "";
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-year"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags")
            ].join(" "));
            var matchesText = !textValue || haystack.indexOf(textValue) !== -1;
            var matchesRegion = !regionValue || card.getAttribute("data-region") === regionValue;
            var matchesYear = !yearValue || card.getAttribute("data-year") === yearValue;
            var show = matchesText && matchesRegion && matchesYear;
            card.hidden = !show;
            if (show) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle("is-visible", visible === 0);
        }
    }

    if (filterList) {
        applyInitialQuery();
        [filterText, filterRegion, filterYear].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });
        if (clearFilters) {
            clearFilters.addEventListener("click", function () {
                if (filterText) {
                    filterText.value = "";
                }
                if (filterRegion) {
                    filterRegion.value = "";
                }
                if (filterYear) {
                    filterYear.value = "";
                }
                applyFilters();
            });
        }
        applyFilters();
    }
})();
