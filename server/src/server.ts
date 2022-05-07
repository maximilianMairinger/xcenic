import { DataBase, DataBaseSubscription } from "josm"
import setup from "./setup"
import sizeOfObject from "object-sizeof"
import mongoApi from "./mongoApi"
// recursive needed?
import projectObject from "project-obj"
// recurisive needed?
import merge from "deepmerge"
import { stringify, parse } from "./../../app/lib/serialize"






setup("xcenic", async (app, db) => {






  const mongo = await mongoApi(db.collection("lang"))
  const josm = new DataBase(await mongo.get())
  josm((full, diff) => {
    mongo.set(diff)
  }, true, false)



  app.ws("/lang", (ws, req) => {
    let projection = {}
    console.log("new ws")


    const dataBaseSubscription = josm((full, diff) => {
      ws.send(stringify(projectObject(diff as any, projection)))
    }, false) as DataBaseSubscription<[any]>

    ws.on("message", (rawMsg) => {
      console.log("rawMsg", rawMsg)
      if (sizeOfObject(rawMsg) > 100000) return
      console.log("thisfar")

      const msg = parse(rawMsg as any as string)
      console.log("thisfar2")
      if (msg.get !== undefined) {
        dataBaseSubscription.activate(false)
        projection = merge(projection, msg.get, {})
        ws.send(stringify(projectObject(josm() as any, msg.get)))
      }
      if (msg.set) {
        dataBaseSubscription.setToDataBase(msg.set)
      }
      
    })

    ws.on("close", () => {
      dataBaseSubscription.deactivate()
      console.log("close")
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


