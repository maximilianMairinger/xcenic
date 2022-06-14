import liveReloadServer from "./liveReloadServer"
import delay from "delay"




liveReloadServer((app) => {
  app.get("/api/register/:uid", async (req, res) => {
    const uid = req.params.uid
    if (uid === "uid") {
      console.log("got call")
  
      res.send({
        firstName: uid,
        surName: "Doe",
      })
    }
    else {
      res.status(404).send({ok:false})
    }
  
    
  })

  app.post("/api/registerUpdate/:uid/:pageId", async (req, res) => {
    const uid = req.params.uid
    console.log("req" , req.params)
    if (uid === "uid") {
      console.log("got call update")
      const pageId = req.params.pageId
  
      res.send({
        ok: true,
        pageId
      })
    }
    else {
      res.status(404).send({
        ok: false
      })
    }
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




