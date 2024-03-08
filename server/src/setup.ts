import express from "express"
import { urlencoded, json } from "body-parser"
import xrray from "xrray"; xrray(Array);
import * as MongoDB from "mongodb";
const MongoClient = MongoDB.MongoClient
import pth from "path"
import fss, {promises as fs} from "fs"
import detectPort from "detect-port"
import ws, { WebSocketServer, WebSocket } from "ws"
import Prerenderer from "../../build/prerenderer"
const pug = require('pug')
import keyIndex from "key-index"
import isBot from "isbot"
const stats = require("./../../build/stats")


const defaultPortStart = 3050




export type SendFileProxyFunc = (file: string, ext: string, fileName: string) => string | void | null

export async function configureExpressApp(indexUrl: string, publicPath: string, sendFileProxy?: Promise<SendFileProxyFunc> | SendFileProxyFunc, middleware?: (app: express.Express) => express.Express | void) {
  if (indexUrl !== "*") if (!indexUrl.startsWith("/")) indexUrl = "/" + indexUrl

  let app = express() as express.Express & { 
    port: number, 
    getWebSocketServer: (url: `/${string}`) => WebSocketServer,
    ws: (url: `/${string}`, cb: (ws: WebSocket & {on: WebSocket["addEventListener"], off: WebSocket["removeEventListener"]}, req: any) => void) => void,
  }
  
  

  if (middleware) {
    let q = middleware(app)
    if (q !== undefined && q !== null) app = q as any
  }
  app.use(urlencoded({extended: false}))
  app.use(json())


  let sendFileProxyLoaded: Function = (res: any) => (path: string) => {
    res.old_sendFile(pth.join(pth.resolve(""), path))
  }
  if (sendFileProxy) {
    (async () => {
      let proxy = await sendFileProxy
      sendFileProxyLoaded = (res: any) => (path: string) => {
        // async?
        let file = fss.readFileSync(path).toString("utf-8")
        let extName = pth.extname(path)
        let end = proxy(file, pth.extname(path), pth.basename(path, extName))
        if (end === undefined) res.send(file)
        else if (end === null) res.status(400).end()
        else res.send(end)
      }
    })()
  }

  app.use(express.static(pth.join(pth.resolve(""), publicPath), {index: false}))



  //@ts-ignore
  app.old_get = app.get
  //@ts-ignore
  app.get = (url: string, cb: (req: any, res: any, next) => void) => {
    if (!url.startsWith("/")) url = "/" + url

    //@ts-ignore
    app.old_get(url, (req, res, next) => {
      res.old_sendFile = res.sendFile
      res.sendFile = sendFileProxyLoaded(res)
      cb(req, res, next)
    })
  }

  let prt = process.env.port
  let _port: Promise<number>
  if (prt === undefined) {
    _port = (detectPort(defaultPortStart) as Promise<number>)
    _port.then((port) => {console.log("No port given, using fallback - Serving on http://127.0.0.1:" + port)}) as Promise<number>
  }
  else _port = Promise.resolve(+prt)
  

  


  app.port = await _port
  const port = app.port

  const webSocketServerMap = keyIndex((url: `/${string}`) => new WebSocketServer({ noServer: true, path: url }))
  const expressServer = app.listen(port)
  app.ws = (url: `/${string}`, cb: (ws: WebSocket & {on: WebSocket["addEventListener"], off: WebSocket["removeEventListener"]}, req: any) => void) => {
    const websocketServer = webSocketServerMap(url)
    websocketServer.on("connection", (ws, req) => {
      cb(ws, req)
    })
  }

  expressServer.on("upgrade", (request, socket, head) => {
    const url= request.url as `/${string}`
    webSocketServerMap(url).handleUpgrade(request, socket, head, (websocket) => {
      webSocketServerMap(url).emit("connection", websocket, request);
    });
  });

  app.getWebSocketServer = webSocketServerMap


  const indexJSRegex = /^xcenic.*\.js$/
  // search for a file in public/dist that matches the regex indexRegex
  const jsPath = pth.join(publicPath, "dist")

  let indexJS: string | undefined
  fss.readdirSync(jsPath).forEach(file => {
    if (indexJSRegex.test(file)) {
      if (indexJS !== undefined) console.error("Multiple index.js files found in dist folder")
      else indexJS = file
    }
  })

  if (indexJS === undefined) {
    throw new Error("No index.js found in " + jsPath)
  }
  


  const renderIndex = pug.compileFile("public.src/index.pug")


  app.get(indexUrl, async (req, res, next) => {

    let url = stats.normalizeUrl(req.originalUrl)
    console.log("Requested: /" + url, res.statusCode)

    const forceNoJs = url.startsWith("nojs")
    if (forceNoJs) url = url.substring(5)

    let path = stats.buildStaticPath(stats.urlToPath(url), (req as any).locale)
    
    // check if dir exists
    const isValidUrl = await fs.stat(pth.join(path, "index.html")).then(() => true).catch(() => false)
    const isReqFromBot = forceNoJs || isBot(req.get('user-agent'))

    if (isValidUrl) {
      if (isReqFromBot) {
        res.sendFile(pth.join(path, "index.html"))
        console.log("isbot", req.originalUrl, "200")
      }
      else {
        // todo: meta and stuff
        fs.readFile(pth.join(path, "index.json")).then((_stats) => {
          const stats = JSON.parse(_stats.toString())

          res.send(renderIndex({
            url,
            meta: stats.meta,
            indexJS
          }))
        })
        
      }
    }
    else {
      res.statusCode = 404
      if (isReqFromBot) {
        console.log("isbot", req.originalUrl, "404")
        // todo: crawl 404 page
        res.send("404 - Page not found<br><a href='/'>Hompage</a>")
      }
      else {
        res.send(renderIndex({
          url,
          indexJS
        }))
      }
    }
  })



  return app
}

type DBConfig = {
  url: string,
  dbName: string
}


const publicPath = "./public"

export default function (dbName_DBConfig: string | DBConfig, indexUrl?: string): Promise<{ db: MongoDB.Db, app: Awaited<ReturnType<typeof configureExpressApp>> }>
export default function (dbName_DBConfig?: undefined | null, indexUrl?: string): ReturnType<typeof configureExpressApp>;
export default function (dbName_DBConfig?: string | null | undefined | DBConfig, indexUrl: string = "/"): any {
  const app = configureExpressApp(indexUrl, publicPath)

  if (dbName_DBConfig) {
    return (async () => {
      try {
        return {db: await createMongoConnection(dbName_DBConfig), app: await app}
      }
      catch(e) {
        console.error(e.message)
        return {app: await app}
      }
      
    })()
  }
  else return app
}



export function createMongoConnection(dbName_DBConfig: DBConfig | string) {
  let dbConfig: DBConfig
  if (typeof dbName_DBConfig === "string") dbConfig = { dbName: dbName_DBConfig, url: "mongodb://localhost:27017"}
  else dbConfig = dbName_DBConfig

  return new Promise<MongoDB.Db>((res, rej) => {
    MongoClient.connect(dbConfig.url, { useUnifiedTopology: true }).then(async (client) => {
      res(client.db(dbConfig.dbName))
    }).catch(async () => {
      rej(new Error("Unable to connect to MongoDB"))
    })
  })
}