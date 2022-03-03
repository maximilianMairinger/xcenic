import expressWs from "express-ws"
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
  const ex = configureExpressApp(indexUrl, publicPath, new Promise((res) => {activateSetFileProxy = res}), (app) => {
    let appWss = expressWs(app)
    clients = (appWss as any).getWss(wsUrl).clients;
    (app as any).ws(wsUrl, () => {})
  })

  const app = ex as typeof ex & { ws: (route: string, fn: (ws: WebSocket & {on: WebSocket["addEventListener"], off: WebSocket["removeEventListener"]}, req: any) => void) => void }
  
  const restartingCousOf = []

  chokidar.watch(publicPath, { ignoreInitial: true }).on("all", (event, path) => {
    path = formatPath(path)

    // @ts-ignore
    global.qjwnenqjnewqik = restartingCousOf // quickfix https://github.com/rollup/rollup/issues/4425


    console.log("rengo")

    if (restartingCousOf.empty) {
      setTimeout(() => {
        console.log("Change at: \"" + restartingCousOf.join(", ") + "\"; Restarting app.")
        restartingCousOf.clear()


        clients.forEach((c) => {
          c.send("reload please")
        }, 0)
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
