import declareComponent from "../../../../lib/declareComponent"
import Link from "../link";
import copyToClipboard from "copy-to-clipboard"
import delay from "delay"
import lang from "../../../../lib/lang";
import { loadRecord } from "../../_frame/frame";

export default class CopyLink extends Link {
  constructor(content: string, public copyText: string = content) {
    super(content)

    let copyFeedback: () => any = async () => {
      const content = this.content()
      this.content(lang.copiedFeedback.get())
      await delay(600)
      this.content(content)
    }

    loadRecord.full.add(async () => {
      copyFeedback = (await import("./tippyFeedback")).default(this, this.componentBody as HTMLElement)
    })
    
    this.addActivationListener(() => {
      copyToClipboard(this.copyText)
      copyFeedback()
    })
  }

  
  // // who is supposed to call this? Maybe just revert to record?
  // async minimalContentPaint() {
  //   if (this.copyNeeded) await import("copy-to-clipboard").then(this.copyImports.copy.res)
  // }

  // async fullContentPaint() {
  //   if (this.copyNeeded) await import("tippy.js").then(this.copyImports.tippy.res)
  // }
}

declareComponent("copy-link", CopyLink)
