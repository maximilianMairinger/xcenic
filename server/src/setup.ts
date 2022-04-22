import express from "express"
import * as bodyParser from "body-parser"
import xrray from "xrray"; xrray(Array);
import * as MongoDB from "mongodb";
const MongoClient = MongoDB.MongoClient
import pth from "path"
import fs from "fs"
import detectPort from "detect-port"
import Prerenderer from "../../build/prerenderer"
const pug = require('pug')
import isBot from "isbot"
const { prerenderStoreFolder } = require("./../../build/stats")




const defaultPortStart = 3050

export type SendFileProxyFunc = (file: string, ext: string, fileName: string) => string | void | null

export function configureExpressApp(indexUrl: string, publicPath: string, sendFileProxy?: Promise<SendFileProxyFunc> | SendFileProxyFunc, middleware?: (app: express.Express) => express.Express | void): express.Express & { port: Promise<number> } {
  if (indexUrl !== "*") if (!indexUrl.startsWith("/")) indexUrl = "/" + indexUrl

  let app = express()
  if (middleware) {
    let q = middleware(app)
    if (q !== undefined && q !== null) app = q as any
  }
  app.use(bodyParser.urlencoded({extended: false}))
  app.use(bodyParser.json())


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


  const renderIndex = pug.compileFile("public.src/index.pug")









  app.use(express.static(pth.join(pth.resolve(""), publicPath), {index: false}))


  app.get(indexUrl, async (req, res, next) => {
    
    let url = req.originalUrl
    const forceNoJs = url.startsWith("/nojs")
    if (forceNoJs) url = url.substring(5)
    console.log("url", url)

    url = (url.endsWith("/") ? url.slice(0, -1) : url).slice(1).split("/").join(">")
    const path = pth.join(prerenderStoreFolder, url === "" ? "index" : url) + ".html"
    console.log("path", path)
    const isValidUrl = fs.existsSync(path)

    const isReqFromBot = forceNoJs || isBot(req.get('user-agent'))

    console.log(isValidUrl, isReqFromBot)
    if (isValidUrl) {
      if (isReqFromBot) {
        res.sendFile(path)
        console.log("isbot", req.originalUrl, "200")
      }
      else {
        


        // todo: meta and stuff
        res.send(renderIndex({
          url: req.originalUrl
        }))
      }
    }
    else {
      res.statusCode = 404
      if (isReqFromBot) {
        console.log("isbot", url, "404")
        // todo: crawl 404 page
        res.send("404 - Page not found<br><a href='/'>Hompage</a>")
      }
      else {
        console.log("here2")
        res.send(renderIndex({
          url: req.originalUrl
        }))
      }
    }
  })
  



  


  port.then(app.listen.bind(app))


  return app as any
}

type DBConfig = {
  url: string,
  dbName: string
}


const publicPath = "./public"

export default function (dbName_DBConfig: string | DBConfig, indexUrl?: string): Promise<{ db: MongoDB.Db, app: express.Express & { port: Promise<number> } }>;
export default function (dbName_DBConfig?: undefined | null, indexUrl?: string): express.Express & { port: Promise<number> };
export default function (dbName_DBConfig?: string | null | undefined | DBConfig, indexUrl: string = "*"): any {
  const app = configureExpressApp(indexUrl, publicPath)

  if (dbName_DBConfig) {
    let dbConfig: DBConfig
    if (typeof dbName_DBConfig === "string") dbConfig = { dbName: dbName_DBConfig, url: "mongodb://localhost:27017"}
    else dbConfig = dbName_DBConfig

    return new Promise((res) => {
      MongoClient.connect(dbConfig.url, { useUnifiedTopology: true }).then((client) => {
        let db = client.db(dbConfig.dbName)
        res({db, app})
      }).catch(() => {
        console.error("Unable to connect to MongoDB")

        res({app})
      })
    })
  }
  else return app
}



