import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class TagAccent extends Icon {
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
    return require("./tagAccent.pug").default
  }
}

declareComponent("tag-accent", TagAccent)
