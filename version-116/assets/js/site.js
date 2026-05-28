document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dot"));
    let index = 0;

    const showSlide = next => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
      dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
    };

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => showSlide(i));
    });

    if (slides.length > 1) {
      setInterval(() => showSlide(index + 1), 5200);
    }
  }

  document.querySelectorAll("[data-filter-scope]").forEach(scope => {
    const input = scope.querySelector(".filter-input");
    const year = scope.querySelector(".filter-year");
    const region = scope.querySelector(".filter-region");
    const cards = Array.from(scope.querySelectorAll(".movie-card"));
    let empty = scope.querySelector(".empty-state");

    if (!empty) {
      empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "没有匹配的影片";
      const grid = scope.querySelector(".movie-grid");
      if (grid) {
        grid.appendChild(empty);
      }
    }

    const applyFilter = () => {
      const query = input ? input.value.trim().toLowerCase() : "";
      const yearValue = year ? year.value : "";
      const regionValue = region ? region.value : "";
      let visible = 0;

      cards.forEach(card => {
        const haystack = [
          card.dataset.title,
          card.dataset.genre,
          card.dataset.region,
          card.dataset.tags,
          card.dataset.year
        ].join(" ").toLowerCase();
        const matchQuery = !query || haystack.includes(query);
        const matchYear = !yearValue || card.dataset.year === yearValue;
        const matchRegion = !regionValue || card.dataset.region === regionValue;
        const ok = matchQuery && matchYear && matchRegion;
        card.classList.toggle("is-filter-hidden", !ok);
        if (ok) {
          visible += 1;
        }
      });

      empty.style.display = visible ? "none" : "block";
    };

    [input, year, region].forEach(control => {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });

    applyFilter();
  });
});
