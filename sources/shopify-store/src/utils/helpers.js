const formatters = {}

export function money(amount, currency = 'USD') {
  if (!formatters[currency]) {
    formatters[currency] = new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 })
  }
  return formatters[currency].format(amount)
}

// Shopify CDN resizes images by the width parameter
export function sized(url, width) {
  if (!url) return url
  return url + (url.includes('?') ? '&' : '?') + 'width=' + width
}
