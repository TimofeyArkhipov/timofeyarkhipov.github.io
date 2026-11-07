// Projects shown on the home page. Order here = order on the site.
//
// To add a project:
//   1. Put its folder into works/ (it must contain an index.html).
//   2. Add an entry below. "folder" is the folder name.
//
// Optional fields:
//   cover — an image inside the project folder used as the card picture,
//           e.g. "cover.png". Without it the card gets a generated pixel picture.
//   code  — link to the source code (GitHub, itch.io, etc.).

window.WORKS = [
  {
    folder: "pixel-platformer",
    title: "Lighthouse Keeper",
    year: "2026",
    description: "Example: a small pixel-art platformer about keeping the light on during a storm.",
    tags: ["Godot", "GDScript", "Pixel art"],
    code: "https://github.com/your-login/lighthouse-keeper"
  },
  {
    folder: "browser-game",
    title: "Tram Rush",
    year: "2025",
    description: "Example: an endless runner that plays in the browser.",
    tags: ["JavaScript", "Canvas", "Phaser"]
  },
  {
    folder: "react-app",
    title: "Recipe Finder",
    year: "2023",
    description: "Example: a React app from my frontend days, with search and filters.",
    tags: ["React", "TypeScript", "CSS"]
  }
];
