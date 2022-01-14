
import tippy from "tippy.js"

import lang from "../../../../lib/lang"

export default function(root: HTMLElement, appendStylesTo: HTMLElement) {
  appendStylesTo.insertAdjacentHTML("beforeend", `<style>${require("tippy.js/dist/tippy.css").toString()}</style>`)
  
  const tip = tippy(root, {
    content: lang.copiedFeedback.get(),
    trigger: "manual",
    placement: "top"
  })

  lang.copiedFeedback.get((s) => {
    tip.setContent(s)
  })

  return () => {
    tip.show()
  }
}