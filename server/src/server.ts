import setup from "./setup"
import sizeOfObject from "object-sizeof"
import mongoApi from "./mongoApi"
import timoi from "timoi"
// import objectScan from "object-scan"









setup("xcenic").then(async ({app: _app, db}) => {

  
  const app = _app as typeof _app & { ws: (route: string, fn: (ws: WebSocket & {on: WebSocket["addEventListener"], off: WebSocket["removeEventListener"]}, req: any) => void) => void }





  const mongo = await mongoApi(db.collection("testApi"))

  const ll = {
    name: "max"
  }
  // @ts-ignore
  ll.loves = ll

  const s = timoi("db access")
  // await mongo.mergeData({ll, root: "root"})
  console.log("get", await mongo.getData())
  s()


  
  app.ws("/lang", (ws, req) => {

    const subscriptions = {

    }

    const queryResolverIndex = {
      get(what: string) {
        
      }
    }

    ws.on("message", (rawMsg) => {
      if (sizeOfObject(rawMsg) > 100000) return
      const msg = JSON.parse(rawMsg.data)
      if (typeof msg === "string") {
        // query
        const query = msg.split(" ")
        const resolver = queryResolverIndex[query.unshift()]
        if (resolver) {
          resolver(...query)
        }
        else console.warn("no resolver for", msg)
      }
    })

    ws.send("aye")

    ws.on("message", (msg) => {
      console.log("msg", msg)
      ws.send("msg")
    })
  })

  
  app.post("/addEntry", (req, res) => {
    const entry = req.body
    if (sizeOfObject(entry) > 100000) {
      res.send({
        msg: "Entry is too big",
        success: false
      })
      return
    }
    entry.time = Date.now()

    console.log("getting entry", entry)

    db.collection("contactData").insertOne(entry, (err, result) => {
      if (err) {
        res.send({
          msg: "DB error",
          success: false
        })
      } else {
        res.send({
          success: true
        })
      }
    })
  })
})


