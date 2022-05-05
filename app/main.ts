import Site from "./_component/site/site"


export default function() {
  let site = new Site()

  document.body.append(site)



  const ws = new WebSocket(location.protocol === "https:" ? "wss://" : "ws://" + location.host + "/lang/de/lel")
  ws.addEventListener("open", () => {
    console.log("open")
    ws.send(JSON.stringify({hello: "hi"}))
    ws.addEventListener("message", (msg) => {
      console.log("msg", msg)
    })
  })

}