/* =============================================================================
   SANTÉ BIO — Product catalogue
   -----------------------------------------------------------------------------
   Single source of truth for every product used across the site.
   To update the shop later, just edit this array — the homepage featured grid,
   the shop page grid, the category filters and the cart all read from here.

   Field reference
   -----------------------------------------------------------------------------
   id        : unique string, used as the localStorage key
   name      : product name shown on cards and in the WhatsApp order recap
   cat       : category id — MUST match one of CATEGORIES below
   price     : price in MAD (dirham)
   oldPrice  : optional "was" price, shows a strikethrough when present
   img       : image URL (Unsplash placeholder — replace with real product shots)
   tag       : optional ribbon. "hot" renders citrus, anything else renders dark
   rating    : average customer rating (0–5)
   reviews   : number of customer reviews
   size      : pack/format shown under the name
   desc      : one-line description
   featured  : true → included in the homepage "Bestsellers" grid
   ========================================================================== */

/* Unsplash placeholders tuned for a clean, green-and-citrus cosmetic look. */
const IMG = {
  serum:   "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=70",
  oil:     "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=70",
  coco:    "https://images.unsplash.com/photo-1608571423539-e951a51c1c6c?auto=format&fit=crop&w=800&q=70",
  cream:   "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=800&q=70",
  bottle:  "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=70",
  drop:    "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=800&q=70",
  jar:     "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=70",
  shampoo: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?auto=format&fit=crop&w=800&q=70",
  shower:  "https://images.unsplash.com/photo-1607006344380-b6775a0824a7?auto=format&fit=crop&w=800&q=70",
  kids:    "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=800&q=70",
  lab:     "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=70",
  towel:   "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=70",
  citrus:  "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=70",
  hands:   "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=800&q=70",
  water:   "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=70"
};

/* Category list — drives the shop filters, the homepage cards and the counts. */
const CATEGORIES = [
  {
    id: "face", name: "Face & Anti-Aging", short: "Visage",
    desc: "Retinol, collagen & vitamin C routines for visibly younger skin.",
    img: IMG.serum, icon: "sparkle"
  },
  {
    id: "hair", name: "Hair Care", short: "Cheveux",
    desc: "Shampoings antivitaminiques and repair formulas for strong hair.",
    img: IMG.shampoo, icon: "droplet"
  },
  {
    id: "body", name: "Body Care", short: "Corps",
    desc: "Douches, gels et crèmes hydratantes pour toute la famille.",
    img: IMG.shower, icon: "leaf"
  },
  {
    id: "family", name: "Baby & Family Care", short: "Famille",
    desc: "Treatments targeting lice, gentle protection for the whole home.",
    img: IMG.kids, icon: "shield"
  },
  {
    id: "oils", name: "Natural Oils", short: "Huiles",
    desc: "100% natural cold-pressed oils, pressed in Morocco.",
    img: IMG.coco, icon: "sun"
  }
];

const PRODUCTS = [
  /* ---- Face & Anti-Aging ---- */
  {
    id: "serum-retinol-collagen",
    name: "Sérum Retinol & Collagène",
    cat: "face",
    price: 349, oldPrice: 420,
    img: IMG.serum, tag: "hot",
    rating: 4.9, reviews: 1284, size: "30 ml",
    desc: "Rituel anti-âge intensif : rides atténuées et peau repulpée en 4 semaines.",
    featured: true
  },
  {
    id: "creme-anti-age",
    name: "Crème Anti-Âge Vitamine C",
    cat: "face",
    price: 299, oldPrice: null,
    img: IMG.cream, tag: "new",
    rating: 4.8, reviews: 742, size: "50 ml",
    desc: "Éclat immédiat et protection antinciburnies grâce à la vitamine C stabilisée.",
    featured: false
  },
  {
    id: "huile-visage-nuit",
    name: "Huile Visage Nuit Nutritive",
    cat: "face",
    price: 259, oldPrice: null,
    img: IMG.oil, tag: null,
    rating: 4.7, reviews: 516, size: "30 ml",
    desc: "Nutrition profonde pendant la nuit, sans effet gras au réveil.",
    featured: false
  },
  {
    id: "serum-vitamine-c",
    name: "Sérum Vitamine C 15%",
    cat: "face",
    price: 279, oldPrice: 330,
    img: IMG.drop, tag: null,
    rating: 4.8, reviews: 908, size: "30 ml",
    desc: "Unifie le teint et stimule le renouvellement cellulaire.",
    featured: false
  },
  {
    id: "masque-argile-vert",
    name: "Masque Argile Verte Purifiante",
    cat: "face",
    price: 149, oldPrice: null,
    img: IMG.jar, tag: null,
    rating: 4.6, reviews: 331, size: "75 ml",
    desc: "Absorbe les impuretés et resserre les pores en une séance.",
    featured: false
  },

  /* ---- Hair Care ---- */
  {
    id: "shampooing-anti-chute",
    name: "Shampooing Anti-Chute & Fortifiant",
    cat: "hair",
    price: 189, oldPrice: 229,
    img: IMG.shampoo, tag: "hot",
    rating: 4.8, reviews: 1543, size: "250 ml",
    desc: "Caféine, biotine et vitamines : limite la chute et densifie la cheveu.",
    featured: true
  },
  {
    id: "shampooing-enfant",
    name: "Shampooing Doux Enfant & Bébé",
    cat: "hair",
    price: 139, oldPrice: null,
    img: IMG.kids, tag: null,
    rating: 4.9, reviews: 876, size: "250 ml",
    desc: "Formule sans sulfates ni larmes, dès le premier souffle.",
    featured: false
  },
  {
    id: "masque-capillaire-keratine",
    name: "Masque Capillaire Kératine",
    cat: "hair",
    price: 229, oldPrice: null,
    img: IMG.cream, tag: "new",
    rating: 4.7, reviews: 402, size: "250 ml",
    desc: "Démêlage, reconstruit et brille sans alourdir la racines.",
    featured: false
  },
  {
    id: "huile-argan-cheveux",
    name: "Huile d'Argan Cheveux & Barbe",
    cat: "hair",
    price: 169, oldPrice: null,
    img: IMG.oil, tag: null,
    rating: 4.9, reviews: 689, size: "100 ml",
    desc: "Huile d'argan pressée à froid, fini satiné et sourire net.",
    featured: false
  },

  /* ---- Body Care ---- */
  {
    id: "gel-douche-citron",
    name: "Gel Douche Citron Vert Fraîcheur",
    cat: "body",
    price: 119, oldPrice: 149,
    img: IMG.citrus, tag: "hot",
    rating: 4.8, reviews: 1874, size: "400 ml",
    desc: "Gel lavant vegan, sillage agrume frais et peau douce sans film gras.",
    featured: true
  },
  {
    id: "gel-douche-famille",
    name: "Gel Douche Hydratant Famille",
    cat: "body",
    price: 129, oldPrice: null,
    img: IMG.shower, tag: null,
    rating: 4.7, reviews: 812, size: "400 ml",
    desc: "Un seul flacon pour toute la maison, peau sensible respectée.",
    featured: false
  },
  {
    id: "creme-corps-vitamine-e",
    name: "Crème Corps Vitamine E",
    cat: "body",
    price: 199, oldPrice: null,
    img: IMG.bottle, tag: null,
    rating: 4.7, reviews: 528, size: "250 ml",
    desc: "Nourrit les peaux sèches et marque un Glow immédiat.",
    featured: false
  },
  {
    id: "vaseline-fortifiante",
    name: "Vaseline Fortifiante 4 Grains",
    cat: "body",
    price: 79, oldPrice: 99,
    img: IMG.jar, tag: "hot",
    rating: 4.9, reviews: 2140, size: "100 g",
    desc: "Le chouchou des petites mains : sèche les mains, les lèvres et les zones sèches.",
    featured: true
  },
  {
    id: "gommage-citron",
    name: "Gommage Corps Citron & Sucre Roux",
    cat: "body",
    price: 149, oldPrice: null,
    img: IMG.citrus, tag: null,
    rating: 4.6, reviews: 297, size: "200 g",
    desc: "Exfolie en douceur et ravive l'éclat de la peau.",
    featured: false
  },

  /* ---- Baby & Family Care ---- */
  {
    id: "anti-poux-shampooing",
    name: "Shampooing Anti-Poux & Lentes 2 en 1",
    cat: "family",
    price: 159, oldPrice: 199,
    img: IMG.towel, tag: "hot",
    rating: 4.9, reviews: 3016, size: "200 ml",
    desc: "Élimine poux et lentes en 3 applications, sans insecticide chimique.",
    featured: true
  },
  {
    id: "spray-anti-poux",
    name: "Spray Anti-Poux Traitement Complet",
    cat: "family",
    price: 139, oldPrice: null,
    img: IMG.drop, tag: null,
    rating: 4.8, reviews: 1622, size: "150 ml",
    desc: "Formule unique lavable + invisible : le duo gagnant contre les poux.",
    featured: false
  },
  {
    id: "lait-nettoyant-bebe",
    name: "Lait Nettoyant Bébé Dermo-Apaisant",
    cat: "family",
    price: 129, oldPrice: null,
    img: IMG.bottle, tag: "new",
    rating: 4.9, reviews: 744, size: "300 ml",
    desc: "Sans parfum, pH respecté : lavages quotidiens sans rougeurs.",
    featured: false
  },
  {
    id: "gel-anti-moustiques",
    name: "Gel Anti-Moustiques Famille",
    cat: "family",
    price: 99, oldPrice: null,
    img: IMG.citrus, tag: null,
    rating: 4.6, reviews: 458, size: "100 ml",
    desc: "Protection douce pour les pijamas d'été et les soirées en terrasse.",
    featured: false
  },

  /* ---- Natural Oils ---- */
  {
    id: "huile-coco-100",
    name: "Huile de Coco 100% Naturelle",
    cat: "oils",
    price: 89, oldPrice: 119,
    img: IMG.coco, tag: "hot",
    rating: 5.0, reviews: 2607, size: "200 ml",
    desc: "Extra vierge, pressée à froid. Cheveux, peau, lips et cuisine.",
    featured: true
  },
  {
    id: "huile-argan-premium",
    name: "Huile d'Argan Premium Food Grade",
    cat: "oils",
    price: 149, oldPrice: null,
    img: IMG.oil, tag: "new",
    rating: 4.9, reviews: 1187, size: "100 ml",
    desc: "Coopérative de femmes de Taroudant, lot tracé et certifié.",
    featured: false
  },
  {
    id: "huile-noix-de-coco",
    name: "Huile de Noix de Coco Vierge",
    cat: "oils",
    price: 179, oldPrice: null,
    img: IMG.coco, tag: null,
    rating: 4.8, reviews: 386, size: "250 ml",
    desc: "Pour la cuisine et les soins intensifs du soir.",
    featured: false
  }
];

/* ---------- Helpers shared by every page ---------- */
const CATEGORIES_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

/** Returns a product by id, or undefined. */
function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}

/** Returns products flagged as `featured` (bestsellers). */
function getFeatured() {
  return PRODUCTS.filter((p) => p.featured);
}

/** Returns products of one category, or every product when catId is "all". */
function getByCategory(catId) {
  return catId === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.cat === catId);
}

/** Price formatted the Moroccan way: 1 234 DH. */
function formatPrice(value) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " DH";
}
