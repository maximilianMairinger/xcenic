import { DataBase, DataBaseSubscription } from "josm"
import * as MongoDB from "mongodb"
import { parse, stringify } from "../../app/lib/serialize"
import mongoApi from "../../server/src/mongoApi"

import projectObject from "project-obj"
import sizeOfObject from "object-sizeof"
import merge from "deepmerge"
import { escapeRecursion } from "../../app/lib/networkDataBase"
import networkDataBase from "./../../app/lib/networkDataBase"
import de from "./../../app/res/lang/de"
import en from "./../../app/res/lang/en"
import { isObjectEmpty } from "../../server/src/lib/clone"
const initLang = {de, en}



export default async function(app: any, db: MongoDB.Db) {

  

  const mongo = await mongoApi(db.collection("lang"))
  const initMongo = await mongo.get()
  const needFallback = isObjectEmpty(initMongo)
  const josm = new DataBase(needFallback ? initLang : initMongo)

  josm(function sub(full, diff) {
    mongo.set(escapeRecursion(diff, sub))
  }, true, needFallback)


  app.ws("/lang", (ws) => {
    const network = networkDataBase(josm, ws)
    
  })

  
}


import WebSocket from "ws"
const addEventListenerSym = Symbol("addEventListener")
WebSocket.prototype[addEventListenerSym] = WebSocket.prototype.addEventListener

WebSocket.prototype.addEventListener = function(type, listener, useCapture) {
  if (type === "open") {
    listener()
  }
  else this[addEventListenerSym](type, listener, useCapture)
}




