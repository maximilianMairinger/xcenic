import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class Lines extends Icon {
  constructor() {
    super()

  }

  pug() {
    return require("./lines.pug").default
  }
}

declareComponent("lines", Lines)