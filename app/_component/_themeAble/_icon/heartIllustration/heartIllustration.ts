import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class HeartIllustration extends Icon {
  constructor() {
    super()

  }

  pug() {
    return require("./heartIllustration.pug") 
  }
}

declareComponent("heart-illustration", HeartIllustration)