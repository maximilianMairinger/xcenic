const Prerenderer = require('./prerenderer');
const {promises: fs} = require("fs")
const ffs = require('fs');
const { prerenderStoreFolder } = require("./stats")
const path = require("path")

async function main() {

  if (!ffs.existsSync(prerenderStoreFolder)) {
    ffs.mkdirSync(prerenderStoreFolder)
  }
  else if (!ffs.lstatSync(prerenderStoreFolder).isDirectory()) {
    throw new Error(prerenderStoreFolder + " is not a dir.")
  }

  const prerenderer = new Prerenderer({
    debug: true,
    renderShadowRoot: true,
    followRedirect: true,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36",
    puppeteerLaunchOptions: {
      headless: true
    }
  })

  let html
  try {
    const res = await prerenderer.render("http://127.0.0.1:6500")
    html = res.staticHTML
  }
  catch(e) {
    throw e
  }
  finally {
    await prerenderer.close()
  }

  if (html) await fs.writeFile(path.join(prerenderStoreFolder, "index.html"), html)
  
}



 
main()