import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class AccentTag extends Icon {
  private tagElem = this.q("#tag > tspan")
  private tagDescElem = this.q("#tagDesc > tspan")
  constructor() {
    super()

  }

  public tag(to: string) {
    this.tagElem.html(to)
  }

  public tagDesc(to: string) {
    this.tagDescElem.html(to)
  }


  pug() {
    return require("./accentTag.pug").default
  }
}

declareComponent("accent-tag", AccentTag)
