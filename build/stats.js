const sanitizePath = require("sanitize-filename")
const pth = require("path")


const stats = {
  prerenderStoreFolder: "prerendered",
  languages: ["de"],
  nestedSymbol: "&",
  normalizeUrl(url) {
    url = url.trim()
    url = url.split("/").filter((p) => p !== "").join("/")
    return url
  },
  urlToPath(url) {
    let path = url
    path.split(stats.nestedSymbol).join(stats.nestedSymbol + stats.nestedSymbol)
    path = path.split("/").join(stats.nestedSymbol)
    path = sanitizePath(path)
    return path
  },
  buildStaticPath(path, locale) {
    path = sanitizePath(locale) + stats.nestedSymbol + path
    path = pth.join(stats.prerenderStoreFolder, path)
    return path
  }
}

module.exports = stats
