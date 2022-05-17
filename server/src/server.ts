import { cloneKeys } from "./lib/clone"
import { DataBase, DataBaseSubscription } from "josm"
import setup from "./setup"
import sizeOfObject from "object-sizeof"
import mongoApi from "./mongoApi"
// recursive needed?
import projectObject from "project-obj"
// recurisive needed?
import merge from "deepmerge"
import { stringify, parse } from "./../../app/lib/serialize"
import crypto from "crypto"
import argon2 from "argon2"
import { mergeOldRecursionToDB, resolveOldRecursion } from "../../app/lib/networkDataBase"



function justifyNesting(obj: any) {
  let just = false;
  const deeper = [];
  for (const key in obj) {
    const val = obj[key];
    if (typeof val === "object") deeper.push({ key, val });
    else just = true;
  }

  for (const { key, val } of deeper) {
    if (justifyNesting(val)) just = true;
    else delete obj[key];
  }
  return just;
}


// https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
// const p = argon2.hash("password", {
//   type: argon2.argon2id,
//   memoryCost: 37888, // 37 MiB
//   timeCost: 2,
//   parallelism: 1
// })

// p.then((s) => {
//   const ss = "$argon2id$v=19$m=37888,t=2,p=1$LokGkIzdPuP1FiF7HAyLiw$IHCQ/631fYFfF+ARfja4lHId56w3k5P1N21TakX6AK4"
//   console.log(s === ss)
//   console.log(s)
//   argon2.verify(ss, "password").then(console.log)

// })

// const sessionKey = crypto.randomBytes(32).toString("hex")

// console.log("sessionKey", sessionKey)


setup("xcenic", async (app, db) => {

  const max = {
    myName: "Max",
    age: 27
  
  }
  
  const ting = {
    myName: "Ting",
    age: 23
  }
  
  
  
  // @ts-ignore
  max.loves = ting
  // @ts-ignore
  ting.loves = max
  
  
  let ob = {
    ppl: max
  }





  const mongTest = await mongoApi(db.collection("test123"))
  const josmTest = new DataBase(await mongTest.get())


  josmTest(function sub(full, diff) {
    // console.log(diff)
    console.log("dev")
    console.log(resolveOldRecursion(diff, sub))

    // mongTest.set(resolveOldRecursion(diff, sub))
  }, true, false)
  
  console.log("dd")
  // josmTest(ob)
  ob = josmTest() as any
  
  josmTest({nono: (ob as any).leeeel})

  // console.log(cloneKeys(josmTest()))


  // josmTest({newPPl: {ppl2: josmTest().ppl.loves}})

  // console.log(josmTest())






  // const mongo = await mongoApi(db.collection("lang"))
  // const josm = new DataBase(await mongo.get())
  // josm((full, diff) => {
  //   mongo.set(diff)
  // }, true, false)



  // app.ws("/lang", (ws, req) => {
  //   let projection = {}
  //   console.log("new ws")


  //   const dataBaseSubscription = josm((full, diff) => {
  //     ws.send(stringify(projectObject(diff as any, projection)))
  //   }, false) as DataBaseSubscription<[any]>

  //   ws.on("message", (rawMsg) => {
  //     console.log("rawMsg", rawMsg)
  //     if (sizeOfObject(rawMsg) > 100000) return
  //     console.log("thisfar")

  //     const msg = parse(rawMsg as any as string)
  //     console.log("thisfar2")
  //     if (msg.get !== undefined) {
  //       dataBaseSubscription.activate(false)
  //       projection = merge(projection, msg.get, {})
  //       ws.send(stringify(projectObject(josm() as any, msg.get)))
  //     }
  //     if (msg.set) {
  //       dataBaseSubscription.setToDataBase(msg.set)
  //     }
      
  //   })

  //   ws.on("close", () => {
  //     dataBaseSubscription.deactivate()
  //     console.log("close")
  //   })
  // })

  
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


