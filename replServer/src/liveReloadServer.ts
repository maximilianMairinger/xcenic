import chokidar from "chokidar"
import pth from "path"
import fs from "fs"
import xtring from "xtring"; xtring();

import { configureExpressApp, SendFileProxyFunc } from "./../../server/src/setup"



function formatPath (path: string) {
  let localPath = path.substr(7)
  localPath = localPath.split("\\").join("/")
  if (pth.extname(localPath) === "") localPath += "/"
  return localPath
}

const swInjection = fs.readFileSync(pth.join(__dirname, "./../res/live-reload-inject.js")).toString()




const publicPath = "./public"


export default function init(indexUrl: string = "*", wsUrl: string = "/") {
  if (!wsUrl.startsWith("/")) wsUrl = "/" + wsUrl


  let activateSetFileProxy: (f: SendFileProxyFunc) => void

  let clients: Set<WebSocket>
  const app = configureExpressApp({indexUrl, publicPath, sendFileProxy: new Promise((res) => {activateSetFileProxy = res})})

  
  const restartingCousOf = []

  chokidar.watch(publicPath, { ignoreInitial: true }).on("all", (event, path) => {
    path = formatPath(path)

    
    //@ts-ignore
    global.qjwnenqjnewqik = restartingCousOf // quickfix https://github.com/rollup/rollup/issues/4425

    if (restartingCousOf.empty) {
      setTimeout(() => {
        console.log("Change at: \"" + restartingCousOf.join(", ") + "\"; Restarting app.")
        restartingCousOf.clear()


        if (clients !== undefined && clients.size > 0) {
          clients.forEach((c) => {
            c.send("reload please")
          }, 0)
        }
        else {
          console.log("No clients to reload.")
        }
      })
    }
    restartingCousOf.push(path)



    
  })


  
  app.port.then((port) => {
  // inject
  const swInjUrl = `
<!-- Code Injected by the live server -->
<script>
(() => {
let wsUrl = "${wsUrl}";
${swInjection}
})()
</script>`

    activateSetFileProxy((file, ext) => {
      if (ext === ".html" || ext === ".htm") {
        let injectAt = file.lastIndexOf("</body>")
        return file.splice(injectAt, 0, swInjUrl)
      }
    })
  })

  
  return app
}
