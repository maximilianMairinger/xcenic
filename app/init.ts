import global from "./globals"
// import Replayer from "rrweb-player"
import { Replayer } from "rrweb"

export async function init() {
  await global()
  const rr = require("./record")

  

  document.body.innerHTML = `
  
  <!-- BEGIN PLERDY CODE -->
  <script type="text/javascript" defer data-plerdy_code='1'>
      var _protocol="https:"==document.location.protocol?" https://":" http://"
      _site_hash_code = "e703d5c7b0237efd64efa963c6710789",_suid=21125, plerdyScript=document.createElement("script");
      plerdyScript.setAttribute("defer",""),plerdyScript.dataset.plerdyMainScript="plerdyMainScript",
      plerdyScript.src="https://a.plerdy.com/public/js/click/main.js?v="+Math.random();
      var plerdyMainScript=document.querySelector("[data-plerdyMainScript='plerdyMainScript']");
      plerdyMainScript&&plerdyMainScript.parentNode.removeChild(plerdyMainScript);
      try{document.body.appendChild(plerdyScript)}catch(t){console.log("unable add script tag")}
  </script>
  <!-- END PLERDY CODE -->`
  
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