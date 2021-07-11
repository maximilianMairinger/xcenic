import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class TgmLogoDots extends Icon {
  private main = this.q("g#body") as SVGElement
  constructor() {
    super()

    this.main.apd(require("./oneDot.pug").default)
    const template = this.main.childs() as HTMLElement
    template.css("transform", "translate(0 0)")
    let outer = 0
    let inner = 1
    for (; outer < 26; outer++) {
      const outerMargin = outer * 11
      for (; inner < 26; inner++) {
        const node = template.cloneNode() as SVGElement
        node.setAttribute("transform", `translate(${inner * 11} ${outerMargin})`)
        this.main.apd(node)
      }
      inner = 0
    }
    
    template.cloneNode()
  }


  pug() {
    return require("./tgmLogoDots.pug").default
  }
}

declareComponent("tgm-logo-dots", TgmLogoDots)
