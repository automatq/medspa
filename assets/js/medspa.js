(() => {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const dropdown = document.querySelector("[data-nav-dropdown]");
  const dropdownButton = document.querySelector("[data-dropdown-toggle]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let menuCloseTimer;

  const setMobileMenu = (open) => {
    if (!menuButton || !mobileMenu) return;
    window.clearTimeout(menuCloseTimer);
    menuButton.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
    if (open) {
      mobileMenu.hidden = false;
      window.requestAnimationFrame(() => mobileMenu.classList.add("is-open"));
      return;
    }
    mobileMenu.classList.remove("is-open");
    menuCloseTimer = window.setTimeout(() => {
      mobileMenu.hidden = true;
    }, reduceMotion.matches ? 0 : 240);
  };

  menuButton?.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    setMobileMenu(open);
  });

  mobileMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMobileMenu(false));
  });

  dropdownButton?.addEventListener("click", () => {
    if (!dropdown) return;
    const open = dropdown.dataset.open !== "true";
    dropdown.dataset.open = String(open);
    dropdownButton.setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("click", (event) => {
    if (!dropdown || dropdown.contains(event.target)) return;
    dropdown.dataset.open = "false";
    dropdownButton?.setAttribute("aria-expanded", "false");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    setMobileMenu(false);
    if (dropdown) dropdown.dataset.open = "false";
    dropdownButton?.setAttribute("aria-expanded", "false");
    menuButton?.focus();
  });

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  const markMotionTargets = () => {
    document
      .querySelectorAll(
        ".section .eyebrow, .section .section-title, .section .lede, .section .editorial-image, .section .review-card, .page-hero .eyebrow, .page-hero .page-title, .page-hero .lede, .page-hero-meta, .cta-panel, .notice"
      )
      .forEach((element) => element.setAttribute("data-reveal", ""));

    document
      .querySelectorAll(
        ".trust-band-grid, .category-index, .service-list, .service-tags, .steps, .info-grid, .contact-grid, .faq-list, .proof-points"
      )
      .forEach((element) => element.setAttribute("data-reveal-group", ""));

    document
      .querySelectorAll(".editorial-image, .service-hero-media, .provider-portrait")
      .forEach((element) => element.classList.add("image-reveal"));

    const hero = document.querySelector(".hero-content, .service-hero-copy, .page-hero .shell");
    if (hero) {
      [
        hero.querySelector(".eyebrow"),
        hero.querySelector(".hero-copy, .service-intro, .lede"),
        hero.querySelector(".button-row, .page-hero-meta"),
        hero.querySelector(".hero-proof"),
      ]
        .filter(Boolean)
        .forEach((element, index) => {
          element.setAttribute("data-reveal", "");
          element.style.setProperty("--reveal-delay", `${index * 90 + 80}ms`);
        });
    }
  };

  const splitTitle = (title) => {
    if (!title || reduceMotion.matches || title.dataset.splitComplete === "true") return;
    const label = title.textContent.replace(/\s+/g, " ").trim();
    const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    let wordIndex = 0;
    nodes.forEach((node) => {
      if (!node.nodeValue.trim()) return;
      const fragment = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          fragment.append(part);
          return;
        }
        const outer = document.createElement("span");
        const inner = document.createElement("span");
        outer.className = "split-word";
        outer.setAttribute("aria-hidden", "true");
        inner.textContent = part;
        inner.style.setProperty("--word-delay", `${Math.min(wordIndex * 55, 660)}ms`);
        outer.append(inner);
        fragment.append(outer);
        wordIndex += 1;
      });
      node.replaceWith(fragment);
    });
    title.setAttribute("aria-label", label);
    title.dataset.splitComplete = "true";
  };

  const startMotion = () => {
    markMotionTargets();
    splitTitle(document.querySelector("[data-split-title], .hero .display-title, .page-hero .page-title"));

    const revealElements = [
      ...document.querySelectorAll("[data-reveal]"),
      ...[...document.querySelectorAll("[data-reveal-group]")].flatMap((group) => [...group.children]),
      ...document.querySelectorAll(".image-reveal"),
    ];

    document.querySelectorAll("[data-reveal-group]").forEach((group) => {
      [...group.children].forEach((child, index) => {
        child.style.setProperty("--reveal-delay", `${Math.min(index * 70, 490)}ms`);
      });
    });

    revealElements.forEach((element) => {
      if (element.getBoundingClientRect().top < window.innerHeight * 0.96) {
        element.classList.add("is-visible");
      }
    });

    document.documentElement.classList.add("motion-ready");
    window.requestAnimationFrame(() => {
      document.documentElement.classList.add("hero-sequence-ready");
    });

    if (!("IntersectionObserver" in window)) {
      revealElements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -7% 0px" }
    );

    revealElements
      .filter((element) => !element.classList.contains("is-visible"))
      .forEach((element) => observer.observe(element));
  };

  const startParallax = () => {
    if (
      reduceMotion.matches ||
      !window.matchMedia("(min-width: 900px) and (pointer: fine)").matches
    ) {
      return;
    }
    const images = [...document.querySelectorAll("[data-parallax] img")];
    if (!images.length) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      images.forEach((image) => {
        const rect = image.parentElement.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const center = rect.top + rect.height / 2;
        const progress = Math.max(-1, Math.min(1, (center - window.innerHeight / 2) / window.innerHeight));
        image.style.transform = `translate3d(0, ${(-progress * 24).toFixed(2)}px, 0) scale(1.06)`;
      });
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    requestUpdate();
  };

  const startMagneticButtons = () => {
    if (
      reduceMotion.matches ||
      !window.matchMedia("(pointer: fine) and (hover: hover)").matches
    ) {
      return;
    }
    document.querySelectorAll(".button").forEach((button) => {
      button.addEventListener("pointermove", (event) => {
        const rect = button.getBoundingClientRect();
        const x = Math.max(-4, Math.min(4, ((event.clientX - rect.left) / rect.width - 0.5) * 8));
        const y = Math.max(-4, Math.min(4, ((event.clientY - rect.top) / rect.height - 0.5) * 8));
        button.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
      });
      button.addEventListener("pointerleave", () => button.style.removeProperty("transform"));
    });
  };

  document.querySelectorAll(".faq-list").forEach((list) => {
    list.querySelectorAll("details").forEach((details) => {
      details.addEventListener("toggle", () => {
        if (!details.open) return;
        list.querySelectorAll("details[open]").forEach((other) => {
          if (other !== details) other.open = false;
        });
      });
    });
  });

  startMotion();
  startParallax();
  startMagneticButtons();
})();
