import declareComponent from "../../../../lib/declareComponent"
import Link from "../link";


export default class CopyLink extends Link {
  constructor(content: string, copyText: string = content) {
    super(content)
  }

  // who is supposed to call this? Maybe just revert to record?
  async minimalContentPaint() {
    if (this.copyNeeded) await import("copy-to-clipboard").then(this.copyImports.copy.res)
  }

  async fullContentPaint() {
    if (this.copyNeeded) await import("tippy.js").then(this.copyImports.tippy.res)
  }
}

declareComponent("copy-link", CopyLink)
