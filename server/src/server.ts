import setup from "./setup"
import sizeOfObject from "object-sizeof"
import nodemailer from "nodemailer"
import sani from "sanitize-against"

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.eu',
  port: 465,
  secure: true,
  auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD
  },
});



setup("xcenic").then(async ({app, db}) => {

  
  const addEntrySani = sani({
    details: String,
    interests: {
      dev: Boolean,
      design: Boolean,
      video: Boolean,
      photo: Boolean,
      social: Boolean,
      other: Boolean
    },
    sender: String,
    email: String
  })

  app.post("/addEntry", (req, res) => {

    let entry: any

    try {
      entry = addEntrySani(req.body)
    } catch(e) {
      res.send({
        msg: "Invalid entry",
        success: false
      })
      console.log(req.body)
      return
    }

    if (sizeOfObject(entry) > 100000) {
      res.send({
        msg: "Entry is too big",
        success: false
      })
      return
    }




    ;(entry as any).time = Date.now()

    console.log("getting entry", entry)

    transporter.sendMail({
      from: process.env.MAIL_USER,
      to: "corporate@xcenic.com",
      subject: `New contact request from ${entry.sender}`,
      text: `New contact request from ${entry.sender} (${entry.email}) with content:\n\n${JSON.stringify(entry.interests, null, 2)}\n\n${entry.details}`
    }, (err, info) => {
      if (err) {
        console.error("Mail send error")
        console.error(err)
      } else {
        console.log("Mail sent")
      }
    })


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


