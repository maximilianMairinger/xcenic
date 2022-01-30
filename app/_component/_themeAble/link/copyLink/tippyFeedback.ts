
import delay from "delay"
import tippy from "../../../../lib/tippy"
import lang from "../../../../lib/lang"

export default function(root: HTMLElement) {
  
  
  const tip = tippy(root, {
    content: lang.copiedFeedback.get(),
    trigger: "manual",
    placement: "top",
    animation: 'shift-away-subtle'
  })

  lang.copiedFeedback.get((s) => {
    tip.setContent(s)
  })

  return async () => {
    tip.show()
    await delay(1500)
    tip.hide()
  }
}