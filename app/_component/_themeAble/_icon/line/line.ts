import Icon from "../icon";
import declareComponent from "../../../../lib/declareComponent";




export default class Line extends Icon {
  constructor() {
    super()

  }

  pug() {
    return require("./line.pug") 
  }
}

declareComponent("line", Line)