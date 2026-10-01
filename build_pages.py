#!/usr/bin/env python3
"""
build_pages.py — regenerates about.html, shop.html and contact.html.

The header, mobile drawer, footer and cart markup is taken straight out of
index.html, so the shared chrome can never drift between pages. Only the
<title>/<meta description> and the <main> content differ per page.

Usage (from this folder):   python3 build_pages.py
"""
import re, io, os

os.chdir(os.path.dirname(os.path.abspath(__file__)))
SRC = open('index.html', encoding='utf-8').read().split('\n')

# --- carve index.html into its reusable parts -----------------------------
def block(start_marker, end_marker):
    """Lines between the two markers (exclusive), taken from index.html."""
    a = next(i for i, l in enumerate(SRC) if start_marker in l)
    b = next(i for i, l in enumerate(SRC) if i > a and end_marker in l)
    return SRC[a:b]

CHROME     = block('<a class="skip-link"', '<main id="main">')         # skip-link .. drawer
FOOT       = block('<!-- ===================== FOOTER', '<script src="products.js">')
HEAD_OPEN  = SRC[0:3]                                                  # doctype, <html>, <head>
SCRIPTS    = block('<script src="products.js">', '<script>')

NAV = [("index.html", "Home"), ("about.html", "About"),
       ("shop.html", "Shop"), ("contact.html", "Contact")]

ARROW = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
         'stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>')


def chrome_for(current):
    """Rewrites aria-current in both the desktop nav and the mobile drawer."""
    out = []
    for line in CHROME:
        for href, label in NAV:
            if f'href="{href}"' in line:
                if href == current:
                    line = line.replace(f'href="{href}"', f'href="{href}" aria-current="page"')
                else:
                    line = re.sub(r'\s*aria-current="page"', '', line)
        out.append(line)
    return out


def head_for(title, desc):
    return HEAD_OPEN + [
        f'  <title>{title}</title>',
        f'  <meta name="description" content="{desc}">',
        '  <meta name="viewport" content="width=device-width, initial-scale=1">',
        '  <meta name="theme-color" content="#16a06b">',
        '  <link rel="preconnect" href="https://fonts.googleapis.com">',
        '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
        '  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">',
        '  <link rel="stylesheet" href="style.css">',
        "  <link rel=\"icon\" href=\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='9' fill='%2316a06b'/><circle cx='24' cy='8' r='5' fill='%23ff9f43'/><path d='M16 8c5 4 5 10 0 16-5-6-5-12 0-16z' fill='white'/></svg>\">",
        '</head>',
        '<body class="page-fade">',
        '',
    ]


def page(current, title, desc, main, extra_scripts=()):
    buf = io.StringIO()
    buf.write('\n'.join(head_for(title, desc)))
    buf.write('\n'.join(chrome_for(current)))
    buf.write('  <main id="main">\n')
    buf.write(main.strip('\n'))
    buf.write('\n  </main>\n\n')
    buf.write('\n'.join(FOOT))
    buf.write('\n')
    buf.write('\n'.join(SCRIPTS))
    buf.write('\n')
    for s in extra_scripts:
        buf.write('  <script>\n' + s.strip('\n') + '\n  </script>\n')
    buf.write('</body>\n</html>\n')
    return buf.getvalue()


CRUMB = ('<nav class="crumbs" aria-label="Breadcrumb">'
         '<a href="index.html">Home</a>' + ARROW +
         '<span aria-current="page">{name}</span></nav>')

WA_ICON = ('<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.7 15L2 '
           '22l5.2-1.3A10 10 0 1 0 12 2zm5.3 14c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .1-1.6-.1-.4-.1-.9'
           '-.3-1.5-.6-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1-1.4-1-2.6 0-1.3.6-1.9.9-2.1.2-.3.5-.3'
           '.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.5-.3.3c-.1.1-.2.3 0 .5.1.3.6 '
           '1.1 1.4 1.8 1 .9 1.8 1.1 2 1.2.3.1.4.1.6-.1l.8-1c.2-.2.4-.2.6-.1l2 1c.2.1.4'
           '.2.4.3.1.2.1.6-.1 1.1z"/></svg>')

# =========================================================================
# ABOUT
# =========================================================================
ABOUT_MAIN = f'''
    <section class="page-hero">
      <span class="orb orb--a" aria-hidden="true"></span>
      {CRUMB.format(name="About")}
      <h1>A Moroccan laboratory built on <span style="color:var(--green-600)">trust</span></h1>
      <p>Santé Bio is a natural health and cosmetics laboratory founded in Morocco. We formulate, manufacture and certify cosmetic products to international standards, then distribute them through the pharmacy network that families already trust.</p>
    </section>

    <!-- Story -->
    <section class="section">
      <div class="container split">
        <div class="split__media reveal reveal--left">
          <div class="split__img" style="background-image:url('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&amp;fit=crop&amp;w=1000&amp;q=70')"></div>
          <div class="split__float">
            <span class="badge-iso__seal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7.5 3v5.4c0 4.6-3.1 8.5-7.5 9.6-4.4-1.1-7.5-5-7.5-9.6V6z"/><path d="M9 12l2.2 2.2L15.5 10"/></svg>
            </span>
            <span><b>ISO 22716</b><span>Certified since day one</span></span>
          </div>
        </div>

        <div class="reveal reveal--right">
          <span class="eyebrow">Our story</span>
          <h2>We didn't want a shop. We wanted a standard.</h2>
          <p>Santé Bio started with a simple frustration: too many cosmetic products on Moroccan shelves made beautiful promises on the front and skipped the science on the back. So we built a laboratory instead of a storefront.</p>
          <p>Today we develop shower gels, shampoos, vitamin packs, facial oils, vaseline, a retinol &amp; collagen anti-aging line, anti-lice treatments and cold-pressed natural oils — each one formulated, tested and released under <strong>ISO 22716</strong>, the international cosmetic Good Manufacturing Practice standard.</p>
          <p>Our products reach you the way they should: through <strong>pharmacies and parapharmacies in every region of Morocco</strong>, where a qualified advisor can guide you. And when you'd rather not travel, you order the same products from this site and we deliver to your door.</p>
          <div class="hero__cta" style="justify-content:flex-start;margin-top:26px">
            <a class="btn" href="shop.html">Explore our products</a>
            <a class="btn btn--ghost" href="contact.html">Talk to us</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Values -->
    <section class="section section--mint" id="values">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow">Our values</span>
          <h2>Four things we never compromise on</h2>
          <p>Every formulation decision comes back to these four words. They're printed on our lab wall, and they decide what makes it into your bathroom cabinet.</p>
        </div>

        <div class="why-grid">
          <article class="value-card reveal">
            <span class="value-card__n">01</span>
            <h3>Certification</h3>
            <p>Our factory is audited against ISO 22716. Each batch carries a traceability record, and we release nothing that hasn't passed stability and safety testing.</p>
          </article>
          <article class="value-card reveal" style="--d:80ms">
            <span class="value-card__n">02</span>
            <h3>Naturalness</h3>
            <p>Botanical extracts, cold-pressed oils and actives dosed at levels that actually work. If an ingredient doesn't earn its place, it doesn't go in the formula.</p>
          </article>
          <article class="value-card reveal" style="--d:160ms">
            <span class="value-card__n">03</span>
            <h3>Accessibility</h3>
            <p>Certified quality shouldn't be a luxury. We keep prices honest and put our products in pharmacies across the country, not in one flagship store.</p>
          </article>
          <article class="value-card reveal" style="--d:240ms">
            <span class="value-card__n">04</span>
            <h3>Trust</h3>
            <p>We'd rather earn a recommendation than buy an advert. Our community of 75,000+ followers tells us the truth, and we listen to every comment.</p>
          </article>
        </div>
      </div>
    </section>

    <!-- Gallery -->
    <section class="section">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow">Inside the lab</span>
          <h2>From formulation to pharmacy shelf</h2>
          <p>A glimpse at the rooms, rituals and standards behind every Santé Bio bottle.</p>
        </div>

        <div class="gallery">
          <figure class="gallery__item reveal" style="background-image:url('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&amp;fit=crop&amp;w=700&amp;q=70')">
            <figcaption>Formulation lab</figcaption>
          </figure>
          <figure class="gallery__item reveal" style="--d:70ms;background-image:url('https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&amp;fit=crop&amp;w=700&amp;q=70')">
            <figcaption>Batch testing</figcaption>
          </figure>
          <figure class="gallery__item reveal" style="--d:140ms;background-image:url('https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&amp;fit=crop&amp;w=700&amp;q=70')">
            <figcaption>Cold-pressed oils</figcaption>
          </figure>
          <figure class="gallery__item reveal" style="--d:210ms;background-image:url('https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&amp;fit=crop&amp;w=700&amp;q=70')">
            <figcaption>Anti-aging range</figcaption>
          </figure>
        </div>
      </div>
    </section>

    <!-- Timeline -->
    <section class="section section--mint">
      <div class="container split">
        <div class="reveal reveal--left">
          <span class="eyebrow">Our journey</span>
          <h2>Built step by step, region by region</h2>
          <p>Twelve years of building a Moroccan natural health brand, one formulation and one pharmacy at a time.</p>
          <div class="hero__cta" style="justify-content:flex-start;margin-top:26px">
            <a class="btn btn--citrus" href="index.html#where">Where to find us</a>
          </div>
        </div>

        <div class="timeline reveal reveal--right">
          <div class="timeline__item">
            <div class="timeline__year">2014</div>
            <h4>The laboratory opens</h4>
            <p>A small formulation unit in Casablanca, with one obsession: make a shower gel that a pharmacist would recommend without hesitating.</p>
          </div>
          <div class="timeline__item">
            <div class="timeline__year">2017</div>
            <h4>ISO 22716 certification</h4>
            <p>Our facility passes the international cosmetic GMP audit. Every batch becomes traceable from raw material to finished product.</p>
          </div>
          <div class="timeline__item">
            <div class="timeline__year">2020</div>
            <h4>Into the pharmacy network</h4>
            <p>Distribution begins across pharmacies and parapharmacies, from Casablanca to Agadir. The retinol &amp; collagen line launches the same year.</p>
          </div>
          <div class="timeline__item">
            <div class="timeline__year">2023</div>
            <h4>A community of 75,000+</h4>
            <p>Our social following becomes a real community: product advice, routines and honest reviews, shared between Moroccan families.</p>
          </div>
          <div class="timeline__item">
            <div class="timeline__year">Today</div>
            <h4>Over 1,200 partner pharmacies</h4>
            <p>And direct WhatsApp ordering for anyone who'd rather have the range delivered to their door.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="section section--tight">
      <div class="container">
        <div class="stats">
          <div class="stat reveal"><div class="stat__num"><span data-count="12">0</span>+</div><div class="stat__lbl">Years active</div></div>
          <div class="stat reveal" style="--d:80ms"><div class="stat__num"><span data-count="22">0</span></div><div class="stat__lbl">Products in the range</div></div>
          <div class="stat reveal" style="--d:160ms"><div class="stat__num"><span data-count="1200">0</span>+</div><div class="stat__lbl">Partner pharmacies</div></div>
          <div class="stat reveal" style="--d:240ms"><div class="stat__num"><span data-count="75">0</span>K+</div><div class="stat__lbl">Families following us</div></div>
        </div>
      </div>
    </section>

    <section class="section section--tight">
      <div class="container">
        <div class="cta-band reveal">
          <span class="eyebrow eyebrow--onDark">Try it yourself</span>
          <h2>Certified formulas, in pharmacies near you</h2>
          <p>Order the range on this site and we'll deliver it anywhere in Morocco, or walk into your local pharmacy and ask for Santé Bio.</p>
          <div class="hero__cta">
            <a class="btn btn--citrus" href="shop.html">Shop all products</a>
            <a class="btn btn--ghost" href="contact.html" style="--btn-fg:#fff;border-color:rgba(255,255,255,.4)">Contact us</a>
          </div>
        </div>
      </div>
    </section>
'''

# =========================================================================
# SHOP
# =========================================================================
SHOP_MAIN = f'''
    <section class="page-hero">
      <span class="orb orb--a" aria-hidden="true"></span>
      {CRUMB.format(name="Shop")}
      <h1>The full <span style="color:var(--green-600)">Santé Bio</span> range</h1>
      <p>Every product is ISO 22716 certified and available in pharmacies and parapharmacies across Morocco. Add what you need to your cart, then send your order straight to our WhatsApp.</p>
    </section>

    <!-- Search + filters (sticky under the header) -->
    <div class="toolbar">
      <div class="container toolbar__inner">
        <div class="search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/></svg>
          <label class="sr-only" for="shop-search">Search products</label>
          <input id="shop-search" type="search" data-search placeholder="Search a product… (e.g. retinol, shampoo)" autocomplete="off">
          <button class="search__clear" type="button" data-search-clear aria-label="Clear search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>

        <div class="filters" role="group" aria-label="Filter by category">
          <button class="filter is-active" type="button" data-filter="all" aria-pressed="true">All <span class="filter__n"></span></button>
          <button class="filter" type="button" data-filter="face" aria-pressed="false">Face &amp; Anti-Aging <span class="filter__n"></span></button>
          <button class="filter" type="button" data-filter="hair" aria-pressed="false">Hair Care <span class="filter__n"></span></button>
          <button class="filter" type="button" data-filter="body" aria-pressed="false">Body Care <span class="filter__n"></span></button>
          <button class="filter" type="button" data-filter="family" aria-pressed="false">Baby &amp; Family <span class="filter__n"></span></button>
          <button class="filter" type="button" data-filter="oils" aria-pressed="false">Natural Oils <span class="filter__n"></span></button>
        </div>
      </div>
    </div>

    <section class="section">
      <div class="container">
        <div class="result-line">
          <span><strong data-result-count>0</strong> products</span>
          <span class="nowrap">Free delivery over 500 DH</span>
        </div>

        <div class="product-grid" id="shop-grid"><!-- rendered by script.js --></div>

        <div class="wa-card mt-lg reveal" style="max-width:620px;margin-inline:auto;text-align:center">
          <h4>Prefer to order in person?</h4>
          <p>Santé Bio is available in pharmacies and parapharmacies in every region of Morocco. Ask for the range by name, or send us your order here and we'll deliver.</p>
          <a class="btn btn--wa" href="https://wa.me/212637553637?text=Hello%20Sant%C3%A9%20Bio%2C%20je%20souhaite%20passer%20une%20commande." target="_blank" rel="noopener">
            {WA_ICON} 06 37 55 36 37
          </a>
        </div>
      </div>
    </section>
'''

SHOP_SCRIPTS = []   # URL deep-link (?cat=) is handled inside script.js

# =========================================================================
# CONTACT
# =========================================================================
CONTACT_MAIN = f'''
    <section class="page-hero">
      <span class="orb orb--a" aria-hidden="true"></span>
      {CRUMB.format(name="Contact")}
      <h1>Let's talk <span style="color:var(--green-600)">naturel</span></h1>
      <p>Questions about a formula, a partnership with your pharmacy, or an order? Reach us on WhatsApp, by phone or through the form below — we answer every message.</p>
    </section>

    <section class="section">
      <div class="container contact-grid">

        <!-- Form + info -->
        <div>
          <div class="form-card reveal reveal--left">
            <div class="form-success" id="form-success" role="status">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.6 2.6L16 9.5"/></svg>
              <span>Thank you! Your message has been recorded. Our team usually replies within 24 hours — or message us on WhatsApp for a faster answer.</span>
            </div>

            <h2 style="font-size:clamp(1.4rem,4vw,1.9rem)">Send us a message</h2>
            <p style="font-size:.92rem">For product advice, pharmacy partnerships or general enquiries.</p>

            <form id="contact-form" novalidate>
              <div class="field--row field">
                <div>
                  <label for="name">Full name</label>
                  <input id="name" name="name" type="text" placeholder="Your name" required autocomplete="name">
                </div>
                <div>
                  <label for="phone">Phone / WhatsApp</label>
                  <input id="phone" name="phone" type="tel" placeholder="06 XX XX XX XX" required autocomplete="tel">
                </div>
              </div>

              <div class="field--row field">
                <div>
                  <label for="email">Email</label>
                  <input id="email" name="email" type="email" placeholder="you@example.com" required autocomplete="email">
                </div>
                <div>
                  <label for="subject">Subject</label>
                  <select id="subject" name="subject">
                    <option>Product advice</option>
                    <option>Place an order</option>
                    <option>Pharmacy partnership</option>
                    <option>Press &amp; collaboration</option>
                    <option>Something else</option>
                  </select>
                </div>
              </div>

              <div class="field">
                <label for="message">Message</label>
                <textarea id="message" name="message" placeholder="How can we help you?" required></textarea>
              </div>

              <button class="btn btn--block" type="submit">
                Send message
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3L10.5 13.5M21 3l-6.8 18-3.7-7.5L3 9.8z"/></svg>
              </button>

              <p class="form-note">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7.5 3v5.4c0 4.6-3.1 8.5-7.5 9.6-4.4-1.1-7.5-5-7.5-9.6V6z"/></svg>
                This demo form doesn't send anything yet — for a fast answer, message us on WhatsApp at 06 37 55 36 37.
              </p>
            </form>
          </div>
        </div>

        <!-- Info column -->
        <div class="reveal reveal--right">
          <div class="info-list">
            <div class="info-item info-item--wa">
              <span class="info-item__ico">{WA_ICON}</span>
              <div>
                <h4>WhatsApp &amp; phone</h4>
                <a href="https://wa.me/212637553637" target="_blank" rel="noopener">06 37 55 36 37</a>
                <p style="margin-top:2px">Monday to Saturday, 9:00 – 20:00</p>
              </div>
            </div>

            <div class="info-item">
              <span class="info-item__ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 6.5L12 13l8.5-6.5"/></svg>
              </span>
              <div>
                <h4>Email</h4>
                <a href="mailto:contact@santebiomaroc.ma">contact@santebiomaroc.ma</a>
                <p style="margin-top:2px">Press &amp; partnership enquiries welcome</p>
              </div>
            </div>

            <div class="info-item info-item--citrus">
              <span class="info-item__ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L5 4h14l2 5.5M5 9.5V20h14V9.5M9 20v-6h6v6"/></svg>
              </span>
              <div>
                <h4>Available in pharmacies</h4>
                <p>Find the Santé Bio range in pharmacies and parapharmacies across Morocco — in every region, on the shelf next to the products you trust.</p>
              </div>
            </div>

            <div class="info-item">
              <span class="info-item__ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/></svg>
              </span>
              <div>
                <h4>Morocco — nationwide</h4>
                <p>Laboratory and distribution network based in Morocco, serving customers in all twelve regions.</p>
              </div>
            </div>
          </div>

          <div style="margin-top:22px">
            <h4 style="font-family:var(--font-title);font-size:.95rem;margin-bottom:12px">Follow the community</h4>
            <div class="socials">
              <a class="social social--ig" href="https://instagram.com/santebiomaroc" target="_blank" rel="noopener" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></svg>
              </a>
              <a class="social social--fb" href="https://facebook.com/santebiomaroc" target="_blank" rel="noopener" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.63A22 22 0 0 0 14.3 3.5c-2.4 0-4 1.46-4 4.14V9.9H7.6V13h2.7v8z"/></svg>
              </a>
              <a class="social social--wa" href="https://wa.me/212637553637" target="_blank" rel="noopener" aria-label="WhatsApp">{WA_ICON}</a>
              <a class="social social--tk" href="https://tiktok.com/@santebiomaroc" target="_blank" rel="noopener" aria-label="TikTok">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3h-2.6v11.4a2.4 2.4 0 1 1-1.9-2.36V9.4a5.2 5.2 0 1 0 4.5 5.16V8.6a6 6 0 0 0 3.4 1.06V7.1a3.6 3.6 0 0 1-3.4-3.5z"/></svg>
              </a>
            </div>
            <p style="font-size:.86rem;margin-top:12px">Over 75,000 followers on Instagram — daily routines, honest reviews and product tips.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Map -->
    <section class="section section--tight section--mint">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow">Nationwide</span>
          <h2>From our lab to your region</h2>
          <p>Santé Bio is distributed across the whole Kingdom — you don't need to travel to find us, and you can order delivery wherever you are.</p>
        </div>

        <div class="map-frame reveal">
          <iframe
            title="Map of Morocco — Santé Bio distribution network"
            src="https://www.google.com/maps?q=Morocco&amp;z=6&amp;output=embed"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allowfullscreen></iframe>
        </div>
      </div>
    </section>

    <section class="section section--tight">
      <div class="container">
        <div class="cta-band reveal">
          <span class="eyebrow eyebrow--onDark">Quickest answer</span>
          <h2>Order on WhatsApp in 30 seconds</h2>
          <p>Add your products to the cart, send us the order and we'll deliver anywhere in Morocco — or pick them up in your local pharmacy.</p>
          <div class="hero__cta">
            <a class="btn btn--wa" href="https://wa.me/212637553637?text=Hello%20Sant%C3%A9%20Bio%2C%20je%20souhaite%20passer%20une%20commande." target="_blank" rel="noopener">{WA_ICON} 06 37 55 36 37</a>
            <a class="btn btn--ghost" href="shop.html" style="--btn-fg:#fff;border-color:rgba(255,255,255,.4)">Go to the shop</a>
          </div>
        </div>
      </div>
    </section>
'''

# =========================================================================
open('about.html', 'w').write(page(
    'about.html',
    'About | Santé Bio — Laboratoire de Santé Naturelle au Maroc',
    'The story of Santé Bio, a Moroccan natural health and cosmetics laboratory, ISO 22716 certified, with values of certification, naturalness, accessibility and trust.',
    ABOUT_MAIN))

open('shop.html', 'w').write(page(
    'shop.html',
    'Shop | Santé Bio — ISO 22716 Certified Natural Health Products',
    'Shop the full Santé Bio range: retinol &amp; collagen anti-aging care, shampoos, body care, anti-lice treatments and 100% natural oils. Available in pharmacies across Morocco.',
    SHOP_MAIN, SHOP_SCRIPTS))

open('contact.html', 'w').write(page(
    'contact.html',
    'Contact | Santé Bio — Commandez sur WhatsApp 06 37 55 36 37',
    'Contact Santé Bio: WhatsApp 06 37 55 36 37, order delivery anywhere in Morocco, and find our products in pharmacies and parapharmacies nationwide.',
    CONTACT_MAIN))

print("built about.html, shop.html, contact.html")
