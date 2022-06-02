export * from "tippy.js"
import tippy from "tippy.js"
document.head.insertAdjacentHTML("beforeend", `<style name="tippyStyles">${require("tippy.js/dist/tippy.css").toString() + require('tippy.js/animations/shift-away-subtle.css').toString()}</style>`)
export default tippy