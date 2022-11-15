import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class SmallLogo extends Icon {
  constructor() {
    super()

  }

  pug() {
    return require("./smallLogo.pug") 
  }
}

declareComponent("small-logo", SmallLogo)