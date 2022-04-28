const Prerenderer = require('./prerenderer');
const {promises: fs} = require("fs")
const ffs = require('fs');
const stats = require("./stats")
const pth = require("path")
const del = require("del")
const mkDir = require("make-dir")
const sanitisePath = require("sanitize-filename")
const { URL } = require("url")


const headless = true



class PrerenderOrchestrator {
  constructor(languages) {
    if (languages === undefined || languages.length === 0) {
      languages = stats.languages
    }
  
    this.languages = languages = languages.map(lang => sanitisePath(lang))
  
    if (!ffs.existsSync(stats.prerenderStoreFolder)) {
      ffs.mkdirSync(stats.prerenderStoreFolder)
    }
    else if (!ffs.lstatSync(stats.prerenderStoreFolder).isDirectory()) {
      throw new Error(stats.prerenderStoreFolder + " is not a dir.")
    }
    else {
      del.sync(pth.join(stats.prerenderStoreFolder, "**"))
    }
  
  
    
    this.prerenderer = new Prerenderer({
      debug: true,
      renderShadowRoot: true,
      followRedirect: true,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36",
      puppeteerLaunchOptions: {
        headless,
        // fullhd
        defaultViewport: {
          width: 1920,
          height: 1080
        }
      }
    })
  }

  close() {
    this.prerenderer.close()
  }

  async render(url, recursive = false) {

    const initUrl = new URL(url)
    const urlPathName = stats.normalizeUrl(initUrl.pathname)
    const path = stats.urlToPath(urlPathName)


    for (const lang of this.languages) {
      const fullPath = stats.buildStaticPath(path, lang);
      // check if already done
      if (await fs.stat(fullPath).then(() => true).catch(() => false)) {
        continue
      }

      await mkDir(fullPath)

      let res
      try {
        res = await this.prerenderer.render(url, { lang, ignore404: true })
      }
      catch(e) {
        console.log("Unable to render " + url)
      }
    
      if (res) {
        

        

        
        await Promise.all([
          fs.writeFile(pth.join(fullPath, "index.html"), res.staticHTML),
          fs.writeFile(pth.join(fullPath, "index.json"), JSON.stringify({
            links: res.links,
            title: res.title,
            meta: res.meta,
            openGraph: res.openGraph
          }))
        ])

        if (recursive) {
          // filter duplicate links
          const links = new Set(res.links)

          for (const link of links) {
            const linkUrl = new URL(link)
            if (linkUrl.hostname === initUrl.hostname) {
              await this.render(linkUrl.href, true)
            }
          }
        }
        
        
      }
    }

    
  }

    
}


async function main() {
  const orchestrator = new PrerenderOrchestrator(stats.languages)
  try {
    await orchestrator.render("http://127.0.0.1:6500", true)
  }
  finally {
    if (headless) orchestrator.close()
  }
  
}

if (require.main === module) main()


module.exports = PrerenderOrchestrator