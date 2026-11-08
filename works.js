// Projects shown on the home page. Order here = order on the site.
//
// To add a project:
//   1. Put its folder into works/ (it must contain an index.html).
//   2. Add an entry below.
//
// Fields:
//   type   - "game" or "site": which block the card goes to
//   folder - path inside works/ to the folder with index.html
//   cover  - image inside that folder for the card (optional)
//   code   - link to the source code (optional, not shown on the site for now)

window.WORKS = [
  // ---------- Games ----------
  {
    type: "game",
    folder: "tower-defense",
    title: "Tower Defense",
    description: "Campaign of 10 maps with crossing roads and up to 3 entries, timed waves, flying and armored enemies, bosses, 5-level tower upgrades. Fixed-step simulation separated from rendering. Mouse, keyboard and touch.",
    tags: ["TypeScript", "PixiJS", "Vite"],
    cover: "cover.jpg",
    code: "https://github.com/TimofeyArkhipov/timofeyarkhipov.github.io/tree/main/sources/tower-defense"
  },
  {
    type: "game",
    folder: "tetris",
    title: "Tetris",
    description: "Classic Tetris with ghost piece, lock delay, 7-bag randomizer and low-latency Web Audio sound. Plays on desktop and touch screens.",
    tags: ["React", "Vite", "Web Audio"],
    cover: "cover.jpg"
  },
  {
    type: "game",
    folder: "herdsman",
    title: "Herdsman",
    description: "Lead the hero around the field, gather capybaras into a herd and bring them to the yard. Mouse or arrow keys.",
    tags: ["PixiJS", "JavaScript", "Vite"],
    cover: "cover.jpg"
  },
  {
    type: "game",
    folder: "domino",
    title: "Neon Domino",
    description: "HTML5 playable ad: a short neon-styled domino game packed into a single file for ad networks.",
    tags: ["PixiJS", "Playable ad", "HTML5"],
    cover: "cover.jpg"
  },

  // ---------- Websites ----------
  {
    type: "site",
    folder: "shopify-store",
    title: "Drift Store",
    description: "Headless Shopify store: static catalog, variant picker and a cart on the Storefront Cart API with checkout on Shopify.",
    tags: ["Next.js", "Shopify API", "GraphQL", "Tailwind"],
    cover: "cover.jpg",
    code: "https://github.com/TimofeyArkhipov/timofeyarkhipov.github.io/tree/main/sources/shopify-store"
  },
  {
    type: "site",
    folder: "nftking",
    title: "NFTKING",
    description: "Landing page for an NFT marketplace: hero with artwork stack, trending carousel, collections.",
    tags: ["Pug", "SCSS", "jQuery", "Slick"],
    cover: "cover.jpg"
  },
  {
    type: "site",
    folder: "looklie",
    title: "Looklie",
    description: "Dating landing with a sign-up form, validation, custom selects, user carousels and a payment page.",
    tags: ["Pug", "SCSS", "jQuery", "Slick"],
    cover: "cover.jpg"
  },
  {
    type: "site",
    folder: "rosa/docs",
    title: "The Rosa",
    description: "Responsive restaurant website: menu, reservation, shop and news sections.",
    tags: ["HTML", "SCSS", "Gulp"],
    cover: "cover.jpg"
  },
  {
    type: "site",
    folder: "jadwalin",
    title: "Jadwalin",
    description: "Pricing page for a SaaS automation service with a monthly / yearly plan switch.",
    tags: ["HTML", "CSS", "jQuery"],
    cover: "cover.jpg"
  },
  {
    type: "site",
    folder: "clickspin",
    title: "ClickSpin",
    description: "Crypto casino promo page with a deposit bonus offer and a registration modal.",
    tags: ["HTML", "SCSS", "JavaScript"],
    cover: "cover.jpg"
  },
  {
    type: "site",
    folder: "wheel-girls",
    title: "Spin the Wheel",
    description: "Bonus landing with a prize wheel and particle effects.",
    tags: ["HTML", "CSS", "JavaScript", "particles.js"],
    cover: "cover.jpg"
  },
  {
    type: "site",
    folder: "archer-and-chips",
    title: "Free Spins",
    description: "Step-by-step bonus landing with parallax layers and particle effects.",
    tags: ["Pug", "SCSS", "Parallax", "particles.js"],
    cover: "cover.jpg"
  },
  {
    type: "site",
    folder: "cats",
    title: "Hot Bonus",
    description: "Animated casino welcome-bonus landing.",
    tags: ["HTML", "CSS", "JavaScript"],
    cover: "cover.jpg"
  },
  {
    type: "site",
    folder: "euro-bonus",
    title: "€30 Bonus",
    description: "Sports betting bonus landing with a masked phone input and a scrollable rules popup.",
    tags: ["HTML", "CSS", "IMask", "SimpleBar"],
    cover: "cover.jpg"
  },
  {
    type: "site",
    folder: "aviator",
    title: "Aviator",
    description: "Promo landing for a crash game, in Russian.",
    tags: ["HTML", "CSS", "JavaScript"],
    cover: "cover.jpg"
  }
];
