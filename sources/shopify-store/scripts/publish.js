// Copies the static export (out/) into the portfolio: works/shopify-store
const fs = require('fs')
const path = require('path')

const from = path.join(__dirname, '..', 'out')
const to = path.join(__dirname, '..', '..', '..', 'works', 'shopify-store')

// cover.jpg is the portfolio card image, it is not part of the build
const cover = path.join(to, 'cover.jpg')
const keep = fs.existsSync(cover) ? fs.readFileSync(cover) : null

fs.rmSync(to, { recursive: true, force: true })
fs.cpSync(from, to, { recursive: true })
if (keep) fs.writeFileSync(cover, keep)

console.log('Published to', to)
