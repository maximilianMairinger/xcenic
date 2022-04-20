const PupPrerender = require('puppeteer-prerender');
const {promises: fs} = require("fs")

async function main() {
  const prerender = new PupPrerender({
    debug: true,
  })
 

  const {
    status,
    redirect,
    meta,
    openGraph,
    links,
    html,
    staticHTML 
  } = await prerender.render('https://xcenic.com/')

  await fs.writeFile("./prerendered/index.html", staticHTML)

 
  await prerender.close()
}



 
main()