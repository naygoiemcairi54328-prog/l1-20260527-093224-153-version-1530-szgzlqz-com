(function () {
    const toggle = document.querySelector('[data-menu-toggle]');
    const panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let index = 0;
        let timer = null;

        const show = function (nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        };

        const start = function () {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5000);
        };

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.dataset.heroDot || 0));
                start();
            });
        });

        start();
    }

    const filterGrid = document.querySelector('[data-filter-grid]');
    if (filterGrid) {
        const keywordInput = document.querySelector('[data-filter-input]');
        const yearSelect = document.querySelector('[data-year-filter]');
        const regionSelect = document.querySelector('[data-region-filter]');
        const reset = document.querySelector('[data-filter-reset]');
        const count = document.querySelector('[data-result-count]');
        const items = Array.from(filterGrid.children);

        const applyFilter = function () {
            const q = (keywordInput && keywordInput.value || '').trim().toLowerCase();
            const year = yearSelect && yearSelect.value || '';
            const region = regionSelect && regionSelect.value || '';
            let visible = 0;

            items.forEach(function (item) {
                const text = item.textContent.toLowerCase();
                const okKeyword = !q || text.includes(q);
                const okYear = !year || item.dataset.year === year || text.includes(year);
                const okRegion = !region || item.dataset.region === region || text.includes(region);
                const show = okKeyword && okYear && okRegion;
                item.classList.toggle('is-hidden', !show);
                if (show) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = visible + ' 部';
            }
        };

        [keywordInput, yearSelect, regionSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        if (reset) {
            reset.addEventListener('click', function () {
                if (keywordInput) keywordInput.value = '';
                if (yearSelect) yearSelect.value = '';
                if (regionSelect) regionSelect.value = '';
                applyFilter();
            });
        }
    }
})();
