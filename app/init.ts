import global from "./global"


import record from "./_component/_themeAble/_frame/_page/recordPage/record"


export async function init() {
  await global();

  
  (window as any).rec = record(document.body).data

  
  const main = (await import("./main")).default
  main()



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
  
  


