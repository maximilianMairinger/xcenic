import liveReloadServer from "./liveReloadServer"
let app = liveReloadServer()


import delay from "delay"



app.post("/addEntry", (req, res) => {
  const entry = req.body
  entry.time = Date.now()

  console.log("getting entry", entry)

  setTimeout(() => {
    res.send({
      success: true
    })
  }, 1000)
})