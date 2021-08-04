const nodemon = require("nodemon")
const detectPort = require("detect-port")
const args = require("yargs").argv;
const path = require("path")
const fs = require("fs")
const open = require("open")
const waitOn = require("wait-on")
const del = require("del")
const chokidar = require("chokidar")
const imageWeb = require("image-web")
const delay = require("delay")


// configureable
const serverEntryFileName = "server.js"
const appEntryFileName = "xcenic.js"






let serverDir = "./server/dist";
let appDir = "./public/dist";

if (args.dev === "repl") {
  serverDir = "./replServer/dist"
}
else if (args.dev === "server") {
  serverDir = "./server/dist";
}


let serverEntryPath = path.join(serverDir, serverEntryFileName)
let appEntryPath = path.join(appDir, appEntryFileName);




(async (wantedPort = 6500) => {


  await Promise.all([
    del(appDir).then(() => console.log("Deleted \"" + appDir + "\".")),
    del(serverDir).then(() => console.log("Deleted \"" + serverDir + "\"."))
  ])

  console.log("")
  console.log("")
  console.log("Waiting for build to finish, before starting the server...")


  await waitOn({
    resources: [serverEntryPath, appEntryPath]
  })


  let gotPort;
  try {
    gotPort = await detectPort(wantedPort)
  }
  catch(e) {
    console.error(e)
    return
  }
  

  const compressImages = imageWeb.constrImageWeb(["jpg", "webp", "avif"], ["3K", "PREV"])
  const imgDistPath = "public/res/img/dist" 
  const imgSrcPath = "app/res/img"
  const imgChangeF = async (path, override = false) => {
    console.log("Compressing images")
    await delay(1000)
    await compressImages(imgSrcPath, imgDistPath, { override, silent: false })
  }
  

  
  imgChangeF(imgSrcPath, false)
  chokidar.watch(imgSrcPath, { ignoreInitial: true }).on("change", (path) => imgChangeF(path, true))

  
  


  

  
  let server = nodemon({
    watch: serverDir,
    script: serverEntryPath,
    env: {
      port: gotPort
    }
  })

  server.on("restart", (e) => {
    console.log("")
    console.log("-----------------")
    console.log("Server restarting")
    console.log("-----------------")
    console.log("")
  })

  
  
  
  
  console.log("")
  console.log("")

  if (gotPort !== wantedPort) console.log(`Port ${wantedPort} was occupied, falling back to: http://127.0.0.1:${gotPort}.\n----------------------------------------------\n`)
  else console.log(`Serving on http://127.0.0.1:${gotPort}.\n---------------------\n`)

  
  
  console.log("Starting Browser")
  open(`http://127.0.0.1:${gotPort}`)
  
  
  
  
})(args.port)






