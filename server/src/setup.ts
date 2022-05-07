import express from "express"
import * as bodyParser from "body-parser"
import xrray from "xrray"; xrray(Array);
import * as MongoDB from "mongodb";
const MongoClient = MongoDB.MongoClient
import pth from "path"
import fs, {promises as aFs} from "fs"
import detectPort from "detect-port"
import Prerenderer from "../../build/prerenderer"
const pug = require('pug')
import isBot from "isbot"
const stats = require("./../../build/stats")
const locale = require('locale')
import sanitizePath from "sanitize-filename"
import expressWs from "express-ws"



type ExtendedExpress = express.Express & { port: Promise<number> } & { ws: (route: string, fn: (ws: WebSocket & {on: WebSocket["addEventListener"], off: WebSocket["removeEventListener"]}, req: any) => void) => void }




const defaultPortStart = 3050

export type SendFileProxyFunc = (file: string, ext: string, fileName: string) => string | void | null

export function configureExpressApp({indexUrl, publicPath, sendFileProxy, onRdy}: {onRdy?: (app: ExtendedExpress) => (Promise<void> | void), indexUrl: string, publicPath: string, sendFileProxy?: Promise<SendFileProxyFunc> | SendFileProxyFunc}): ExtendedExpress {
  if (indexUrl !== "*") if (!indexUrl.startsWith("/")) indexUrl = "/" + indexUrl

  let _app = express()
  expressWs(_app)

  const app = _app as typeof _app & { ws: (route: string, fn: (ws: WebSocket & {on: WebSocket["addEventListener"], off: WebSocket["removeEventListener"]}, req: any) => void) => void }



  app.use(bodyParser.urlencoded({extended: false}))
  app.use(bodyParser.json())
  console.log("available langs", stats.languages)
  app.use(locale(stats.languages, stats.languages[0]))



  let sendFileProxyLoaded: Function =  (res: any) => (path: string) => {
    res.old_sendFile(pth.join(pth.resolve(""), path))
  }
  if (sendFileProxy) {
    (async () => {
      let proxy = await sendFileProxy
      sendFileProxyLoaded = (res: any) => (path: string) => {
        let file = fs.readFileSync(path).toString()
        let extName = pth.extname(path)
        let end = proxy(file, pth.extname(path), pth.basename(path, extName))
        if (end === undefined) res.send(file)
        else if (end === null) res.status(400).end()
        else res.send(end)
      }
    })()
  }

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
  let port: Promise<number>
  if (prt === undefined) {
    port = (detectPort(defaultPortStart) as Promise<number>).then((port) => {console.log("No port given, using fallback - Serving on http://127.0.0.1:" + port)}) as Promise<number>
  }
  else port = Promise.resolve(+prt)

  //@ts-ignore
  app.port = port



  const indexJSRegex = /^xcenic.*\.js$/
  // search for a file in public/dist that matches the regex indexRegex
  const jsPath = pth.join(publicPath, "dist")

  let indexJS: string
  fs.readdirSync(jsPath).forEach(file => {
    if (indexJSRegex.test(file)) {
      if (indexJS !== undefined) console.error("Mutiple index.js files found in dist folder")
      else indexJS = file
    }
  })

  if (indexJS === undefined) {
    throw new Error("No index.js found in " + jsPath)
  }
  


  const renderIndex = pug.compileFile("public.src/index.pug")




  




  app.use(express.static(pth.join(pth.resolve(""), publicPath), {index: false}))



  const rr = onRdy !== undefined ? onRdy(app as any) : undefined
  if (rr instanceof Promise) rr.then(goOnline)
  else goOnline()

  function goOnline() {
    app.get(indexUrl, async (req, res, next) => {
  
      let url = stats.normalizeUrl(req.originalUrl)
      console.log("Requested: /" + url, res.statusCode)
  
      const forceNoJs = url.startsWith("nojs")
      if (forceNoJs) url = url.substring(5)
  
      let path = stats.buildStaticPath(stats.urlToPath(url), req.locale)
      
      // check if dir exists
      const isValidUrl = await aFs.stat(pth.join(path, "index.html")).then(() => true).catch(() => false)
      const isReqFromBot = forceNoJs || isBot(req.get('user-agent'))
  
      if (isValidUrl) {
        if (isReqFromBot) {
          res.sendFile(pth.join(path, "index.html"))
          console.log("isbot", req.originalUrl, "200")
        }
        else {
          // todo: meta and stuff
          aFs.readFile(pth.join(path, "index.json")).then((_stats) => {
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

    port.then(app.listen.bind(app))
  }


  return app as any
}

type DBConfig = {
  url: string,
  dbName: string
}


const publicPath = "./public"
const indexUrl: string = "*"

export default function (dbName_DBConfig: string | DBConfig, onRdy?: (app: ExtendedExpress, db: MongoDB.Db) => (Promise<void> | void)): Promise<{ db: MongoDB.Db, app: ExtendedExpress}>;
export default function (dbName_DBConfig?: undefined | null): ExtendedExpress;
export default function (dbName_DBConfig?: string | null | undefined | DBConfig, onRdy?: any): any {

  if (dbName_DBConfig) {
    let dbConfig: DBConfig
    if (typeof dbName_DBConfig === "string") dbConfig = { dbName: dbName_DBConfig, url: "mongodb://localhost:27017"}
    else dbConfig = dbName_DBConfig


    

    const dbProm = new Promise((res) => {
      MongoClient.connect(dbConfig.url, { useUnifiedTopology: true }).then((client) => {
        let db = client.db(dbConfig.dbName)
        res(db)
      }).catch(() => {
        console.error("Unable to connect to MongoDB")
        res(undefined)
      })
    })

    const app = configureExpressApp({indexUrl, publicPath, async onRdy(app) {
      if (onRdy) await onRdy(app, await dbProm)
    }})

    return dbProm.then((db) => {
      if (db === undefined) return { db }
      else return { db, app }
    })
  }
  else return configureExpressApp({indexUrl, publicPath})

}



