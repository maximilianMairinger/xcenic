const sanitizePath = require("sanitize-filename")
const pth = require("path")


const stats = {
  prerenderStoreFolder: "prerendered",
  languages: ["de"],
  nestedSymbol: "&",
  normalizeUrl(url) {
    url = url.trim()
    url = url.split("/").filter((p) => p !== "").join("/")
    url = url.startsWith("/") ? url.slice(1) : url
    url = url.endsWith("/") ? url.slice(0, -1) : url
    return url
  },
  urlToPath(url) {
    let path = sanitizePath(url)
    path = path.split(stats.nestedSymbol).join(stats.nestedSymbol + stats.nestedSymbol)
    path = path.split("/").join(stats.nestedSymbol)
    return path
  },
  buildStaticPath(path, locale) {
    path = sanitizePath(locale) + stats.nestedSymbol + path
    path = pth.join(stats.prerenderStoreFolder, path)
    return path
  }
}

module.exports = stats
