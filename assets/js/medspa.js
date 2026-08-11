(() => {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const dropdown = document.querySelector("[data-nav-dropdown]");
  const dropdownButton = document.querySelector("[data-dropdown-toggle]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let menuCloseTimer;

  /**
   * /assets/* is served immutable for a year, so a lazily imported module has to
   * carry the same ?v= this script was loaded with or an edit to it never
   * reaches a browser that has already been here once.
   */
  const assetVersion = new URL(document.currentScript?.src || location.href).searchParams.get("v");
  const assetUrl = (path) => (assetVersion ? `${path}?v=${assetVersion}` : path);

  /**
   * The clinic's font pairing. A setting rather than copy, so it travels the
   * same override map but lands on an attribute — see data/editable.mjs.
   *
   * Applied here, at the top of the script, from the last known value rather
   * than from the network: /api/copy resolves long after first paint, so
   * waiting for it would show the wrong pairing and then swap it. The list is
   * duplicated from FONT_THEMES because an unrecognised value must not reach
   * the attribute.
   */
  const FONT_THEME_KEY = "site.theme.fonts";
  const FONT_THEME_CACHE = "anima-font-theme";
  const FONT_THEMES = ["classic", "modern", "editorial", "system"];

  const applyFontTheme = (value) => {
    if (!FONT_THEMES.includes(value)) return;
    document.documentElement.dataset.fontTheme = value;
    try {
      localStorage.setItem(FONT_THEME_CACHE, value);
    } catch {}
  };

  try {
    applyFontTheme(localStorage.getItem(FONT_THEME_CACHE));
  } catch {}

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
    const mobileWasOpen = menuButton?.getAttribute("aria-expanded") === "true";
    const dropdownWasOpen = dropdownButton?.getAttribute("aria-expanded") === "true";
    setMobileMenu(false);
    if (dropdown) dropdown.dataset.open = "false";
    dropdownButton?.setAttribute("aria-expanded", "false");
    if (mobileWasOpen) menuButton?.focus();
    else if (dropdownWasOpen) dropdownButton?.focus();
  });

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  // Cinematic logo intro (homepage). The overlay + its CSS reveal are already
  // on screen; here we lock scroll for its duration, let the viewer skip it,
  // then lift it away. The once-per-session / reduced-motion gate lives in the
  // inline <head> script (adds `intro-skip`); we just honour it.
  const startIntro = () => {
    const intro = document.querySelector("[data-intro]");
    if (!intro) return;
    if (document.documentElement.classList.contains("intro-skip")) {
      intro.remove();
      return;
    }
    document.body.classList.add("intro-lock");
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(holdTimer);
      intro.classList.add("is-leaving");
      document.body.classList.remove("intro-lock");
      const remove = () => intro.remove();
      intro.addEventListener("transitionend", remove, { once: true });
      window.setTimeout(remove, 700);
    };
    // The brandmark choreography finishes around 1s; hold just long enough to
    // let it land, then lift. Kept short so the site is reachable fast on slow
    // connections rather than sitting behind the overlay.
    const holdTimer = window.setTimeout(finish, 1150);
    intro.addEventListener("click", finish);
    window.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape" || event.key === "Enter" || event.key === " ") finish();
      },
      { once: true }
    );
    window.addEventListener("wheel", finish, { once: true, passive: true });
    window.addEventListener("touchstart", finish, { once: true, passive: true });
  };

  const markMotionTargets = () => {
    document
      .querySelectorAll(
        ".section .eyebrow, .section .section-title, .section .lede, .section .editorial-image, .section .review-card, .page-home .section .button-row, .page-home .profile-card, .page-hero .eyebrow, .page-hero .page-title, .page-hero .lede, .page-hero-meta, .cta-panel, .notice"
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

    document.querySelectorAll(".page-home .split").forEach((split) => {
      const image = split.querySelector(".editorial-image");
      const copy = [...split.children].find((child) => child !== image);

      copy
        ?.querySelectorAll(".eyebrow, .section-title, .lede, .button-row")
        .forEach((element, index) => {
          element.style.setProperty("--reveal-delay", `${Math.min(index * 75, 225)}ms`);
        });
    });

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

    const revealElements = [...new Set([
      ...document.querySelectorAll("[data-reveal]"),
      ...[...document.querySelectorAll("[data-reveal-group]")].flatMap((group) => [...group.children]),
      ...document.querySelectorAll(".image-reveal"),
    ])];

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

    const imageRevealSentinels = new Map();
    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          imageRevealSentinels.get(entry.target)?.forEach((image) => image.classList.add("is-visible"));
          imageObserver.unobserve(entry.target);
          imageRevealSentinels.delete(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -5% 0px" }
    );

    revealElements
      .filter((element) => !element.classList.contains("is-visible"))
      .forEach((element) => {
        if (!element.classList.contains("image-reveal") || !element.parentElement) {
          observer.observe(element);
          return;
        }
        const sentinel = element.parentElement;
        const images = imageRevealSentinels.get(sentinel) || [];
        images.push(element);
        imageRevealSentinels.set(sentinel, images);
        imageObserver.observe(sentinel);
      });
  };

  const startParallax = () => {
    const desktopPointer = window.matchMedia("(min-width: 900px) and (pointer: fine)");
    const targets = [...document.querySelectorAll("[data-parallax]")]
      .map((container) => ({
        container,
        image: container.matches("img") ? container : container.querySelector("img"),
        strength: Number.parseFloat(container.dataset.parallaxStrength || "24"),
        scale: Number.parseFloat(container.dataset.parallaxScale || "1.06"),
      }))
      .filter(({ image, strength, scale }) => image && Number.isFinite(strength) && Number.isFinite(scale));
    if (!targets.length) return;

    let frame = 0;
    const reset = () => {
      targets.forEach(({ image }) => {
        image.style.removeProperty("--parallax-y");
        image.style.removeProperty("--parallax-scale");
      });
    };
    const update = () => {
      frame = 0;
      if (reduceMotion.matches || !desktopPointer.matches) {
        reset();
        return;
      }
      targets.forEach(({ container, image, strength, scale }) => {
        const rect = container.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const center = rect.top + rect.height / 2;
        const progress = Math.max(-1, Math.min(1, (center - window.innerHeight / 2) / window.innerHeight));
        image.style.setProperty("--parallax-y", `${(-progress * strength).toFixed(2)}px`);
        image.style.setProperty("--parallax-scale", String(scale));
      });
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    reduceMotion.addEventListener?.("change", requestUpdate);
    desktopPointer.addEventListener?.("change", requestUpdate);
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

  /**
   * Forms have no backend yet, so they compose a mailto: rather than pretend to
   * send. The button already reads "Open email with my message", which stays
   * true with JS, without JS, and after a real backend lands.
   *
   * The status line is deliberately conditional — there is no success we can
   * honestly assert, so it reports what we did, not what happened. Fields are
   * never cleared: if the mail client did not open, the text must still be there.
   */
  const startMailtoForms = () => {
    document.querySelectorAll("form[data-mailto-form]").forEach((form) => {
      const status = form.querySelector(".form-status");
      const to = form.dataset.mailtoTo || "animamedspa@gmail.com";
      const subject = form.dataset.mailtoSubject || "Website enquiry";

      const mark = (field, message) => {
        const input = field.querySelector("input, textarea");
        const error = field.querySelector(".field-error");
        if (!input) return;
        input.setAttribute("aria-invalid", message ? "true" : "false");
        if (error) {
          if (message) error.textContent = message;
          error.hidden = !message;
        }
      };

      form.addEventListener("submit", (event) => {
        event.preventDefault();

        let firstInvalid = null;
        form.querySelectorAll(".field").forEach((field) => {
          const input = field.querySelector("input, textarea");
          if (!input) return;
          const valid = input.checkValidity();
          mark(field, valid ? "" : input.validationMessage);
          if (!valid && !firstInvalid) firstInvalid = input;
        });

        if (firstInvalid) {
          firstInvalid.focus();
          if (status) status.textContent = "Please correct the highlighted fields, then try again.";
          return;
        }

        const lines = [];
        form.querySelectorAll("input, textarea").forEach((input) => {
          if (!input.name || !input.value.trim()) return;
          const label = form.querySelector(`label[for="${input.id}"]`);
          const name = (label ? label.textContent : input.name).replace(/\s*\*\s*$/, "").trim();
          lines.push(`${name}: ${input.value.trim()}`);
        });

        if (status) {
          status.textContent =
            "Your email app should now open with this message ready to send. If nothing happened, email animamedspa@gmail.com or call 437-770-9296.";
        }

        window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
          lines.join("\r\n")
        )}`;
      });
    });
  };

  /**
   * Portrait lightbox for the team section.
   *
   * Every trigger is a plain link to the full-size image file, so expanding a
   * portrait already works with this script blocked — it just navigates to the
   * photograph. Here we upgrade that to an overlay that keeps the visitor on
   * the page. The overlay is constructed on the first open, so the pages that
   * carry no portraits never build one.
   */
  const startPortraitLightbox = () => {
    const triggers = [...document.querySelectorAll("a[data-lightbox]")];
    if (!triggers.length) return;

    let overlay;
    let closeButton;
    let image;
    let caption;
    let lastFocused;

    const close = () => {
      if (!overlay?.classList.contains("is-open")) return;
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lightbox-open");
      lastFocused?.focus();
    };

    const build = () => {
      overlay = document.createElement("div");
      overlay.className = "lightbox";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.setAttribute("aria-hidden", "true");
      overlay.innerHTML =
        '<button class="lightbox-close" type="button" aria-label="Close photograph">' +
        '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
        "</button>" +
        '<figure class="lightbox-figure"><img alt=""><figcaption></figcaption></figure>';
      document.body.append(overlay);
      closeButton = overlay.querySelector(".lightbox-close");
      image = overlay.querySelector("img");
      caption = overlay.querySelector("figcaption");

      overlay.addEventListener("click", (event) => {
        if (event.target === overlay || event.target.closest(".lightbox-close")) close();
      });

      // Nothing behind the overlay should be reachable, and the close button is
      // its only focusable control, so Tab simply stays put.
      overlay.addEventListener("keydown", (event) => {
        if (event.key === "Escape") close();
        if (event.key !== "Tab") return;
        event.preventDefault();
        closeButton.focus();
      });
    };

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        // A modified click is a request for a new tab or a download. Honour it.
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        if (!overlay) build();

        lastFocused = trigger;
        image.src = trigger.href;
        image.alt = trigger.querySelector("img")?.alt || "";
        caption.textContent = trigger.dataset.lightboxCaption || "";
        overlay.setAttribute("aria-label", caption.textContent || "Photograph");
        overlay.removeAttribute("aria-hidden");
        overlay.classList.add("is-open");
        document.body.classList.add("lightbox-open");
        closeButton.focus();
      });
    });
  };

  /**
   * Applies clinic edits, and loads the editor only for whoever makes them.
   *
   * Two deliberate differences from preet/cambridge:
   *
   * The cached map is applied synchronously before the network call, so only the
   * first page of a session can flash build-time copy; every page after it is
   * right on first paint. preet refetches on each mount and flashes every time.
   *
   * The editor bundle is fetched only when the admin hint cookie is present, so
   * an ordinary visitor never downloads it. preet ships its editor plus a
   * 1021-line registry to every anonymous visitor and merely hides the UI.
   */
  const COPY_CACHE_KEY = "anima-copy-cache";

  const applyOverrides = (map) => {
    if (!map) return;
    for (const [key, value] of Object.entries(map)) {
      if (key === FONT_THEME_KEY) {
        applyFontTheme(value);
        continue;
      }
      document.querySelectorAll(`[data-copy-key="${CSS.escape(key)}"]`).forEach((node) => {
        // An image key holds a URL; every other key holds text.
        if (node.tagName === "IMG") node.src = value;
        else if (node.textContent !== value) node.textContent = value;
      });
    }
  };

  const startCopyOverrides = () => {
    try {
      const cached = sessionStorage.getItem(COPY_CACHE_KEY);
      if (cached) applyOverrides(JSON.parse(cached));
    } catch {}

    fetch("/api/copy")
      .then((response) => (response.ok ? response.json() : null))
      .then((map) => {
        if (!map) return;
        applyOverrides(map);
        try {
          sessionStorage.setItem(COPY_CACHE_KEY, JSON.stringify(map));
        } catch {}
      })
      .catch(() => {});
  };

  /**
   * Merges posts written in the composer into the journal grids.
   *
   * The homepage and /blog/ ship their cards baked in, so an empty response —
   * including the empty response a store failure produces — correctly means
   * "leave the DOM alone". Only when something is actually stored does the grid
   * get replaced.
   *
   * Cards are built with DOM calls rather than innerHTML: this is the one place
   * on the site where markup would be assembled from stored values, and
   * `textContent` cannot be talked into executing anything.
   *
   * Cards arrive after startMotion() has already collected its reveal targets,
   * so they are marked visible on creation. An element with [data-reveal] that
   * no observer is watching stays at opacity 0 forever.
   */
  const JOURNAL_CACHE_KEY = "anima-journal-cache";

  const journalCard = (post) => {
    const card = document.createElement("a");
    card.className = "post-card is-visible";
    card.href = post.href;
    card.setAttribute("data-reveal", "");

    const frame = document.createElement("span");
    frame.className = "post-card-image";
    const image = document.createElement("img");
    image.src = post.image;
    image.alt = post.heroAlt || "";
    image.width = 640;
    image.height = 427;
    image.loading = "lazy";
    frame.append(image);

    const meta = document.createElement("span");
    meta.className = "post-meta";
    for (const value of [post.category, post.date, `${post.readMinutes} min read`]) {
      const cell = document.createElement("span");
      cell.textContent = value;
      meta.append(cell);
    }

    const title = document.createElement("h3");
    title.textContent = post.title;

    const deck = document.createElement("span");
    deck.textContent = post.deck;

    card.append(frame, meta, title, deck);
    return card;
  };

  const renderJournal = (posts) => {
    if (!Array.isArray(posts) || posts.length === 0) return;
    document.querySelectorAll("[data-journal-grid]").forEach((grid) => {
      // The homepage shows three; /blog/ carries data-journal-all and shows them all.
      const limit = grid.hasAttribute("data-journal-all") ? posts.length : 3;
      grid.replaceChildren(...posts.slice(0, limit).map(journalCard));
    });
  };

  const startJournal = () => {
    if (!document.querySelector("[data-journal-grid]")) return;

    try {
      const cached = sessionStorage.getItem(JOURNAL_CACHE_KEY);
      if (cached) renderJournal(JSON.parse(cached));
    } catch {}

    fetch("/api/posts")
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        if (!body) return;
        renderJournal(body.posts);
        try {
          // Clearing on empty matters: without it, deleting the last stored post
          // would leave it on screen for the rest of the session.
          if (body.posts.length) sessionStorage.setItem(JOURNAL_CACHE_KEY, JSON.stringify(body.posts));
          else sessionStorage.removeItem(JOURNAL_CACHE_KEY);
        } catch {}
      })
      .catch(() => {});
  };

  const startEditor = () => {
    if (!document.cookie.includes("anima_admin_hint=1")) return;
    import(assetUrl("/assets/js/editor.js"))
      .then((module) => module.init({ applyOverrides, cacheKey: COPY_CACHE_KEY }))
      .catch(() => {});
  };

  /**
   * The Book now pills get a WebGL rim highlight — leaning toward the cursor on
   * a desktop, and on a phone lit by the tap and by one sweep when the pill
   * first appears. It is decoration on a link and nothing depends on it, so it
   * is still withheld from anyone who has asked for less motion, and the module
   * is only fetched on a page that has a pill to put it on.
   */
  const startSpecularButtons = () => {
    if (!document.querySelector("[data-specular]")) return;
    if (reduceMotion.matches) return;
    import(assetUrl("/assets/js/specular-button.js"))
      .then((module) => module.init())
      .catch(() => {});
  };

  /**
   * The sticky mobile bar's "GPS" button opens a small chooser so the visitor can
   * launch directions in Google Maps, Waze, or — only where it exists — Apple Maps.
   * The Apple link ships hidden and is revealed on Apple platforms (iPadOS 13+
   * reports "Macintosh"). Closes on outside click or Escape, like the nav dropdown.
   */
  const startGpsDirections = () => {
    const wrap = document.querySelector("[data-gps]");
    const toggle = wrap?.querySelector("[data-gps-toggle]");
    const sheet = wrap?.querySelector("[data-gps-sheet]");
    if (!wrap || !toggle || !sheet) return;

    if (/iP(hone|ad|od)|Macintosh/.test(navigator.userAgent)) {
      wrap.querySelector("[data-gps-apple]")?.removeAttribute("hidden");
    }

    const setOpen = (open) => {
      sheet.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
    };

    toggle.addEventListener("click", () => setOpen(sheet.hidden));

    document.addEventListener("click", (event) => {
      if (wrap.contains(event.target)) return;
      setOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || sheet.hidden) return;
      setOpen(false);
      toggle.focus();
    });
  };

  startIntro();
  startMotion();
  startParallax();
  startMagneticButtons();
  startSpecularButtons();
  startGpsDirections();
  startMailtoForms();
  startPortraitLightbox();
  startCopyOverrides();
  startJournal();
  startEditor();
})();
