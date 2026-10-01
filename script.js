/* =============================================================================
   SANTÉ BIO — script.js
   -----------------------------------------------------------------------------
   General page behaviour shared by every page:
     1. Product card rendering (used by the homepage bestsellers + shop grid)
     2. "Add to cart" delegation (works on cards rendered at any time)
     3. Sticky header shadow
     4. Mobile slide-in navigation drawer
     5. Scroll reveal via IntersectionObserver (with stagger)
     6. Animated counters
     7. Ticker duplication (seamless marquee)
     8. Shop page: category filters + live search
     9. Contact form (client-side only)
    10. Page transition + back-to-top
   ========================================================================== */

(function () {
  "use strict";

  /* =====================================================================
     1. ICONS (kept small, stroke-based, currentColor)
     ===================================================================== */
  var ICON = {
    cart:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2.2l2 12.2a1.8 1.8 0 0 0 1.8 1.6h7.7a1.8 1.8 0 0 0 1.8-1.4L20 8H6.2"/><circle cx="9.5" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/></svg>',
    heart:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7.5-4.6-7.5-9.5A4.2 4.2 0 0 1 12 7.7a4.2 4.2 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20z"/></svg>',
    arrow:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M12.5 6l6 6-6 6"/></svg>',
    check:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5.5 5.5L20 7"/></svg>',
    star:     '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.6l2.6 5.7 6.2.7-4.6 4.2 1.2 6.2L12 16.4l-5.4 3 1.2-6.2L3.2 9l6.2-.7z"/></svg>',
    search:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/></svg>',
    x:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    chevron:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>'
  };

  /* =====================================================================
     2. PRODUCT CARD RENDERER
     One template for the homepage bestsellers and the shop grid, so a product
     can never look different from one page to the next.
     ===================================================================== */
  function starsHtml(rating) {
    var out = "";
    for (var i = 0; i < 5; i++) {
      out += ICON.star.replace('<svg', '<svg opacity="' + (i < Math.round(rating) ? "1" : ".25") + '"');
    }
    return '<span class="rating__stars" aria-hidden="true">' + out + "</span>";
  }

  /* Tag values come from products.js as short keys; we show a readable label. */
  var TAG_LABELS = { hot: "Bestseller", new: "Nouveau", best: "Bestseller" };

  function productCardHtml(p, index) {
    var cat = CATEGORIES_MAP[p.cat];
    var tagClass = p.tag === "hot" ? "product-card__tag--hot" : (p.tag ? "product-card__tag--new" : "");
    var tagLabel = p.tag ? (TAG_LABELS[p.tag] || p.tag) : "";

    return (
      '<article class="product-card reveal" style="--d:' + (index % 4) * 70 + 'ms">' +
        '<div class="product-card__media">' +
          (p.tag ? '<span class="product-card__tag ' + tagClass + '">' + tagLabel + "</span>" : "") +
          '<button class="product-card__fav" type="button" aria-label="Ajouter ' + escapeHtml(p.name) + ' aux favoris">' + ICON.heart + "</button>" +
          '<img class="product-card__img" src="' + p.img + '" alt="' + escapeHtml(p.name) + '" loading="lazy" decoding="async" width="400" height="400">' +
        "</div>" +
        '<div class="product-card__body">' +
          '<span class="product-card__cat">' + escapeHtml(cat ? cat.name : "") + "</span>" +
          '<h3 class="product-card__name">' + escapeHtml(p.name) + "</h3>" +
          '<div class="rating">' + starsHtml(p.rating) + "<span>" + p.rating.toFixed(1) + " (" + p.reviews + ")</span></div>" +
          '<div class="product-card__foot">' +
            "<div>" +
              '<span class="price">' + formatPrice(p.price) + "</span>" +
              (p.oldPrice ? ' <span class="price price--was">' + formatPrice(p.oldPrice) + "</span>" : "") +
            "</div>" +
            '<button class="add-btn" type="button" data-add="' + p.id + '" aria-label="Ajouter ' + escapeHtml(p.name) + ' au panier">' + ICON.cart + " Ajouter</button>" +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  /** Renders a list of products into a container and wires the reveal observer. */
  function renderProducts(container, list) {
    if (!container) return;
    if (!list.length) {
      container.innerHTML =
        '<div class="empty-state" style="grid-column:1/-1">' +
          '<div class="empty-state__ico">' + ICON.search + "</div>" +
          "<h3>Aucun produit trouvé</h3>" +
          "<p>Essayez un autre mot-clé ou changez de catégorie.</p>" +
        "</div>";
      return;
    }
    container.innerHTML = list.map(productCardHtml).join("");
    observeReveals(container);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* =====================================================================
     3. ADD TO CART — global delegation
     ===================================================================== */
  function initAddToCart() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-add]");
      if (!btn || !window.SanteBioCart) return;

      e.preventDefault();
      window.SanteBioCart.add(btn.getAttribute("data-add"), 1);

      // temporary confirmation state on the button itself
      btn.classList.add("is-added");
      var label = btn.lastChild;
      var original = label ? label.textContent : "";
      if (label) label.textContent = " Ajouté ✓";
      window.setTimeout(function () {
        btn.classList.remove("is-added");
        if (label) label.textContent = original;
      }, 1400);
    });
  }

  /* =====================================================================
     4. STICKY HEADER
     ===================================================================== */
  function initHeader() {
    var header = document.querySelector(".header");
    if (!header) return;

    var apply = function () {
      header.classList.toggle("is-stuck", window.scrollY > 12);
    };
    apply();
    window.addEventListener("scroll", apply, { passive: true });
  }

  /* =====================================================================
     5. MOBILE NAV DRAWER
     ===================================================================== */
  function initNav() {
    var burger = document.querySelector(".burger");
    var drawer = document.querySelector(".drawer-nav");
    if (!burger || !drawer) return;

    var panel = drawer.querySelector(".drawer-nav__panel");
    var closeBtn = drawer.querySelector(".drawer-nav__close");
    var scrim = drawer.querySelector(".drawer-nav__scrim");

    // stagger index for the slide-in of each link
    drawer.querySelectorAll(".drawer-nav__list a").forEach(function (a, i) {
      a.style.setProperty("--i", i);
    });

    function open() {
      drawer.classList.add("is-open");
      burger.setAttribute("aria-expanded", "true");
      document.body.classList.add("is-locked");
    }
    function close() {
      drawer.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      document.body.classList.remove("is-locked");
    }

    burger.addEventListener("click", function () {
      drawer.classList.contains("is-open") ? close() : open();
    });
    if (closeBtn) closeBtn.addEventListener("click", close);
    if (scrim) scrim.addEventListener("click", close);
    drawer.querySelectorAll(".drawer-nav__list a").forEach(function (a) {
      a.addEventListener("click", close);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.classList.contains("is-open")) close();
    });
    // close automatically if resized up to desktop
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 860) close();
    });
    if (panel) panel.addEventListener("click", function (e) { e.stopPropagation(); });
  }

  /* =====================================================================
     6. SCROLL REVEAL
     ===================================================================== */
  var revealObserver = null;

  function observeReveals(root) {
    var nodes = (root || document).querySelectorAll(".reveal:not(.is-in)");
    if (!nodes.length) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      nodes.forEach(function (n) { n.classList.add("is-in"); });
      return;
    }

    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    }

    nodes.forEach(function (n) { revealObserver.observe(n); });
  }

  /* =====================================================================
     7. ANIMATED COUNTERS
     data-count="75000" data-suffix="+"  →  75K+ is done in markup, this
     animates the numeric part. Supports data-decimals.
     ===================================================================== */
  function initCounters() {
    var nodes = document.querySelectorAll("[data-count]");
    if (!nodes.length) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function animate(el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      var duration = 1600;
      var start = null;

      function frame(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);            // easeOutCubic
        var value = target * eased;
        el.textContent = decimals
          ? value.toFixed(decimals)
          : Math.round(value).toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, " ");
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    if (reduced || !("IntersectionObserver" in window)) {
      nodes.forEach(function (el) { el.setAttribute("data-counted", "1"); animate(el); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !entry.target.hasAttribute("data-counted")) {
          entry.target.setAttribute("data-counted", "1");
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    nodes.forEach(function (el) { io.observe(el); });
  }

  /* =====================================================================
     8. TICKER — duplicate the group once so the marquee loops seamlessly
     ===================================================================== */
  function initTicker() {
    document.querySelectorAll(".ticker__track").forEach(function (track) {
      var group = track.querySelector(".ticker__group");
      if (group) track.appendChild(group.cloneNode(true));
    });
  }

  /* =====================================================================
     9. SHOP PAGE — filters + search
     ===================================================================== */
  function initShop() {
    var grid = document.getElementById("shop-grid");
    if (!grid) return;

    var input = document.querySelector("[data-search]");
    var clearBtn = document.querySelector("[data-search-clear]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    var countEl = document.querySelector("[data-result-count]");
    var activeCat = "all";
    var query = "";

    function matches(p) {
      var byCat = activeCat === "all" || p.cat === activeCat;
      if (!byCat) return false;
      if (!query) return true;
      var haystack = (p.name + " " + p.desc + " " + (CATEGORIES_MAP[p.cat] || {}).name).toLowerCase();
      return haystack.indexOf(query) !== -1;
    }

    function apply() {
      var list = PRODUCTS.filter(matches);
      renderProducts(grid, list);
      if (countEl) {
        countEl.textContent = list.length + (list.length > 1 ? " produits" : " produit");
      }
      if (clearBtn) clearBtn.classList.toggle("is-visible", query.length > 0);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeCat = chip.getAttribute("data-filter");
        chips.forEach(function (c) {
          var on = c === chip;
          c.classList.toggle("is-active", on);
          c.setAttribute("aria-pressed", on ? "true" : "false");
        });
        apply();
      });
    });

    if (input) {
      var debounce;
      input.addEventListener("input", function () {
        window.clearTimeout(debounce);
        debounce = window.setTimeout(function () {
          query = input.value.trim().toLowerCase();
          apply();
        }, 180);
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        if (input) { input.value = ""; input.focus(); }
        query = "";
        apply();
      });
    }

    // category counts on the chips
    chips.forEach(function (chip) {
      var id = chip.getAttribute("data-filter");
      var n = id === "all" ? PRODUCTS.length : getByCategory(id).length;
      var slot = chip.querySelector(".filter__n");
      if (slot) slot.textContent = n;
    });

    // Deep link: shop.html?cat=face lands on that category already selected
    // (footer category links use this).
    var requested = new URLSearchParams(window.location.search).get("cat");
    if (requested) {
      var target = chips.filter(function (c) { return c.getAttribute("data-filter") === requested; })[0];
      if (target) target.click();
    }

    apply();
  }

  /* =====================================================================
     10. CONTACT FORM — client-side only, shows a confirmation
     ===================================================================== */
  function initContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;

    var success = document.getElementById("form-success");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      if (success) {
        success.classList.add("is-visible");
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      form.reset();
    });
  }

  /* =====================================================================
     11. BACK TO TOP
     ===================================================================== */
  function initBackToTop() {
    var btn = document.querySelector(".to-top");
    if (!btn) return;

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    var apply = function () {
      btn.classList.toggle("is-visible", window.scrollY > 700);
    };
    apply();
    window.addEventListener("scroll", apply, { passive: true });
  }

  /* =====================================================================
     12. YEAR IN FOOTER
     ===================================================================== */
  function initYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* =====================================================================
     13. BOOT
     ===================================================================== */
  function init() {
    initHeader();
    initNav();
    initAddToCart();
    initTicker();
    initShop();
    initContactForm();
    initBackToTop();
    initYear();
    observeReveals();
    initCounters();

    // homepage bestsellers
    var featured = document.getElementById("featured-grid");
    if (featured) {
      renderProducts(featured, getFeatured());
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* Exposed so inline page scripts can reuse the renderer. */
  window.SanteBioUI = { renderProducts: renderProducts, observeReveals: observeReveals };
})();
