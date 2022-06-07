import liveReloadServer from "./liveReloadServer"
import delay from "delay"




liveReloadServer((app) => {
  app.get("/api/register/:uid", async (req, res) => {
    const uid = req.params.uid
  
    console.log("got call")
  
    res.send({
      firstName: uid,
      surName: "Doe",
    })
  })
      
  

  
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
})




