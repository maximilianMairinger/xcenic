import global from "./global"
import * as lang from "./lib/lang"



export async function init() {

  lang.lang(console.log)

  await Promise.all([
    global(),
    lang.fetch({
      xcenic: true,
    })
  ])
  
  // setTimeout(() => {
  //   lang
  //   console.log(lang.lang.xcenic)
  //   debugger
  // }, 1000)
  
  

  // const main = (await import("./main")).default
  // main()


  // if ("serviceWorker" in navigator) {
  //   if (navigator.serviceWorker.controller) {
  //     console.log("[SW] Found Service worker")
  //   } else {
  //     await navigator.serviceWorker.register("./sw.js", {scope: "./"}).then(function(reg){
  //       console.log("[SW] Service worker installed with scope: " + reg.scope)
  //     })
  //   }
  // }
  // else {
  //   console.warn("[SW] Unable to install Service worker. Not supported.");
  // }
}
  
  


