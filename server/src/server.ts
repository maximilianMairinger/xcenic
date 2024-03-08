import { cloneKeys } from "./lib/clone"
import { DataBase, DataBaseSubscription } from "josm"
import setup from "./setup"
import sizeOfObject from "object-sizeof"
import mongoApi from "./mongoApi"








setup("xcenic").then(async ({app, db}) => {

  
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


