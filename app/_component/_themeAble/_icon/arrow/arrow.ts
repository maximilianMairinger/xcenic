import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class ArrowIcon extends Icon {
  constructor() {
    super()

  }

  pug() {
    return require("./arrow.pug") 
  }
}

declareComponent("arrow-icon", ArrowIcon)