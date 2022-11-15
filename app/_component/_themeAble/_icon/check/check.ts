import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class CheckIcon extends Icon {
  constructor() {
    super()

  }

  pug() {
    return require("./check.pug") 
  }
}

declareComponent("check-icon", CheckIcon)