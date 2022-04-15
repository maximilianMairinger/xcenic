import setup from "./setup"



setup("xcenic").then(async ({app, db}) => {

  
  app.post("/addEntry", (req, res) => {
    const entry = req.body

    console.log("getting entry", entry)

    db.collection("contactData").insertOne(entry, (err, result) => {
      if (err) {
        res.send({
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


