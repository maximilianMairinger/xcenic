import global from "./globals"
// import Replayer from "rrweb-player"
import { Replayer } from "rrweb"

export async function init() {
  await global()
  const rr = require("./record")

  
//   document.body.innerHTML = `
//   <link
//   rel="stylesheet"
//   href="https://cdn.jsdelivr.net/npm/rrweb@latest/dist/rrweb.min.css"
// />`

//   document.body.append(new A)

//   const styleElem = document.createElement("style")
//   styleElem.innerHTML = `
//     my-name {

//     }
//   ` + /* require("rrweb-player/dist/style.css").toString()*/

//   document.body.append(styleElem)


//   const btn = document.createElement("button")
//   btn.innerHTML = "replay"
//   setTimeout(() => {
//     console.log("ww")
//     const rrweb = require("rrweb")
//     const replayer = new rrweb.Replayer(rr.recording);
//     replayer.play();
//     console.log( rr.recording )
//   }, 2000)
//   // btn.onclick = () => {
    
    
//   // }

//   document.body.append(btn)
  
  
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
  
  


class A extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({mode: "open"})
  }
  connectedCallback() {
    setTimeout(() => {
      console.log("qqqq")
      this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          background: #f00;
        }
      </style>
      <input value="uiuiui"></input>
    `
    }, 2000)
    
  }
}

window.customElements.define("my-name", A)