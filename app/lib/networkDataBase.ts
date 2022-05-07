import { DataBase } from "josm"
import { stringify, parse } from "./../lib/serialize"




export default function networkDataBase(urlPath: string | URL, fetchQuery: object = {}) {
  const url = urlPath instanceof URL ? urlPath.toString() : location.protocol === "https:" ? "wss://" : "ws://" + location.host + (urlPath.startsWith("/") ? urlPath : "/" + urlPath)
  const ws = new WebSocket(url)
  const dataBase = new DataBase({})
  const sub = dataBase((full, diff) => {
    ws.send(stringify({set: diff}))
  }, true, false)

  ws.addEventListener("message", (rawMessage) => {
    const msg = parse(rawMessage.data)
    sub.setToDataBase(msg)
  })
  ws.addEventListener("open", () => {
    const msg = stringify({get: fetchQuery})
    console.log("open", msg)
    ws.send(msg)
  })
  ws.on("close", () => {
    console.log("closing")
  })
  return dataBase
} 