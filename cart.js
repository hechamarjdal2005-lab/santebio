/* =============================================================================
   SANTÉ BIO — cart.js
   -----------------------------------------------------------------------------
   Everything the shopping cart needs, on every page:
     • a single source of truth persisted in localStorage
     • a badge on the navbar cart icon (with bounce + pulse micro-animations)
     • a right-side drawer on desktop / bottom sheet on mobile
     • qty +/-, remove, live total, empty state
     • "Order via WhatsApp" → wa.me deep link with an encoded order recap
     • a toast confirmation when an item is added

   The module listens for a custom "santebio:cart-change" event so any page
   script can react to cart updates without coupling to the internals.
   ========================================================================== */

(function () {
  "use strict";

  /* ---------- Config ---------- */
  var WHATSAPP_NUMBER = "212637553637";       // international format, no "+"
  var WHATSAPP_DISPLAY = "06 37 55 36 37";    // what we show to the customer
  var FREE_SHIPPING_FROM = 500;               // DH — matches the shop toolbar note
  var STORAGE_KEY = "santebio_cart_v1";

  /* ---------- Internal state ---------- */
  var cart = [];            // [{ id, qty }]
  var els = {};             // cached DOM nodes
  var lastFocused = null;   // for focus restoration when closing

  /* =====================================================================
     1. STORAGE
     ===================================================================== */
  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      // Drop anything that no longer exists in the catalogue, and clamp qty.
      return parsed
        .filter(function (line) {
          return line && getProduct(line.id) && Number(line.qty) > 0;
        })
        .map(function (line) {
          return { id: line.id, qty: Math.min(99, Math.floor(Number(line.qty))) };
        });
    } catch (err) {
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
      /* private mode / quota — the cart still works for the current page */
    }
  }

  /* =====================================================================
     2. DERIVED VALUES
     ===================================================================== */
  function count() {
    return cart.reduce(function (sum, line) { return sum + line.qty; }, 0);
  }

  function total() {
    return cart.reduce(function (sum, line) {
      var product = getProduct(line.id);
      return sum + (product ? product.price * line.qty : 0);
    }, 0);
  }

  /** Full cart lines joined to their product objects. */
  function detailed() {
    return cart
      .map(function (line) {
        var product = getProduct(line.id);
        return product ? { product: product, qty: line.qty } : null;
      })
      .filter(Boolean);
  }

  /* =====================================================================
     3. MUTATIONS
     ===================================================================== */
  function add(id, qty) {
    var product = getProduct(id);
    if (!product) return false;

    qty = qty ? Math.floor(qty) : 1;
    var line = cart.find(function (l) { return l.id === id; });

    if (line) {
      line.qty = Math.min(99, line.qty + qty);
    } else {
      cart.push({ id: id, qty: Math.min(99, qty) });
    }

    commit();
    return true;
  }

  function setQty(id, qty) {
    var line = cart.find(function (l) { return l.id === id; });
    if (!line) return;

    qty = Math.floor(qty);
    if (qty <= 0) return remove(id);

    line.qty = Math.min(99, qty);
    commit();
  }

  function remove(id) {
    cart = cart.filter(function (l) { return l.id !== id; });
    commit();
  }

  function clear() {
    cart = [];
    commit();
  }

  /** Persist, repaint, and announce the change to the page. */
  function commit() {
    save();
    render();
    document.dispatchEvent(new CustomEvent("santebio:cart-change", {
      detail: { count: count(), total: total() }
    }));
  }

  /* =====================================================================
     4. RENDERING
     ===================================================================== */
  function renderBadge() {
    if (!els.badge) return;
    var n = count();
    els.badge.textContent = n > 99 ? "99+" : String(n);
    els.badge.classList.toggle("is-visible", n > 0);
  }

  function renderItems() {
    if (!els.body) return;
    var lines = detailed();

    els.empty.classList.toggle("is-visible", lines.length === 0);
    els.body.style.display = lines.length ? "" : "none";

    els.body.innerHTML = lines.map(function (line) {
      var p = line.product;
      return (
        '<article class="cart-item" data-id="' + p.id + '">' +
          '<img class="cart-item__img" src="' + p.img + '" alt="" loading="lazy" decoding="async">' +
          '<div>' +
            '<h4 class="cart-item__name">' + escapeHtml(p.name) + "</h4>" +
            '<p class="cart-item__unit">' + escapeHtml(p.size) + " · " + formatPrice(p.price) + " l'unité" + "</p>" +
            '<div class="cart-item__row">' +
              '<div class="qty">' +
                '<button class="qty__btn" type="button" data-act="dec" aria-label="Retirer une unité de ' + escapeHtml(p.name) + '">' + ICON.minus + "</button>" +
                '<span class="qty__val" aria-live="polite">' + line.qty + "</span>" +
                '<button class="qty__btn" type="button" data-act="inc" aria-label="Ajouter une unité de ' + escapeHtml(p.name) + '">' + ICON.plus + "</button>" +
              "</div>" +
              '<span class="cart-item__total">' + formatPrice(p.price * line.qty) + "</span>" +
            "</div>" +
            '<button class="cart-item__rm" type="button" data-act="rm">' + ICON.trash + " Retirer</button>" +
          "</div>" +
        "</article>"
      );
    }).join("");
  }

  function renderTotals() {
    var n = count();
    var t = total();

    if (els.countLabel) els.countLabel.textContent = n === 0 ? "Panier vide" : n + (n > 1 ? " articles" : " article");
    if (els.subtotal) els.subtotal.textContent = formatPrice(t);
    if (els.total) els.total.textContent = formatPrice(t);
    if (els.waBtn) {
      els.waBtn.classList.toggle("is-disabled", n === 0);
      els.waBtn.setAttribute("aria-disabled", n === 0 ? "true" : "false");
    }
    if (els.freeShip) {
      if (n === 0) {
        els.freeShip.textContent = "Livraison partout au Maroc";
      } else if (t >= FREE_SHIPPING_FROM) {
        els.freeShip.textContent = "Livraison offerte ✓";
      } else {
        els.freeShip.textContent = "Plus que " + formatPrice(FREE_SHIPPING_FROM - t) + " pour la livraison offerte";
      }
    }
  }

  function render() {
    renderBadge();
    renderItems();
    renderTotals();
  }

  /* =====================================================================
     5. OPEN / CLOSE
     ===================================================================== */
  function open() {
    if (!els.cart) return;
    lastFocused = document.activeElement;
    els.cart.classList.add("is-open");
    els.cart.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    document.dispatchEvent(new CustomEvent("santebio:cart-open"));
    window.setTimeout(function () {
      var target = els.close || els.panel;
      if (target) target.focus();
    }, 260);
  }

  function close() {
    if (!els.cart) return;
    els.cart.classList.remove("is-open");
    els.cart.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  function toggle() {
    if (!els.cart) return;
    els.cart.classList.contains("is-open") ? close() : open();
  }

  /* =====================================================================
     6. WHATSAPP CHECKOUT
     ===================================================================== */
  function whatsappMessage() {
    var lines = detailed();
    var header = "Hello Santé Bio, I would like to order:";
    var rows = lines.map(function (line) {
      return "- " + line.product.name + " (x" + line.qty + ") — " + formatPrice(line.product.price * line.qty);
    });
    var footer = "Total: " + formatPrice(total());

    return header + "\n" + rows.join("\n") + "\n" + footer;
  }

  function checkout() {
    if (!count()) {
      toast("Votre panier est vide — ajoutez un produit d'abord.");
      return;
    }
    var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(whatsappMessage());
    window.open(url, "_blank", "noopener");
  }

  /* =====================================================================
     7. TOAST
     ===================================================================== */
  function toast(message) {
    if (!els.toasts) return;
    var node = document.createElement("div");
    node.className = "toast";
    node.innerHTML = '<span class="toast__ico">' + ICON.check + "</span><span>" + escapeHtml(message) + "</span>";
    els.toasts.appendChild(node);

    window.setTimeout(function () {
      node.classList.add("is-out");
      window.setTimeout(function () { node.remove(); }, 320);
    }, 2600);
  }

  /* =====================================================================
     8. MICRO-INTERACTIONS
     ===================================================================== */
  function bounceCart() {
    var btn = els.buttons[0];                // els.buttons is a NodeList
    if (!btn) return;
    btn.classList.remove("is-bouncing");
    void btn.offsetWidth;                    // restart the animation
    btn.classList.add("is-bouncing");
    if (els.badge) {
      els.badge.classList.remove("is-pulsing");
      void els.badge.offsetWidth;
      els.badge.classList.add("is-pulsing");
    }
  }

  /** Adds a product then plays the confirmation feedback. */
  function addWithFeedback(id, qty) {
    if (!add(id, qty)) return;
    var p = getProduct(id);
    bounceCart();
    toast((p ? p.name : "Produit") + " ajouté au panier");
  }

  /* =====================================================================
     9. ICONS + ESCAPING
     ===================================================================== */
  var ICON = {
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 12h14"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5.5 5.5L20 7"/></svg>'
  };

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* =====================================================================
     10. INIT
     ===================================================================== */
  function init() {
    els.cart = document.getElementById("cart");
    if (!els.cart) return;                    // page has no cart markup

    els.panel = els.cart.querySelector(".cart__panel");
    els.body = els.cart.querySelector(".cart__body");
    els.empty = els.cart.querySelector(".cart__empty");
    els.close = els.cart.querySelector(".cart__close");
    els.scrim = els.cart.querySelector(".cart__scrim");
    els.countLabel = els.cart.querySelector(".cart__count");
    els.subtotal = els.cart.querySelector("[data-cart-subtotal]");
    els.total = els.cart.querySelector("[data-cart-total]");
    els.waBtn = els.cart.querySelector("[data-cart-checkout]");
    els.freeShip = els.cart.querySelector("[data-cart-freeship]");

    els.buttons = Array.prototype.slice.call(document.querySelectorAll("[data-cart-open]"));
    els.badge = document.querySelector("[data-cart-badge]");
    els.toasts = document.querySelector(".toast-wrap");

    cart = load();
    render();

    // open the cart from any [data-cart-open] button (navbar, empty state, CTA…)
    els.buttons.forEach(function (btn) {
      btn.addEventListener("click", open);
    });

    // close: X button, scrim, Escape
    if (els.close) els.close.addEventListener("click", close);
    if (els.scrim) els.scrim.addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && els.cart.classList.contains("is-open")) close();
    });

    // qty + / - / remove (event delegation on the body)
    if (els.body) {
      els.body.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-act]");
        if (!btn) return;
        var item = btn.closest(".cart-item");
        if (!item) return;

        var id = item.getAttribute("data-id");
        var line = cart.find(function (l) { return l.id === id; });
        if (!line) return;

        if (btn.getAttribute("data-act") === "inc") {
          setQty(id, line.qty + 1);
        } else if (btn.getAttribute("data-act") === "dec") {
          setQty(id, line.qty - 1);
        } else if (btn.getAttribute("data-act") === "rm") {
          // animate the row out before actually removing it
          item.classList.add("is-leaving");
          window.setTimeout(function () { remove(id); }, 280);
        }
      });
    }

    // WhatsApp checkout
    if (els.waBtn) els.waBtn.addEventListener("click", checkout);

    // keep multiple tabs in sync
    window.addEventListener("storage", function (e) {
      if (e.key === STORAGE_KEY) {
        cart = load();
        render();
      }
    });
  }

  /* ---------- Public API ---------- */
  window.SanteBioCart = {
    add: addWithFeedback,
    setQty: setQty,
    remove: remove,
    clear: clear,
    open: open,
    close: close,
    toggle: toggle,
    checkout: checkout,
    count: count,
    total: total,
    whatsappNumber: WHATSAPP_NUMBER,
    whatsappDisplay: WHATSAPP_DISPLAY,
    toast: toast
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
